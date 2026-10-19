import "./_group.css";

const stats = [
  { label: "2.019 Std/Jahr", sub: "Sonnenstunden 2025", dot: "#fbbf24" },
  { label: "12,8 °C", sub: "Jahresdurchschnitt", dot: "#34d399" },
  { label: "bis 70 %", sub: "BEG-Förderung", dot: "#14b8a6" },
];

export function Current() {
  return (
    <main className="germring-hero-preview min-h-screen bg-[#060f0a] text-white">
      <section className="relative min-h-[760px] overflow-hidden py-24 md:py-36">
        <img
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "scale(1.08)" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(4,14,8,.80)_0%,rgba(6,18,12,.65)_40%,rgba(10,28,18,.85)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_8%_45%,rgba(52,211,153,.14)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_65%_10%,rgba(251,191,36,.09)_0%,transparent_60%)]" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[.18em] text-emerald-200/90">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Landkreis Fürstenfeldbruck
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            Ein faktenbasiertes Lokalmedium für Erneuerbare, Kommunalpolitik und die{" "}
            <span className="text-emerald-200">Zukunft des Landkreises FFB</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-light leading-relaxed text-white/60 md:text-xl">
            Präzise Analysen, ruhige Einordnungen — Fakten vor Meinung, ohne Parolen. Wir begleiten den Weg zu 100% erneuerbaren Energien.
          </p>
          <div className="mb-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#" className="rounded-md bg-emerald-300/90 px-8 py-3 text-sm font-semibold text-[#071410]">Newsletter abonnieren</a>
            <a href="#" className="text-sm font-medium text-emerald-200/75">Klimadaten erkunden →</a>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[.07] px-4 py-2 text-sm backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: stat.dot }} />
                <span className="font-semibold">{stat.label}</span>
                <span className="text-white/45">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}