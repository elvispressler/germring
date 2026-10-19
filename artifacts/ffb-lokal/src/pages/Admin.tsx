import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { adminFetch, readApiError } from "@/lib/adminFetch";

const CATEGORIES = [
  { id: 1, label: "Energie & Erneuerbare", hint: "z. B. neue Solaranlage, Windrad, Geothermie-Projekt, Netzausbau …" },
  { id: 2, label: "Kommunalpolitik", hint: "z. B. Stadtratsbeschluss, Haushalt, Bürgerentscheid, Bauleitplanung …" },
  { id: 3, label: "Zahlen & Daten", hint: "z. B. aktuelle Klimadaten, PV-Zubau-Statistik, CO₂-Bilanz …" },
  { id: 4, label: "Praxis & Zukunft", hint: "z. B. Ratgeber Wärmepumpe, Förderung beantragen, Energiesparen …" },
];

const STYLE_HINTS: Record<number, string> = {
  1: "Faktenbezogen, lokaler Bezug (Landkreis FFB). Struktur: Ort/Status/Daten als Kopfzeilen, dann 2–3 Absätze Fließtext, abschließend Einordnung für Bürger.",
  2: "Sachlich, keine Wertung jenseits der Fakten. Struktur: Datum/Institution/Beschluss als Kopfzeilen, dann Hintergrund und Einordnung.",
  3: "Zahlengetrieben. Struktur: 3 Kennzahlen als Kopfzeilen, dann Einordnung in Prosaform. Zahlen immer mit Zeitraum.",
  4: "Praxisorientiert, Leser = Hausbesitzer oder Bürger im Landkreis. Struktur: Thema, Optionen/Schritte, konkreter Handlungsschritt, Zukunftsaspekt.",
};

