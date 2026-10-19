export function MeshHero() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <section
        className="relative w-full overflow-hidden text-white"
        style={{ minHeight: "720px" }}
      >
        {/* Mesh-Gradient: alle Farb-Orbs in einem einzigen Layer */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 75% 65% at 10% 20%, #064e3b 0%, transparent 60%),
            radial-gradient(ellipse 60% 70% at 88% 15%, #0f766e 0%, transparent 55%),
            radial-gradient(ellipse 65% 55% at 72% 80%, #042f2e 0%, transparent 58%),
            radial-gradient(ellipse 50% 60% at 35% 85%, #065f46 0%, transparent 52%),
            radial-gradient(ellipse 45% 45% at 92% 58%, #78350f 0%, transparent 48%),
            #050d0a
          `
        }} />

        {/* Helle Akzentpunkte für "Mesh"-Look */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 28% 22% at 8% 14%, rgba(52,211,153,0.20) 0%, transparent 55%),
            radial-gradient(ellipse 22% 18% at 90% 10%, rgba(94,234,212,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 18% 18% at 50% 88%, rgba(16,185,129,0.10) 0%, transparent 50%),
            radial-gradient(ellipse 15% 15% at 78% 78%, rgba(251,191,36,0.10) 0%, transparent 50%)
          `
        }} />

        {/* Inhalt */}
        <div className="relative flex flex-col items-center justify-center text-center px-8 py-32" style={{ minHeight: "720px" }}>
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.22)", color: "rgba(110,231,183,0.9)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Landkreis Fürstenfeldbruck
          </div>
          <h1 className="text-5xl font-serif font-bold leading-tight mb-6 max-w-3xl" style={{ fontFamily: "Georgia, serif" }}>
            Ein faktenbasiertes Lokalmedium für Erneuerbare, Kommunalpolitik und die{" "}
            <span style={{ color: "rgba(94,234,212,0.95)" }}>Zukunft des Landkreises FFB.</span>
          </h1>
          <p className="text-lg mb-10 max-w-xl font-light" style={{ color: "rgba(255,255,255,0.60)" }}>
            Präzise Analysen, ruhige Einordnungen — Fakten vor Meinung, <span className="whitespace-nowrap">ohne Parolen.</span>
          </p>
          <div className="flex gap-4 flex-wrap justify-center mb-16">
            <button className="px-8 py-3 rounded-md font-semibold text-sm" style={{ background: "rgba(52,211,153,0.88)", color: "#051a10" }}>
              Newsletter abonnieren
            </button>
            <span className="flex items-center text-sm" style={{ color: "rgba(94,234,212,0.75)" }}>Klimadaten erkunden →</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "2.019 Std/Jahr", sub: "Sonnenstunden 2025", dot: "rgba(251,191,36,0.8)" },
              { label: "12,8 °C",        sub: "Jahresdurchschnitt", dot: "rgba(52,211,153,0.8)" },
              { label: "bis 70 %",       sub: "BEG-Förderung",      dot: "rgba(20,184,166,0.8)" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 rounded-full px-4 py-2 text-sm"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)", backdropFilter: "blur(16px)" }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                <span className="font-semibold text-white">{s.label}</span>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" className="w-full" preserveAspectRatio="none">
            <path d="M0 56 C480 0 960 0 1440 56 L1440 56 L0 56 Z" fill="hsl(160, 22%, 95%)" />
          </svg>
        </div>
      </section>
    </div>
  );
}
