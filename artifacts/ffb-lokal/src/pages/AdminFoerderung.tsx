import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  getFundingLinkCheckItems,
  type FundingLinkCheckItem,
} from "@/data/foerderungen";
import { adminFetch, AdminAuthError, readApiError } from "@/lib/adminFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type CheckStatus = "ok" | "redirect" | "changed" | "error" | "not_checked";

type LinkCheckResult = FundingLinkCheckItem & {
  checkedAt: string | null;
  status: number | null;
  statusKind: CheckStatus;
  finalUrl: string | null;
  redirected: boolean;
  redirectCount: number;
  redirectWarning: boolean;
  changedSinceLastCheck: boolean;
  firstCheck: boolean;
  previousCheckedAt: string | null;
  pageTitle: string | null;
  contentType: string | null;
  contentLength: number | null;
  contentDiff: ContentDiff | null;
  error: string | null;
};

type ApiLinkCheckResult = Omit<LinkCheckResult, "url"> & { url?: string };
type RepairCheckResult = {
  sourceId: string;
  url: string;
  eligible: boolean;
  reachable: boolean;
  status: number | null;
  finalUrl: string | null;
  pageTitle: string | null;
  error: string | null;
};
type ContentFocus = "amount" | "deadline" | "condition";
type ContentDiff = {
  available: boolean;
  changed: boolean;
  previousCheckedAt: string | null;
  before: string | null;
  after: string | null;
  focus: ContentFocus[];
};

function initialResults(items: FundingLinkCheckItem[]): LinkCheckResult[] {
  return items.map((item) => ({
    ...item,
    checkedAt: null,
    status: null,
    statusKind: "not_checked",
    finalUrl: null,
    redirected: false,
    redirectCount: 0,
    redirectWarning: false,
    changedSinceLastCheck: false,
    firstCheck: true,
    previousCheckedAt: null,
    pageTitle: null,
    contentType: null,
    contentLength: null,
    contentDiff: null,
    error: null,
  }));
}

function mergeResults(
  items: FundingLinkCheckItem[],
  rawResults: ApiLinkCheckResult[],
): LinkCheckResult[] {
  const bySource = new Map(
    rawResults.map((result) => [result.sourceId, result]),
  );
  return items.map((item) => {
    const fallback = initialResults([item])[0];
    return {
      ...fallback,
      ...bySource.get(item.sourceId),
      url: bySource.get(item.sourceId)?.url ?? item.url,
    };
  });
}