function slugify(text: string) {
  return text
    .toLowerCase().trim()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

type GenResult = { title: string; excerpt: string; content: string; tags: string[] };
type Source = { label: string; url: string };
type PhotoMigrationResult = {
  total: number;
  migrated: number;
  failed: number;
  results: Array<{
    articleId: number;
    title: string;
    status: "migrated" | "failed";
    message?: string;
  }>;
};
type ReviewIdea = {
  id: number;
  title: string;
  category: string;
  message: string;
  authorName: string | null;
  authorEmail: string;
  createdAt: string;
};

const IDEA_CATEGORY_LABELS: Record<string, string> = {
  energie: "Energie & Erneuerbare",
  kommunal: "Kommunalpolitik",
  praxis: "Praxis & Zukunft",
  zahlen: "Zahlen & Daten",
  sonstiges: "Sonstiges",
};

function IdeeModeration() {
  const [ideen, setIdeen] = useState<ReviewIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const { toast } = useToast();

  const loadIdeas = async () => {
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await adminFetch(`${base}/api/admin/mitmachen/ideen`);
      if (!res.ok) throw new Error(await readApiError(res, "Ideen konnten nicht geladen werden."));
      setIdeen(await res.json() as ReviewIdea[]);
    } catch (error) {
      toast({ title: "Moderation konnte nicht geladen werden", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadIdeas();
  }, []);

  const moderate = async (id: number, status: "approved" | "rejected") => {
    setBusyId(id);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await adminFetch(`${base}/api/admin/mitmachen/ideen/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote: notes[id] ?? "" }),
      });
      if (!res.ok) throw new Error(await readApiError(res, "Idee konnte nicht geprüft werden."));
      setIdeen(prev => prev.filter(idee => idee.id !== id));
      toast({
        title: status === "approved" ? "Idee veröffentlicht" : "Idee abgelehnt",
        description: status === "approved" ? "Die Idee ist jetzt im öffentlichen Ideenboard sichtbar." : "Die Idee bleibt nicht öffentlich.",
      });
    } catch (error) {
      toast({ title: "Prüfung fehlgeschlagen", description: String(error), variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mb-10 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-800/40 dark:bg-amber-950/10">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Redaktionelle Kontrolle</p>
          <h2 className="mt-1 text-xl font-bold text-amber-950 dark:text-amber-100">Ideen vor Veröffentlichung prüfen</h2>
          <p className="mt-1 text-sm text-amber-800/75 dark:text-amber-200/70">
            Neue Einreichungen bleiben privat, bis du sie freigibst.
          </p>
        </div>
        {!loading && (
          <span className="shrink-0 rounded-full bg-amber-200/70 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
            {ideen.length} offen
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-amber-200/70 bg-white/60 p-4 text-sm text-amber-800 dark:border-amber-800/30 dark:bg-black/10 dark:text-amber-200">
          Einreichungen werden geladen …
        </div>
      ) : ideen.length === 0 ? (
        <div className="rounded-xl border border-amber-200/70 bg-white/60 p-4 text-sm text-amber-800 dark:border-amber-800/30 dark:bg-black/10 dark:text-amber-200">
          Keine ungeprüften Ideen. Sobald eine neue Einreichung eingeht, erscheint sie hier.
        </div>
      ) : (
        <div className="space-y-4">
          {ideen.map(idee => (
            <article key={idee.id} className="rounded-xl border border-amber-200/80 bg-background p-4 dark:border-amber-800/40">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {IDEA_CATEGORY_LABELS[idee.category] ?? idee.category}
                  </p>
                  <h3 className="mt-1 text-base font-bold">{idee.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(idee.createdAt).toLocaleDateString("de-DE")} · {idee.authorName || "Anonym"} · {idee.authorEmail}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{idee.message}</p>
              <textarea
                value={notes[idee.id] ?? ""}
                onChange={event => setNotes(prev => ({ ...prev, [idee.id]: event.target.value }))}
                rows={2}
                placeholder="Interne Notiz (optional, wird nicht öffentlich angezeigt)"
                className="mt-4 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={busyId === idee.id}
                  onClick={() => moderate(idee.id, "rejected")}
                  className="rounded-lg border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-50"
                >
                  Ablehnen
                </button>
                <button
                  type="button"
                  disabled={busyId === idee.id}
                  onClick={() => moderate(idee.id, "approved")}
                  className="rounded-lg bg-forest-700 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-50"
                >
                  {busyId === idee.id ? "Wird gespeichert …" : "Freigeben & veröffentlichen"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function AdminPage() {
  const [activeCat, setActiveCat] = useState(1);
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<GenResult | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [author, setAuthor] = useState("germring.de Redaktion");
  const [featured, setFeatured] = useState(false);
  const [editingContent, setEditingContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const [isPending, setIsPending] = useState(false);
  const [isMigratingPhotos, setIsMigratingPhotos] = useState(false);
  const [photoMigration, setPhotoMigration] = useState<PhotoMigrationResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  // Pick up brief pre-filled from Wochenassistent
  useEffect(() => {
    const raw = sessionStorage.getItem("wocheBrief");
    if (raw) {
      try {
        const data = JSON.parse(raw) as { brief: string; rubrikId: number; titel: string };
        if (data.rubrikId) setActiveCat(data.rubrikId);
        if (data.brief) setBrief(`${data.titel ? `Thema: ${data.titel}\n\n` : ""}${data.brief}`);
      } catch { /* ignore */ }
      sessionStorage.removeItem("wocheBrief");
    }
  }, []);

  const reset = () => {
    setBrief(""); setResult(null); setStreamText("");
    setTitle(""); setSlug(""); setSlugManual(false); setExcerpt("");
    setImageUrl(""); setFeatured(false); setEditingContent("");
    setTags([]); setTagInput("");
    setSources([]); setSourceLabel(""); setSourceUrl("");
  };

  const catHint = CATEGORIES.find(c => c.id === activeCat)?.hint ?? "";

  const buildPrompt = () => {
    const cat = CATEGORIES.find(c => c.id === activeCat)!;
    return `Du schreibst für germring.de — ein faktenbasiertes Lokalmedium für Erneuerbare Energien und Kommunalpolitik im Landkreis Fürstenfeldbruck (Bayern). Ton: sachlich, ruhig, kein Clickbait. Sprache: Deutsch (de_DE).

Rubrik: ${cat.label}
Stil: ${STYLE_HINTS[activeCat]}

Notizen des Redakteurs:
${brief.trim()}

Aufgabe: Schreibe einen vollständigen Artikel (250–450 Wörter) und liefere ihn im folgenden JSON-Format:

{
  "title": "...",
  "excerpt": "1–2 Sätze als Teaser für die Artikelvorschau",
  "content": "Volltext mit Absätzen (Leerzeile zwischen Absätzen). Kein Markdown, kein HTML, nur Klartext.",
  "tags": ["tag1", "tag2", "tag3"]
}

Regeln:
- title: Prägnante Überschrift, max 90 Zeichen
- excerpt: 1–2 Sätze, sachlich neugierig machen ohne Clickbait
- content: Struktur gemäß Rubrik-Stil. Nur verwenden was in den Notizen steht — nichts erfinden.
- tags: 3–5 Schlagwörter auf Deutsch. Konkrete Begriffe: Ortsnamen (z.B. "Germering"), Technologien ("Wärmepumpe", "Photovoltaik"), Institutionen ("Stadtrat", "Stadtwerke"), Themen ("Förderung", "Klimaschutz"). Keine generischen Tags wie "Energie" oder "News".
- Nur das JSON ausgeben, keine Erklärungen davor oder danach.`;
  };

  const generate = async () => {
    if (!brief.trim()) {
      toast({ title: "Bitte erst das Thema und die Fakten beschreiben", variant: "destructive" });
      return;
    }

    setStreaming(true);
    setStreamText("");
    setResult(null);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/generate/artikel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: activeCat,
          title: "generating",
          fields: { brief: buildPrompt() },
        }),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) throw new Error("Anfrage fehlgeschlagen");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.content) { full += payload.content; setStreamText(full); }
            if (payload.done || payload.error) break;
          } catch { /* partial */ }
        }
      }

      const jsonMatch = full.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Kein gültiges JSON in der Antwort");
      const parsed: GenResult = JSON.parse(jsonMatch[0]);

      setResult(parsed);
      setTitle(parsed.title);
      if (!slugManual) setSlug(slugify(parsed.title));
      setExcerpt(parsed.excerpt);
      setEditingContent(parsed.content);
      setTags(parsed.tags ?? []);
      setTagInput("");
      setStreamText("");

    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast({ title: "Generierung fehlgeschlagen", description: String(err), variant: "destructive" });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const addSource = () => {
    if (!sourceLabel.trim()) return;
    setSources([...sources, { label: sourceLabel.trim(), url: sourceUrl.trim() }]);
    setSourceLabel("");
    setSourceUrl("");
  };

  const removeSource = (i: number) => setSources(sources.filter((_, idx) => idx !== i));

  const migrateExistingPhotos = async () => {
    setIsMigratingPhotos(true);
    setPhotoMigration(null);
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    try {
      const response = await adminFetch(`${base}/api/articles/images/migrate`, { method: "POST" });
      if (!response.ok) {
        throw new Error(await readApiError(response, "Fotos konnten nicht migriert werden."));
      }
      const report = await response.json() as PhotoMigrationResult;
      setPhotoMigration(report);
      toast({
        title: report.failed > 0
          ? `${report.migrated} von ${report.total} Fotos gespeichert`
          : report.total === 0
            ? "Keine extern gespeicherten Fotos gefunden"
            : `${report.migrated} Fotos im Projektspeicher gesichert`,
        description: report.failed > 0
          ? `${report.failed} Artikel benötigen einen erneuten Versuch. Die bisherigen Bildadressen bleiben unverändert.`
          : undefined,
        variant: report.failed > 0 ? "destructive" : "default",
      });
    } catch (error) {
      toast({ title: "Bildmigration fehlgeschlagen", description: String(error), variant: "destructive" });
    } finally {
      setIsMigratingPhotos(false);
    }
  };

  const publish = async () => {
    if (!title.trim()) { toast({ title: "Titel fehlt", variant: "destructive" }); return; }
    if (!slug.trim()) { toast({ title: "Slug fehlt", variant: "destructive" }); return; }
    if (!excerpt.trim()) { toast({ title: "Teaser fehlt", variant: "destructive" }); return; }
    if (!editingContent.trim()) { toast({ title: "Inhalt fehlt", variant: "destructive" }); return; }
    if (!imageUrl.trim()) { toast({ title: "Artikelbild fehlt", description: "Bitte vor der Veröffentlichung ein thematisch passendes Foto angeben.", variant: "destructive" }); return; }

    const sourcesPayload = sources
      .filter(s => s.label.trim())
      .map(s => ({ label: s.label, ...(s.url ? { url: s.url } : {}) }));

    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const body = { title, slug, excerpt, content: editingContent, categoryId: activeCat, author, imageUrl: imageUrl || undefined, featured, tags, sources: sourcesPayload };

    setIsPending(true);
    try {
      const res = await adminFetch(`${base}/api/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const json = await res.json() as { error?: string };
          detail = json.error ?? "";
        } catch { /* ignore */ }

        // Slug-Konflikt erkennen
        if (res.status === 500 && detail.toLowerCase().includes("unique")) {
          toast({
            title: "Slug bereits vergeben",
            description: `Der Pfad „/${slug}" existiert bereits. Bitte Slug anpassen (z. B. Datum anhängen).`,
            variant: "destructive",
          });
        } else {
          toast({
            title: `Fehler beim Veröffentlichen (${res.status})`,
            description: detail || "Unbekannter Serverfehler",
            variant: "destructive",
          });
        }
        return;
      }

      const article = await res.json() as { id: number };
      toast({ title: "Artikel veröffentlicht!", description: `→ /artikel/${article.id}` });
      reset();
    } catch (err) {
      toast({ title: "Netzwerkfehler", description: String(err), variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <IdeeModeration />
      <section className="mb-8 rounded-2xl border border-forest-200 bg-forest-50/60 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-forest-600">Bildspeicher</p>
            <h2 className="mt-1 text-lg font-bold text-forest-900">Vorhandene Artikelbilder sichern</h2>
            <p className="mt-1 max-w-xl text-sm text-forest-700/80">
              Externe Fotos werden unverändert in den Projektspeicher kopiert. Quellenangaben bleiben erhalten;
              bei Fehlern wird die bisherige Bildadresse nicht geändert.
            </p>
          </div>
          <button
            type="button"
            onClick={migrateExistingPhotos}
            disabled={isMigratingPhotos}
            className="shrink-0 rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-50"
          >
            {isMigratingPhotos ? "Fotos werden gesichert …" : "Vorhandene Fotos sichern"}
          </button>
        </div>
        {photoMigration && photoMigration.failed > 0 && (
          <div className="mt-4 rounded-xl border border-red-200 bg-white p-4">
            <p className="text-sm font-semibold text-red-800">Diese Artikel konnten nicht migriert werden:</p>
            <ul className="mt-2 space-y-2">
              {photoMigration.results.filter(item => item.status === "failed").map(item => (
                <li key={item.articleId} className="text-sm text-red-800">
                  <span className="font-semibold">#{item.articleId} · {item.title}</span>
                  <span className="block text-xs text-red-700/80">{item.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold text-forest-900">Neuer Artikel</h1>
        <div className="flex items-center gap-4 mt-1">
          <Link href="/admin/foerderung" className="text-sm text-forest-600 underline underline-offset-2 hover:text-forest-900">
            Förderlinks prüfen
          </Link>
          <Link href="/admin/bilder" className="text-sm text-forest-600 underline underline-offset-2 hover:text-forest-900">
            Artikelbilder pflegen
          </Link>
          <Link href="/admin/woche" className="text-sm text-forest-600 underline underline-offset-2 hover:text-forest-900">
            Wochenassistent
          </Link>
        </div>
      </div>
      <p className="text-sm text-forest-500 mb-8">
        Rubrik wählen → Stichpunkte reinschreiben → KI generiert den Artikel → prüfen & veröffentlichen.
      </p>

      {/* Step 1 — Category */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-forest-500 uppercase tracking-wider mb-3">1 — Rubrik</p>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCat(cat.id); setResult(null); setStreamText(""); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCat === cat.id
                  ? "bg-forest-700 text-white"
                  : "bg-forest-100 text-forest-700 hover:bg-forest-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — Brief */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-forest-500 uppercase tracking-wider mb-3">2 — Thema & Fakten</p>
        <p className="text-xs text-forest-400 mb-2">
          {catHint} Stichpunkte genügen — die KI baut daraus den Artikel.
        </p>
        <textarea
          value={brief}
          onChange={e => setBrief(e.target.value)}
          rows={6}
          placeholder={
            "Beispiel:\n- Solaranlage auf dem Puchheimer Hallenbad\n- 85 kWp Leistung, Inbetriebnahme Juli 2026\n- Kosten: 98.000 €, davon 35 % Förderung\n- Spart ca. 22.000 € Stromkosten pro Jahr\n- Betreiber: Stadtwerke Puchheim"
          }
          className="w-full border border-forest-200 rounded-xl px-4 py-3 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400 resize-y text-sm leading-relaxed"
        />
      </div>

      {/* Generate button / streaming */}
      <div className="mb-8">
        {streaming ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-forest-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-forest-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-forest-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm text-forest-600 font-medium">Claude schreibt…</span>
              <button
                onClick={() => { abortRef.current?.abort(); setStreaming(false); }}
                className="ml-auto text-xs text-forest-400 hover:text-forest-700 underline"
              >
                Abbrechen
              </button>
            </div>
            {streamText && (
              <pre className="bg-forest-50 border border-forest-100 rounded-xl p-4 text-xs text-forest-700 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                {streamText}
              </pre>
            )}
          </div>
        ) : (
          <button
            onClick={generate}
            className="w-full py-3 bg-forest-700 hover:bg-forest-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            <span>✦</span>
            <span>Artikel generieren</span>
          </button>
        )}
      </div>

      {/* Step 3 — Review & publish */}
      {result && (
        <div className="border-t border-forest-100 pt-8 space-y-5">
          <p className="text-xs font-semibold text-forest-500 uppercase tracking-wider">3 — Prüfen & anpassen</p>

          <div>
            <label className="block text-sm font-medium text-forest-800 mb-1">Titel</label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); if (!slugManual) setSlug(slugify(e.target.value)); }}
              className="w-full border border-forest-200 rounded-lg px-3 py-2 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-800 mb-1">
              Slug <span className="text-xs text-forest-400 ml-1">(URL-Pfad)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={e => { setSlugManual(true); setSlug(e.target.value); }}
              className="w-full border border-forest-200 rounded-lg px-3 py-2 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-800 mb-1">Teaser</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              rows={2}
              className="w-full border border-forest-200 rounded-lg px-3 py-2 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400 resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-800 mb-1">
              Tags <span className="text-xs text-forest-400 ml-1">(von KI vorgeschlagen, anpassbar)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-forest-100 text-forest-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  #{tag}
                  <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500 ml-0.5 leading-none">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                    e.preventDefault();
                    const t = tagInput.trim().replace(/^#/, "");
                    if (t && !tags.includes(t)) setTags([...tags, t]);
                    setTagInput("");
                  }
                }}
                placeholder="Tag eingeben + Enter"
                className="flex-1 border border-forest-200 rounded-lg px-3 py-1.5 text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
              <button
                onClick={() => {
                  const t = tagInput.trim().replace(/^#/, "");
                  if (t && !tags.includes(t)) setTags([...tags, t]);
                  setTagInput("");
                }}
                className="px-3 py-1.5 border border-forest-200 rounded-lg text-sm text-forest-600 hover:bg-forest-50"
              >
                + Hinzufügen
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-forest-800">Artikeltext</label>
              <button
                onClick={generate}
                disabled={streaming}
                className="text-xs text-forest-500 underline underline-offset-2 hover:text-forest-800 disabled:opacity-40"
              >
                Neu generieren
              </button>
            </div>
            <textarea
              value={editingContent}
              onChange={e => setEditingContent(e.target.value)}
              rows={14}
              className="w-full border border-forest-200 rounded-lg px-3 py-2 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400 resize-y text-sm leading-relaxed"
            />
          </div>

          {/* Sources */}
          <div>
            <label className="block text-sm font-medium text-forest-800 mb-1">
              Quellen <span className="text-xs text-forest-400 ml-1">(optional — werden am Artikelende angezeigt)</span>
            </label>
            {sources.length > 0 && (
              <ul className="mb-3 space-y-1.5">
                {sources.map((src, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm bg-forest-50 rounded-lg px-3 py-2">
                    <span className="flex-1 text-forest-700 truncate">
                      {src.label}{src.url && <span className="text-forest-400 ml-1 text-xs">({src.url})</span>}
                    </span>
                    <button
                      onClick={() => removeSource(i)}
                      className="text-forest-300 hover:text-red-500 leading-none shrink-0"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={sourceLabel}
                onChange={e => setSourceLabel(e.target.value)}
                placeholder="Bezeichnung, z. B. Bundesnetzagentur, 2025"
                className="flex-1 border border-forest-200 rounded-lg px-3 py-1.5 text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSource(); } }}
              />
              <input
                type="text"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="URL (optional)"
                className="w-48 border border-forest-200 rounded-lg px-3 py-1.5 text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400 font-mono"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSource(); } }}
              />
              <button
                onClick={addSource}
                className="px-3 py-1.5 border border-forest-200 rounded-lg text-sm text-forest-600 hover:bg-forest-50 shrink-0"
              >
                + Hinzufügen
              </button>
            </div>
            <p className="text-xs text-forest-400 mt-1.5">
              Primär- und Sekundärquellen: Pressemitteilungen, Studien, Behördenwebseiten, offizielle Statistiken.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-800 mb-1">
              Bild-URL <span className="text-xs text-forest-400 ml-1">(erforderlich, wird beim Veröffentlichen gesichert)</span>
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="w-full border border-forest-200 rounded-lg px-3 py-2 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400 text-sm font-mono"
            />
          </div>

          <div className="flex items-center gap-6">
            <div>
              <label className="block text-sm font-medium text-forest-800 mb-1">Autor</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="border border-forest-200 rounded-lg px-3 py-2 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={featured}
                onChange={e => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-forest-700"
              />
              <span className="text-sm font-medium text-forest-800">Featured (Hero auf Startseite)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={publish}
              disabled={isPending}
              className="flex-1 py-3 bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              {isPending ? "Wird veröffentlicht…" : "Artikel veröffentlichen"}
            </button>
            <button
              onClick={reset}
              className="px-5 py-3 border border-forest-200 text-forest-600 hover:bg-forest-50 rounded-xl text-sm font-medium transition-colors"
            >
              Neu starten
            </button>
          </div>

          <p className="text-xs text-forest-400 text-center">
            Unsplash: Bild öffnen → rechtsklick → Bildadresse kopieren, <code className="bg-forest-50 px-1 rounded">?w=1200&q=80</code> anhängen
          </p>
        </div>
      )}
    </div>
  );
}
