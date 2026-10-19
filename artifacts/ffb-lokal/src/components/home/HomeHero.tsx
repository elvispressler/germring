import type { Article } from "@workspace/api-client-react";
import { Link } from "wouter";

const stats = [
  {
    value: "2.019",
    unit: "Std/Jahr",
    label: "Sonnenstunden im Landkreis FFB · 2025",
    context: "+22 % gegenüber Bundesschnitt · gute PV-Basis",
    tone: "text-amber-700",
    href: "/klima",
  },
  {
    value: "12,8",
    unit: "°C",
    label: "Jahresmittel im Landkreis FFB",
    context: "Ø 2022–2025 · relevant für Heizbedarf",
    tone: "text-sky-700",
    href: "/klima",
  },
  {
    value: "bis 70",
    unit: "%",
    label: "Heizungsförderung · KfW 458",
    context: "Zuschuss · abhängig von Vorhaben & Boni",
    tone: "text-emerald-700",
    href: "/foerderung",
  },
];

function getCalendarWeek(date: Date): number {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

type HomeHeroProps = {
  energie?: Article;
  kommunal?: Article;
  zahlen?: Article;
};

export function HomeHero({ energie, kommunal, zahlen }: HomeHeroProps) {
  const now = new Date();
  const weekNotes = [
    {
      number: "01",
      section: "Energie",
      title: energie?.title ?? "Erneuerbare im Landkreis: die aktuelle Einordnung",
      detail: energie ? "Neu aus Energie & Erneuerbare" : "Aktuelle Beiträge entdecken",
      href: energie ? `/artikel/${energie.id}` : "/kategorie/energie-erneuerbare",
      accent: "bg-amber-400",
    },
    {
      number: "02",
      section: "Kommunalpolitik",
      title: kommunal?.title ?? "Beschlüsse und Debatten aus dem Landkreis",
      detail: kommunal ? "Neu aus der Kommunalpolitik" : "Aktuelle Beiträge entdecken",
      href: kommunal ? `/artikel/${kommunal.id}` : "/kategorie/kommunalpolitik",
      accent: "bg-sky-500",
    },
    {
      number: "03",
      section: "Zahlen & Daten",
      title: zahlen?.title ?? "Lokale Kennzahlen ruhig eingeordnet",
      detail: zahlen ? "Neu aus Zahlen & Daten" : "Aktuelle Beiträge entdecken",
      href: zahlen ? `/artikel/${zahlen.id}` : "/kategorie/zahlen-daten",
      accent: "bg-emerald-500",
    },
  ];

  return (
    <section className="relative overflow-hidden border-y border-[#d9ddd5] bg-[#f4f2eb] text-[#17251f]">
      <div
        className="pointer-events-none absolute right-[-10rem] top-[-13rem] h-[31rem] w-[31rem] rounded-full border-[3.2rem] border-[#dfe8df]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-10rem] left-[-11rem] h-72 w-72 rounded-full bg-[#e7eee7]"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 py-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-[#d9ddd5] pb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#68766e]">
          <span>Energie. Politik. Zukunft. Aus FFB.</span>
          <span className="hidden items-center gap-2 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            KW {getCalendarWeek(now)} / {now.getFullYear()}
          </span>
        </div>

        <div className="grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,.95fr)] lg:gap-16">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#47715d]">
              <span className="h-px w-9 bg-[#47715d]" />
              Fakten vor Meinung
            </div>

            <h1 className="max-w-xl font-serif text-[2.65rem] font-bold leading-[1.08] tracking-[-0.045em] text-[#163b2d] sm:text-5xl lg:text-[3.45rem]">
              Fakten, die
              <br />
              <span className="font-normal text-[#bd6b25]">vor Ort</span> zählen.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#52635a] sm:text-lg sm:leading-8">
              germring.de ordnet Erneuerbare, Kommunalpolitik und die Zukunft des Landkreises
              Fürstenfeldbruck ein — präzise, ruhig und ohne Parolen.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7">
              <Link href="/newsletter">
                <span className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#164b38] px-6 text-sm font-bold text-[#f2f4ec] shadow-[0_8px_20px_rgba(22,75,56,.14)] hover:-translate-y-0.5 hover:bg-[#0f3b2b]">
                  Newsletter abonnieren
                  <span className="ml-4 text-lg font-normal" aria-hidden="true">→</span>
                </span>
              </Link>
              <Link
                href="/klima"
                className="group inline-flex min-h-10 items-center border-b border-[#8fa79a] pb-1 text-sm font-semibold text-[#315f4a] hover:border-[#164b38] hover:text-[#164b38]"
              >
                Klimadaten erkunden
                <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-3 border-y border-[#cfd8ce]">
              {stats.map((stat, index) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className={`group min-w-0 py-4 pr-2 sm:px-4 ${index > 0 ? "border-l border-[#cfd8ce] pl-2" : "sm:pl-0"}`}
                >
                  <div className={`font-mono text-lg font-bold tracking-[-0.06em] transition-transform group-hover:-translate-y-0.5 sm:text-2xl ${stat.tone}`}>
                    {stat.value}<span className="ml-1 text-[9px] tracking-normal sm:text-sm">{stat.unit}</span>
                  </div>
                  <div className="mt-1 text-[8px] font-semibold uppercase leading-[1.35] tracking-[0.04em] text-[#718078] sm:text-[10px] sm:tracking-[0.06em]">
                    {stat.label}
                  </div>
                  <div className="mt-1 text-[9px] leading-[1.35] text-[#87938b] sm:text-[10px]">
                    {stat.context}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside>
            <div className="mb-2 flex items-end justify-between border-b-2 border-[#164b38] pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#bd6b25]">Orientierung</p>
                <h2 className="mt-1 font-serif text-2xl font-bold tracking-[-0.035em] text-[#163b2d]">
                  Diese Woche
                </h2>
              </div>
              <span className="font-mono text-xs text-[#7b887f]">Aktuell</span>
            </div>

            <div className="divide-y divide-[#d9ddd5] border-b border-[#d9ddd5]">
              {weekNotes.map((note) => (
                <Link key={note.number} href={note.href} className="group flex gap-4 py-4">
                  <span className="flex w-7 shrink-0 flex-col items-center gap-3">
                    <span className="font-mono text-[10px] font-bold text-[#89958d]">{note.number}</span>
                    <span className={`h-2 w-2 rounded-full ${note.accent}`} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[9px] font-bold uppercase tracking-[0.17em] text-[#6f7f75]">
                      {note.section}
                    </span>
                    <span className="mt-1 block font-serif text-[15px] font-bold leading-6 text-[#244638] transition-colors group-hover:text-[#bd6b25]">
                      {note.title}
                    </span>
                    <span className="mt-1 block text-xs text-[#8a958e]">{note.detail}</span>
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3 text-xs text-[#78867d]">
              <span className="h-px w-8 bg-[#bd6b25]" />
              Erst lesen, dann urteilen.
            </div>
          </aside>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#d9ddd5] pt-4 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#87938b] sm:flex-row sm:items-center sm:justify-between">
          <span>Erneuerbare · Kommunalpolitik · Zahlen & Daten</span>
          <span>Ein Medium aus dem Landkreis</span>
        </div>
      </div>
    </section>
  );
}