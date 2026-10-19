export function FotoHero() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <section
        className="relative w-full overflow-hidden text-white"
        style={{ minHeight: "720px" }}
      >
        {/* Foto-Hintergrund */}
        <img
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80"
          alt="Solar panels aerial"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dunkel-Overlay — schichtig für Tiefe */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(4,14,8,0.82) 0%, rgba(6,18,12,0.72) 40%, rgba(10,28,18,0.88) 100%)" }} />
        {/* Smaragd-Glow von links */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(52,211,153,0.12) 0%, transparent 60%)" }} />

        {/* Inhalt */}
        <div className="relative flex flex-col items-center justify-center text-center px-8 py-32" style={{ minHeight: "720px" }}>
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.22)", color: "rgba(110,231,183,0.9)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Landkreis Fürstenfeldbruck
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight mb-6 max-w-3xl" style={{ fontFamily: "Georgia, serif" }}>
            Ein faktenbasiertes Lokalmedium für Erneuerbare, Kommunalpolitik und die{" "}
            <span style={{ color: "rgba(110,231,183,0.95)" }}>Zukunft des Landkreises FFB.</span>
          </h1>
          <p className="text-lg mb-10 max-w-xl font-light" style={{ color: "rgba(255,255,255,0.62)" }}>
            Präzise Analysen, ruhige Einordnungen — Fakten vor Meinung, <span className="whitespace-nowrap">ohne Parolen.</span>
          </p>
          <div className="flex gap-4 flex-wrap justify-center mb-16">
            <button className="px-8 py-3 rounded-md font-semibold text-sm" style={{ background: "rgba(52,211,153,0.9)", color: "#071410" }}>
              Newsletter abonnieren
            </button>
            <span className="flex items-center text-sm" style={{ color: "rgba(110,231,183,0.75)" }}>Klimadaten erkunden →</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "2.019 Std/Jahr", sub: "Sonnenstunden 2025", dot: "rgba(251,191,36,0.8)" },
              { label: "12,8 °C", sub: "Jahresdurchschnitt", dot: "rgba(52,211,153,0.8)" },
              { label: "bis 70 %", sub: "BEG-Förderung", dot: "rgba(20,184,166,0.8)" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 rounded-full px-4 py-2 text-sm" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                <span className="font-semibold text-white">{s.label}</span>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wellen-Übergang */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" className="w-full" preserveAspectRatio="none">
            <path d="M0 56 C480 0 960 0 1440 56 L1440 56 L0 56 Z" fill="hsl(160, 22%, 95%)" />
          </svg>
        </div>
      </section>
    </div>
  );
}
