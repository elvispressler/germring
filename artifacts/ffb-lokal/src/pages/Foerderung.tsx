import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  foerderungen,
  foerderungenStand,
  type FundingLink,
  type FundingProgram,
} from "@/data/foerderungen";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const linkKindStyles: Record<FundingLink["kind"], string> = {
  Antrag: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  Erklärung: "bg-sky-50 text-sky-800 dark:bg-sky-950/30 dark:text-sky-300",
  Beratung: "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
  "Weiterer Schritt": "bg-violet-50 text-violet-800 dark:bg-violet-950/30 dark:text-violet-300",
};

function ExternalIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 4h6m0 0v6m0-6L10 14" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

function ResourceLink({ link }: { link: FundingLink }) {
  const isInternal = link.href.startsWith("/");
  const className = "group flex items-start gap-3 rounded-xl border border-border/70 bg-background p-3.5 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]";
  const content = (
    <>
      <span className={`mt-0.5 shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${linkKindStyles[link.kind]}`}>
        {link.kind}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold leading-snug group-hover:text-primary">
          {link.label}
          {!isInternal && <ExternalIcon />}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{link.note}</span>
      </span>
    </>
  );

  return isInternal ? (
    <Link href={link.href} className={className}>{content}</Link>
  ) : (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
  );
}

