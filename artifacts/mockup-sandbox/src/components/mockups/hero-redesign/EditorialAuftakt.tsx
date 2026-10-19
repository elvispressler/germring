import "./_group.css";

const stats = [
  { value: "2.019", unit: "Std/Jahr", label: "Sonnenstunden 2025", tone: "text-amber-700" },
  { value: "12,8", unit: "°C", label: "Jahresdurchschnitt", tone: "text-sky-700" },
  { value: "bis 70", unit: "%", label: "BEG-Förderung", tone: "text-emerald-700" },
];

const weekNotes = [
  {
    number: "01",
    section: "Energie",
    title: "Was 2.019 Sonnenstunden für PV im Landkreis bedeuten",
    detail: "Eine Zahl, drei Einordnungen",
    accent: "bg-amber-400",
  },
  {
    number: "02",
    section: "Kreistag",
    title: "Beschlüsse, die diese Woche wichtig werden",
    detail: "Kurz erklärt, ohne Parolen",
    accent: "bg-sky-500",
  },
  {
    number: "03",
    section: "Förderung",
    title: "BEG-Förderung: bis zu 70 % für den Heizungstausch",
    detail: "Die aktuelle Zahl im Kontext",
    accent: "bg-emerald-500",
  },
];

export function EditorialAuftakt() {
  return (
    <main className="germring-hero-preview min-h-screen overflow-hidden bg-[#f4f2eb] text-[#17251f]">
      <section className="relative min-h-screen border-b border-[#d9ddd5]">
        <div
          className="pointer-events-none absolute right-[-11rem] top-[-13rem] h-[34rem] w-[34rem] rounded-full border-[3.5rem] border-[#dfe8df] sm:right-[-8rem]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-[-9rem] left-[-10rem] h-72 w-72 rounded-full bg-[#e7eee7]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-10 pt-6 sm:px-10 lg:px-14">
          <header className="flex items-center justify-between border-b border-[#d9ddd5] pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#164b38] text-[13px] font-bold tracking-[-.08em] text-[#eef3eb]">
                gr
              </span>
              <span className="text-[13px] font-bold tracking-[.13em] text-[#164b38]">GERMRING.DE</span>
            </div>
            <p className="hidden text-[11px] font-semibold uppercase tracking-[.17em] text-[#68766e] sm:block">
              Landkreis Fürstenfeldbruck
            </p>
            <span className="h-2 w-2 rounded-full bg-emerald-600" title="Aktuelle Ausgabe" />
          </header>

          <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(23rem,.92fr)] lg:gap-20 lg:py-16">
            <div className="max-w-2xl">
              <div className="mb-7 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.18em] text-[#47715d]">
                <span className="h-px w-9 bg-[#47715d]" />
                Lokales Medium für FFB
              </div>
              <h1 className="max-w-xl text-[2.85rem] font-bold leading-[1.08] tracking-[-.045em] text-[#163b2d] sm:text-6xl lg:text-[4.65rem]">
                Fakten, die
                <br />
                <em className="font-normal not-italic text-[#bd6b25]">vor Ort</em> zählen.
              </h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-[#52635a] sm:text-lg sm:leading-8">
                germring.de ordnet Erneuerbare, Kommunalpolitik und die Zukunft des Landkreises
                Fürstenfeldbruck ein — präzise, ruhig und ohne Parolen.
              </p>

              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
                <a
                  href="/newsletter"
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#164b38] px-6 text-sm font-bold text-[#f2f4ec] shadow-[0_8px_20px_rgba(22,75,56,.14)] hover:-translate-y-0.5 hover:bg-[#0f3b2b]"
                >
                  Newsletter abonnieren
                  <span className="ml-4 text-lg font-normal" aria-hidden="true">→</span>
                </a>
                <a
                  href="/klima"
                  className="group inline-flex min-h-10 items-center border-b border-[#8fa79a] pb-1 text-sm font-semibold text-[#315f4a] hover:border-[#164b38] hover:text-[#164b38]"
                >
                  Klimadaten erkunden
                  <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true">↗</span>
                </a>
              </div>

              <div className="mt-12 grid max-w-xl grid-cols-1 border-y border-[#cfd8ce] sm:grid-cols-3">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`py-4 sm:px-4 ${index > 0 ? "border-t border-[#cfd8ce] sm:border-l sm:border-t-0" : "sm:pl-0"}`}
                  >
                    <div className={`font-mono text-2xl font-bold tracking-[-.06em] ${stat.tone}`}>
                      {stat.value}<span className="ml-1 text-sm tracking-normal">{stat.unit}</span>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-[.08em] text-[#718078]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="relative lg:pt-6">
              <div className="mb-5 flex items-end justify-between border-b-2 border-[#164b38] pb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#bd6b25]">Orientierung</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-[-.035em] text-[#163b2d]">Diese Woche</h2>
                </div>
                <span className="font-mono text-xs text-[#7b887f]">KW 24 / 2025</span>
              </div>
              <div className="divide-y divide-[#d9ddd5] border-b border-[#d9ddd5]">
                {weekNotes.map((note) => (
                  <article key={note.number} className="group flex gap-4 py-5">
                    <div className="flex w-7 shrink-0 flex-col items-center gap-3">
                      <span className="font-mono text-[11px] font-bold text-[#89958d]">{note.number}</span>
                      <span className={`h-2 w-2 rounded-full ${note.accent}`} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#6f7f75]">{note.section}</p>
                      <h3 className="mt-1.5 text-[15px] font-bold leading-6 text-[#244638] transition-colors group-hover:text-[#bd6b25]">
                        {note.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#8a958e]">{note.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3 text-xs text-[#78867d]">
                <span className="h-px w-8 bg-[#bd6b25]" />
                Erst lesen, dann urteilen.
              </div>
            </aside>
          </div>

          <footer className="flex flex-col gap-2 border-t border-[#d9ddd5] pt-4 text-[10px] font-semibold uppercase tracking-[.13em] text-[#87938b] sm:flex-row sm:items-center sm:justify-between">
            <span>Erneuerbare · Kommunalpolitik · Zahlen & Daten</span>
            <span>Ein Medium aus dem Landkreis</span>
          </footer>
        </div>
      </section>
    </main>
  );
}