function formatDate(value: string | null): string {
  if (!value) return "noch nicht";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(result: LinkCheckResult): string {
  if (result.statusKind === "error") return "Fehler";
  if (result.statusKind === "changed") return "Inhalt geändert";
  if (result.statusKind === "redirect") return "Weiterleitung";
  if (result.statusKind === "ok") return "Erreichbar";
  return "Noch nicht geprüft";
}

function statusClasses(status: CheckStatus): string {
  if (status === "error") return "bg-red-50 text-red-800 border-red-200";
  if (status === "changed")
    return "bg-amber-50 text-amber-900 border-amber-200";
  if (status === "redirect")
    return "bg-violet-50 text-violet-900 border-violet-200";
  if (status === "ok")
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
}

const focusLabels: Record<ContentFocus, string> = {
  amount: "Beträge",
  deadline: "Fristen",
  condition: "Förderbedingungen",
};

const focusPatterns: Array<{ focus: ContentFocus; pattern: RegExp }> = [
  {
    focus: "amount",
    pattern:
      /\b\d[\d.\s]*(?:,\d+)?\s*(?:€|EUR|Euro|%|Prozent)\b|(?:€|EUR|Euro|%|Prozent)/i,
  },
  {
    focus: "deadline",
    pattern:
      /\b(?:frist|bis zum|spätestens|innerhalb|ab dem|gültig|beantragen bis|202[0-9]|203[0-9])\b/i,
  },
  {
    focus: "condition",
    pattern:
      /\b(?:voraussetzung|förderfähig|förderung|antrag|vorhabenbeginn|berechtigt|ausgeschlossen|muss|kann|nur wenn|mindestens|maximal|höchstens|bedingung|einkommen)\b/i,
  },
];

function highlightText(text: string) {
  const parts = text.split(/(\s+)/);
  return parts.map((part, index) => {
    const focus = focusPatterns.find(({ pattern }) =>
      pattern.test(part),
    )?.focus;
    if (!focus) return <span key={`${part}-${index}`}>{part}</span>;
    return (
      <mark
        key={`${part}-${index}`}
        className={
          focus === "amount"
            ? "rounded bg-amber-200 px-0.5 text-amber-950"
            : focus === "deadline"
              ? "rounded bg-rose-200 px-0.5 text-rose-950"
              : "rounded bg-sky-200 px-0.5 text-sky-950"
        }
        title={focusLabels[focus]}
      >
        {part}
      </mark>
    );
  });
}

function ContentComparison({ diff }: { diff: ContentDiff }) {
  if (!diff.available) {
    return (
      <p className="mt-3 rounded-lg border border-forest-100 bg-forest-50 p-3 text-xs text-forest-600">
        Ein Vorher-/Nachher-Vergleich ist für diese Quelle noch nicht verfügbar.
        Der Text wird ab dem nächsten erfolgreichen Check archiviert.
      </p>
    );
  }
  if (!diff.changed) return null;

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold text-amber-950">Vorher / Nachher</p>
        {diff.focus.map((focus) => (
          <span
            key={focus}
            className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200"
          >
            {focusLabels[focus]} prüfen
          </span>
        ))}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-red-800">
            Vorher · {formatDate(diff.previousCheckedAt)}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-red-950">
            {diff.before
              ? highlightText(diff.before)
              : "Kein vorheriger Text gespeichert."}
          </p>
        </div>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
            Nachher
          </p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-emerald-950">
            {diff.after
              ? highlightText(diff.after)
              : "Kein aktueller Text gespeichert."}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-amber-900">
        Markiert sind erkannte Beträge, Fristen und typische Förderbedingungen.
        Die redaktionelle Prüfung erfolgt weiterhin im Original.
      </p>
    </div>
  );
}