function FundingProgramCard({
  program,
  open,
  onToggle,
  linkTargets,
  targetLoadFailed,
}: {
  program: FundingProgram;
  open: boolean;
  onToggle: () => void;
  linkTargets: Record<string, string>;
  targetLoadFailed: boolean;
}) {
  return (
    <article id={program.id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-5 p-5 text-left sm:p-6"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${program.id}-details`}
      >
        <span className="min-w-0">
          <span className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: program.accent }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{program.eyebrow}</span>
          </span>
          <span className="block font-serif text-xl font-bold sm:text-2xl">{program.title}</span>
          <span className="mt-1 block text-sm text-muted-foreground">{program.status}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {program.amount && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{program.amount}</span>
          )}
          <svg className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
          </svg>
        </span>
      </button>

      {open && (
        <div id={`${program.id}-details`} className="border-t border-border/70 px-5 pb-6 sm:px-6">
          <div className="grid gap-7 pt-6 lg:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)]">
            <div>
              <p className="text-base leading-7 text-foreground/85">{program.summary}</p>
              <div className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Passt zu dir, wenn …</p>
                <p className="mt-2 text-sm leading-6">{program.audience}</p>
              </div>
              <div className="mt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Dein nächster Weg</p>
                <ol className="space-y-3">
                  {program.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-6">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: program.accent }}>
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div>
              <div className="mb-4 rounded-xl bg-muted/50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Was du mitnehmen kannst</p>
                <p className="mt-1 font-semibold">{program.benefit}</p>
              </div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Direkt weiter</p>
              {targetLoadFailed && (
                <p
                  className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"
                  role="status"
                >
                  Aktualisierte Quellenziele konnten nicht geladen werden. Die
                  angezeigten Adressen entsprechen möglicherweise nicht dem
                  aktuellen Redaktionsstand.
                </p>
              )}
              <div className="grid gap-3">
                {program.links.map((link) => (
                  <ResourceLink
                    key={`${program.id}-${link.label}`}
                    link={{
                      ...link,
                      href:
                        linkTargets[`${program.id}:${link.label}`] ?? link.href,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export function FoerderungPage() {
  const [open, setOpen] = useState<string | null>("heizung");
  const [linkTargets, setLinkTargets] = useState<Record<string, string>>({});
  const [targetLoadFailed, setTargetLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch(`${BASE}/api/foerder-links/targets`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Förderlink-Ziele nicht verfügbar.");
        return (await response.json()) as {
          targets?: Array<{ sourceId?: unknown; targetUrl?: unknown }>;
        };
      })
      .then((data) => {
        if (!active) return;
        const targets: Record<string, string> = {};
        for (const target of data.targets ?? []) {
          if (
            typeof target.sourceId !== "string" ||
            typeof target.targetUrl !== "string"
          ) {
            continue;
          }
          try {
            const url = new URL(target.targetUrl);
            if (
              (url.protocol === "http:" || url.protocol === "https:") &&
              !url.username &&
              !url.password
            ) {
              targets[target.sourceId] = url.toString();
            }
          } catch {
            // Ignore invalid response entries and keep the published destination.
          }
        }
        setLinkTargets(targets);
      })
      .catch(() => {
        if (active) setTargetLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen pb-24">
      <section className="border-b bg-[linear-gradient(135deg,hsl(var(--muted)/.55),hsl(var(--background))_62%,hsl(160_30%_94%))] py-12 sm:py-16">
        <div className="container mx-auto max-w-6xl px-4 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">Praxis & Zukunft · Förderkompass</p>
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">Förderungen im Überblick</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Nicht nur lesen, sondern weiterkommen: Finde heraus, was zu deinem Vorhaben passt, welcher Schritt jetzt ansteht und wo du seriöse Hilfe bekommst.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-sm font-semibold">Stand der Quellen: {foerderungenStand.checkedLabel}</p>
              <p className="mt-1 text-xs text-muted-foreground">Offizielle Antragsseiten und neutrale Beratungsangebote, kompakt sortiert.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Quellen geprüft
            </span>
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-6xl px-4 pt-10 lg:px-8">
        <section aria-labelledby="quickstart-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Schnellstart</p>
            <h2 id="quickstart-heading" className="mt-1 font-serif text-2xl font-bold">Was möchtest du tun?</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {foerderungen.map((program) => (
              <a
                key={program.id}
                href={`#${program.id}`}
                className="group rounded-xl border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <span className="mb-4 block h-1 w-10 rounded-full" style={{ backgroundColor: program.accent }} />
                <span className="block font-semibold leading-snug group-hover:text-primary">{program.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{program.benefit}</span>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section aria-labelledby="programs-heading">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Programme & Wege</p>
                <h2 id="programs-heading" className="mt-1 font-serif text-2xl font-bold">Von der Frage zum nächsten Schritt</h2>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:block">4 Einstiege</span>
            </div>
            <div className="space-y-4">
              {foerderungen.map((program) => (
                <FundingProgramCard
                  key={program.id}
                  program={program}
                  open={open === program.id}
                  onToggle={() => setOpen(open === program.id ? null : program.id)}
                  linkTargets={linkTargets}
                  targetLoadFailed={targetLoadFailed}
                />
              ))}
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <div className="rounded-2xl bg-[#164b38] p-5 text-[#f2f4ec]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/75">Die Förder-Route</p>
              <h2 className="mt-2 font-serif text-xl font-bold">Vier Schritte, weniger Umwege</h2>
              <ol className="mt-5 space-y-4">
                {[
                  ["01", "Vorhaben klären", "Was soll besser werden?"],
                  ["02", "Neutral beraten lassen", "Nicht nur das erstbeste Angebot prüfen."],
                  ["03", "Antrag starten", "Frist und Reihenfolge beachten."],
                  ["04", "Erst dann beauftragen", "Förderzusage und Bedingungen sichern."],
                ].map(([number, title, text]) => (
                  <li key={number} className="flex gap-3">
                    <span className="font-mono text-xs text-emerald-200/60">{number}</span>
                    <span>
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-emerald-100/65">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Direkte Hilfe im Landkreis</p>
              <p className="mt-2 text-sm leading-6">Kostenlose Erstberatung zu Gebäude, Heizung, PV und Förderwegen.</p>
              <a href="https://klimahochdrei.bayern/buergerinnen" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                KLIMA³ für Bürger:innen <ExternalIcon />
              </a>
              <a href="https://www.verbraucherzentrale.bayern/beratungsangebote/energieberatung-der-verbraucherzentrale-77976" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Verbraucherzentrale Bayern <ExternalIcon />
              </a>
            </div>
          </aside>
        </div>

        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm dark:border-amber-800/40 dark:bg-amber-950/20">
          <p className="font-semibold text-amber-900 dark:text-amber-300">Wichtig vor der Unterschrift</p>
          <p className="mt-1 leading-6 text-amber-800/85 dark:text-amber-200/80">
            Förderbedingungen, Budgets und Zinssätze können sich ändern. Prüfe den Original-Link des zuständigen Programms vor Antrag, Bestellung oder Vertragsabschluss. Die Seite hilft bei der Orientierung und ersetzt keine Rechts- oder Förderberatung.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t pt-5 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-3xl">{foerderungenStand.methodology}</p>
          <Link href="/pv-rechner" className="shrink-0 font-semibold text-primary hover:underline">Zum PV-Rechner →</Link>
        </div>
      </main>
    </div>
  );
}