import "./_group.css";

const stats = [
  { value: "2.019", unit: "Std/Jahr", label: "Sonnenstunden 2025", accent: "#d97706" },
  { value: "12,8", unit: "°C", label: "Jahresdurchschnitt", accent: "#0f766e" },
  { value: "bis 70", unit: "%", label: "BEG-Förderung", accent: "#2563eb" },
];

export function MagazinEinstieg() {
  return (
    <main className="germring-hero-preview min-h-screen overflow-hidden bg-[#f3f0e8] text-[#19362f]">
      <section className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col justify-center px-5 py-8 sm:px-8 lg:px-14 lg:py-12">
        <div className="pointer-events-none absolute -right-32 top-[-9rem] h-[32rem] w-[32rem] rounded-full bg-[#dbe8dd]/70" />
        <div className="pointer-events-none absolute bottom-[-14rem] left-[-9rem] h-[26rem] w-[26rem] rounded-full border-[3rem] border-[#eadfca]/60" />

        <header className="relative mb-10 flex items-center justify-between border-b border-[#19362f]/20 pb-4 sm:mb-14">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#19362f] text-sm font-bold tracking-[-.08em] text-[#f3f0e8]">
              gr
            </span>
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em]">germring.de</span>
          </div>
          <div className="hidden items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#19362f]/60 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d97706]" />
            Landkreis Fürstenfeldbruck
          </div>
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#19362f]/50">Ausgabe 01 / 2025</span>
        </header>

        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,.95fr)] lg:gap-16">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#0f766e]">
              Lokal. Sachlich. Zukunftsfest.
            </p>
            <h1 className="max-w-xl text-[2.65rem] font-bold leading-[1.09] tracking-[-.045em] text-[#19362f] sm:text-5xl lg:text-[4.15rem]">
              Die Energiewende
              <br />
              <em className="font-normal text-[#0f766e]">vor unserer Haustür.</em>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#19362f]/70 sm:text-lg">
              Ein faktenbasiertes Lokalmedium für Erneuerbare, Kommunalpolitik und die Zukunft des Landkreises FFB.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href="/newsletter"
                className="inline-flex items-center justify-center rounded-sm bg-[#19362f] px-5 py-3 text-sm font-semibold text-[#f3f0e8] shadow-[4px_4px_0_#d6a756] hover:-translate-y-0.5 hover:bg-[#0f766e]"
              >
                Newsletter abonnieren <span className="ml-3 text-[#d6a756]">↗</span>
              </a>
              <a href="/klima" className="group text-sm font-semibold text-[#19362f] underline decoration-[#d6a756] decoration-2 underline-offset-4 hover:text-[#0f766e]">
                Klimadaten erkunden <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>

          <article className="relative mx-auto w-full max-w-[500px] rotate-[1.2deg] border border-[#19362f]/20 bg-[#fbfaf5] p-3 shadow-[12px_14px_0_rgba(25,54,47,.10)] sm:p-4 lg:rotate-[2deg]">
            <div className="relative flex aspect-[1.16/1] flex-col justify-between overflow-hidden bg-[#1e5147] p-5 text-[#fbfaf5] sm:p-7">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "linear-gradient(118deg, transparent 0 28%, rgba(232,198,124,.85) 28.5% 29%, transparent 29.5% 54%, rgba(232,198,124,.6) 54.5% 55%, transparent 55.5%), linear-gradient(18deg, transparent 0 43%, rgba(255,255,255,.28) 43.5% 44%, transparent 44.5% 73%, rgba(255,255,255,.2) 73.5% 74%, transparent 74.5%)",
                  backgroundSize: "100% 100%, 100% 100%",
                }}
                aria-hidden="true"
              />
              <div className="relative flex items-start justify-between">
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#f2cf89]">Im Fokus</span>
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/60">Energie &amp; Erneuerbare</span>
              </div>
              <div className="relative">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-white/60">Schwerpunkt</p>
                <h2 className="max-w-sm text-2xl font-bold leading-tight tracking-[-.025em] sm:text-3xl">
                  Was 2.019 Sonnenstunden für den Landkreis bedeuten
                </h2>
              </div>
            </div>
            <div className="flex items-end justify-between gap-4 px-1 pb-1 pt-4 sm:px-2">
              <p className="max-w-xs text-xs leading-5 text-[#19362f]/65">
                Präzise Analysen, ruhige Einordnungen — Fakten vor Meinung, ohne Parolen.
              </p>
              <span className="shrink-0 font-mono text-[0.65rem] text-[#19362f]/45">01 / 04</span>
            </div>
          </article>
        </div>

        <div className="relative mt-12 grid border-y border-[#19362f]/20 sm:mt-16 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={stat.label} className={`flex items-baseline gap-3 py-4 sm:py-5 ${index < 2 ? "border-b border-[#19362f]/15 sm:border-b-0 sm:border-r" : ""} ${index > 0 ? "sm:pl-7" : ""}`}>
              <span className="font-mono text-2xl font-medium tracking-[-.07em]" style={{ color: stat.accent }}>
                {stat.value}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#19362f]/55">{stat.unit}</span>
              <span className="ml-auto text-right text-[0.68rem] leading-4 text-[#19362f]/55 sm:ml-0">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-5 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.18em] text-[#19362f]/45">
          <span>Fakten vor Meinung</span>
          <span className="hidden sm:inline">Einblicke aus dem Landkreis</span>
          <span>germring.de</span>
        </div>
      </section>
    </main>
  );
}