function StatusDot({ status }: { status: CheckStatus }) {
  const color =
    status === "error"
      ? "bg-red-500"
      : status === "changed"
        ? "bg-amber-500"
        : status === "redirect"
          ? "bg-violet-500"
          : status === "ok"
            ? "bg-emerald-500"
            : "bg-gray-400";
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${color}`}
      aria-hidden="true"
    />
  );
}

export function AdminFoerderungPage() {
  const items = useMemo(
    () => getFundingLinkCheckItems(window.location.origin, BASE || "/"),
    [],
  );
  const [results, setResults] = useState<LinkCheckResult[]>(() =>
    initialResults(items),
  );
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [repairSourceId, setRepairSourceId] = useState<string | null>(null);
  const [replacementUrl, setReplacementUrl] = useState("");
  const [repairCheck, setRepairCheck] = useState<RepairCheckResult | null>(null);
  const [repairBusy, setRepairBusy] = useState(false);
  const [schedule, setSchedule] = useState<{
    intervalHours: number;
    alertConfigured: boolean;
  } | null>(null);

  const loadLastCheck = async () => {
    try {
      const response = await adminFetch(
        `${BASE}/api/admin/foerder-links/status`,
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            `Laden fehlgeschlagen (HTTP ${response.status})`,
          ),
        );
      }
      const data = (await response.json()) as {
        checkedAt: string | null;
        schedule?: {
          intervalHours: number;
          alertConfigured: boolean;
        };
        results: ApiLinkCheckResult[];
      };
      setLastCheckedAt(data.checkedAt);
      setSchedule(data.schedule ?? null);
      setResults(mergeResults(items, data.results));
    } catch (requestError) {
      if (!(requestError instanceof AdminAuthError)) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Der letzte Linkcheck konnte nicht geladen werden.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLastCheck();
  }, []);

  const runCheck = async () => {
    setChecking(true);
    setError("");
    try {
      const response = await adminFetch(
        `${BASE}/api/admin/foerder-links/check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ links: items }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            `Linkcheck fehlgeschlagen (HTTP ${response.status})`,
          ),
        );
      }
      const data = (await response.json()) as {
        checkedAt: string;
        results: ApiLinkCheckResult[];
      };
      setLastCheckedAt(data.checkedAt);
      setResults(mergeResults(items, data.results));
    } catch (requestError) {
      if (!(requestError instanceof AdminAuthError)) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Der Linkcheck konnte nicht abgeschlossen werden.",
        );
      }
    } finally {
      setChecking(false);
    }
  };

  const checkReplacement = async () => {
    if (!repairSourceId || !replacementUrl.trim()) return;
    setRepairBusy(true);
    setError("");
    setRepairCheck(null);
    try {
      const response = await adminFetch(
        `${BASE}/api/admin/foerder-links/repair-check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceId: repairSourceId,
            url: replacementUrl.trim(),
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, `Prüfung fehlgeschlagen (HTTP ${response.status})`),
        );
      }
      setRepairCheck((await response.json()) as RepairCheckResult);
    } catch (requestError) {
      if (!(requestError instanceof AdminAuthError)) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Die Ersatzadresse konnte nicht geprüft werden.",
        );
      }
    } finally {
      setRepairBusy(false);
    }
  };

  const saveReplacement = async () => {
    if (
      !repairSourceId ||
      !repairCheck?.reachable ||
      repairCheck.url !== replacementUrl.trim()
    ) {
      return;
    }
    setRepairBusy(true);
    setError("");
    try {
      const response = await adminFetch(
        `${BASE}/api/admin/foerder-links/repair`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceId: repairSourceId,
            url: replacementUrl.trim(),
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, `Übernahme fehlgeschlagen (HTTP ${response.status})`),
        );
      }
      setRepairSourceId(null);
      setReplacementUrl("");
      setRepairCheck(null);
      await loadLastCheck();
    } catch (requestError) {
      if (!(requestError instanceof AdminAuthError)) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Das Ziel konnte nicht übernommen werden.",
        );
      }
    } finally {
      setRepairBusy(false);
    }
  };

  const summary = results.reduce(
    (counts, result) => {
      if (result.statusKind === "error") counts.errors += 1;
      if (result.redirected) counts.redirects += 1;
      if (result.statusKind === "changed") counts.changed += 1;
      if (result.statusKind === "ok") counts.ok += 1;
      return counts;
    },
    { ok: 0, errors: 0, redirects: 0, changed: 0 },
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="text-xs font-semibold text-forest-500 uppercase tracking-wider mb-2">
            Redaktion · Quellenpflege
          </p>
          <h1 className="text-2xl font-bold text-forest-900">
            Förderlinks prüfen
          </h1>
          <p className="text-sm text-forest-500 mt-1">
            Alle {items.length} Quellen aus dem Förderkompass auf
            Erreichbarkeit, Weiterleitungen und sichtbare Inhaltsänderungen
            prüfen.
          </p>
        </div>
        <Link
          href="/admin"
          className="shrink-0 text-sm text-forest-600 underline underline-offset-2 hover:text-forest-900"
        >
          Zurück zum Admin
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-forest-100 bg-forest-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-forest-900">
              Letzter Check: {formatDate(lastCheckedAt)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-forest-600">
              Inhaltsänderungen werden mit dem vorherigen erfolgreichen Check
              derselben Quelle verglichen.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-forest-600">
              Automatischer Redaktionslauf: alle{" "}
              {schedule
                ? schedule.intervalHours % 24 === 0
                  ? `${schedule.intervalHours / 24} Tage`
                  : `${schedule.intervalHours} Stunden`
                : "7 Tage"}{" "}
              serverseitig. Auffälligkeiten werden per E-Mail gemeldet.
              {schedule && !schedule.alertConfigured && (
                <span className="font-semibold text-amber-800">
                  {" "}
                  Für E-Mail-Meldungen ist noch keine Empfängeradresse
                  konfiguriert.
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void runCheck()}
            disabled={checking || loading}
            className="rounded-lg bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking ? "Quellen werden geprüft …" : "Jetzt prüfen"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Erreichbar", summary.ok, "text-emerald-700"],
          ["Weiterleitungen", summary.redirects, "text-violet-700"],
          ["Inhalt geändert", summary.changed, "text-amber-700"],
          ["Fehler", summary.errors, "text-red-700"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-xl border border-forest-100 bg-white p-4"
          >
            <p className="text-xs text-forest-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-forest-500 uppercase tracking-wider">
              Prüfergebnis je Quelle
            </p>
            <p className="mt-1 text-xs text-forest-400">
              Zuletzt geprüft: {formatDate(lastCheckedAt)}
            </p>
          </div>
          <span className="text-xs text-forest-400">
            {items.length} Quellen
          </span>
        </div>

        {results.map((result) => (
          <article
            key={result.sourceId}
            className="rounded-xl border border-forest-100 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-forest-400">
                  {result.programTitle}
                </p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block truncate text-sm font-semibold text-forest-900 underline decoration-forest-200 underline-offset-2 hover:text-forest-700"
                >
                  {result.label}
                </a>
                <p className="mt-1 truncate font-mono text-[11px] text-forest-400">
                  {result.url}
                </p>
              </div>
              <span
                className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(result.statusKind)}`}
              >
                <StatusDot status={result.statusKind} />
                {statusLabel(result)}
                {result.status && (
                  <span className="font-normal">· {result.status}</span>
                )}
              </span>
            </div>

            <div className="mt-3 border-t border-forest-50 pt-3 text-xs leading-relaxed text-forest-600">
              {result.statusKind === "not_checked" && (
                <p>Noch kein Ergebnis vorhanden.</p>
              )}
              {result.statusKind === "ok" && (
                <p>
                  {result.pageTitle
                    ? `Seitentitel: ${result.pageTitle}`
                    : "Antwort erfolgreich geprüft."}
                </p>
              )}
              {result.statusKind === "changed" && (
                <p className="font-semibold text-amber-800">
                  Der sichtbare Seiteninhalt unterscheidet sich vom Check am{" "}
                  {formatDate(result.previousCheckedAt)}. Förderbedingungen
                  bitte redaktionell gegenprüfen.
                </p>
              )}
              {result.statusKind === "redirect" && (
                <p
                  className={
                    result.redirectWarning
                      ? "font-semibold text-violet-800"
                      : ""
                  }
                >
                  {result.redirectWarning
                    ? "Auffällige Weiterleitung"
                    : "Weiterleitung erkannt"}{" "}
                  ({result.redirectCount} Schritt
                  {result.redirectCount === 1 ? "" : "e"}).
                  {result.finalUrl && result.finalUrl !== result.url && (
                    <>
                      {" "}
                      Ziel:{" "}
                      <span className="break-all font-mono">
                        {result.finalUrl}
                      </span>
                    </>
                  )}
                </p>
              )}
              {result.statusKind === "error" && (
                <p className="font-semibold text-red-800">
                  {result.error ?? "Unbekannter Fehler bei der Prüfung."}
                </p>
              )}
              {result.redirected && result.statusKind !== "redirect" && (
                <p className="mt-1 text-violet-800">
                  Zusätzlich {result.redirectWarning ? "auffällige " : ""}
                  Weiterleitung erkannt ({result.redirectCount} Schritt
                  {result.redirectCount === 1 ? "" : "e"}).
                  {result.finalUrl && result.finalUrl !== result.url && (
                    <>
                      {" "}
                      Ziel:{" "}
                      <span className="break-all font-mono">
                        {result.finalUrl}
                      </span>
                    </>
                  )}
                </p>
              )}
              {result.checkedAt && (
                <p className="mt-1 text-forest-400">
                  Geprüft am {formatDate(result.checkedAt)}
                </p>
              )}
              {result.contentDiff && (
                <ContentComparison diff={result.contentDiff} />
              )}
            </div>
            {result.status === 404 && (
              <div className="mt-4 border-t border-forest-50 pt-3">
                {repairSourceId !== result.sourceId ? (
                  <div>
                    <p className="text-xs text-red-800">
                      Nur dieser HTTP-404-Fehler kann über diesen Ablauf repariert werden.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRepairSourceId(result.sourceId);
                        setReplacementUrl("");
                        setRepairCheck(null);
                        setError("");
                      }}
                      className="mt-2 rounded-lg border border-forest-200 px-3 py-2 text-xs font-semibold text-forest-800 hover:bg-forest-50"
                    >
                      Ersatzadresse eintragen
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <label
                      htmlFor={`replacement-${result.sourceId}`}
                      className="block text-xs font-semibold text-forest-900"
                    >
                      Neue Zieladresse (HTTP oder HTTPS)
                    </label>
                    <input
                      id={`replacement-${result.sourceId}`}
                      type="url"
                      inputMode="url"
                      required
                      value={replacementUrl}
                      onChange={(event) => {
                        setReplacementUrl(event.target.value);
                        setRepairCheck(null);
                      }}
                      placeholder="https://www.beispiel.de/foerderung"
                      className="mt-2 w-full rounded-lg border border-forest-200 bg-white px-3 py-2 text-sm text-forest-900 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={repairBusy || !replacementUrl.trim()}
                        onClick={() => void checkReplacement()}
                        className="rounded-lg bg-forest-700 px-3 py-2 text-xs font-semibold text-white hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {repairBusy ? "Wird geprüft …" : "Ersatzadresse prüfen"}
                      </button>
                      <button
                        type="button"
                        disabled={repairBusy}
                        onClick={() => {
                          setRepairSourceId(null);
                          setReplacementUrl("");
                          setRepairCheck(null);
                        }}
                        className="rounded-lg border border-forest-200 px-3 py-2 text-xs font-semibold text-forest-700 hover:bg-white disabled:opacity-50"
                      >
                        Abbrechen
                      </button>
                    </div>
                    {repairCheck?.url === replacementUrl.trim() && (
                      <div
                        className={`mt-3 rounded-lg border p-3 text-xs ${
                          repairCheck.reachable
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-red-200 bg-red-50 text-red-900"
                        }`}
                        role="status"
                      >
                        {repairCheck.reachable ? (
                          <>
                            <p className="font-semibold">
                              Ziel erreichbar (HTTP {repairCheck.status}).
                            </p>
                            {repairCheck.finalUrl &&
                              repairCheck.finalUrl !== repairCheck.url && (
                                <p className="mt-1 break-all">
                                  Weitergeleitet zu: {repairCheck.finalUrl}
                                </p>
                              )}
                            <p className="mt-1">
                              Bitte prüfe, ob dies die richtige offizielle Förderseite ist.
                              Erst die folgende Bestätigung speichert die Adresse dauerhaft.
                            </p>
                            <button
                              type="button"
                              disabled={repairBusy}
                              onClick={() => void saveReplacement()}
                              className="mt-3 rounded-lg bg-emerald-800 px-3 py-2 font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {repairBusy
                                ? "Wird übernommen …"
                                : "Geprüftes Ziel dauerhaft übernehmen"}
                            </button>
                          </>
                        ) : (
                          <p className="font-semibold">
                            Nicht erfolgreich erreichbar
                            {repairCheck.status ? ` (HTTP ${repairCheck.status})` : ""}.
                            {repairCheck.error ? ` ${repairCheck.error}` : ""}
                            {" "}Die Adresse wurde nicht gespeichert.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
        <p className="font-semibold">Einordnung</p>
        <p className="mt-1">
          Ein geänderter Fingerprint bedeutet, dass sich der sichtbare Inhalt
          verändert hat; er bewertet nicht automatisch die Förderfähigkeit. Bei
          Fehlern, Weiterleitungen oder Inhaltsänderungen die Originalseite
          öffnen und die Beträge, Fristen und Bedingungen vor einer
          Aktualisierung redaktionell prüfen.
        </p>
      </div>
    </div>
  );
}
