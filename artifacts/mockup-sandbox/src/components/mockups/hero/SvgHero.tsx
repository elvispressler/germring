export function SvgHero() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <section
        className="relative w-full overflow-hidden text-white"
        style={{ minHeight: "720px", background: "linear-gradient(175deg, #081510 0%, #0d2118 45%, #0a1c14 100%)" }}
      >
        {/* Subtiler Glow oben links */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 15% 30%, rgba(52,211,153,0.10) 0%, transparent 65%)" }} />

        {/* Inhalt — hoch positioniert, Platz für Silhouette unten */}
        <div className="relative flex flex-col items-center justify-center text-center px-8 pt-24 pb-0" style={{ minHeight: "480px" }}>
          <div className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.20)", color: "rgba(110,231,183,0.9)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Landkreis Fürstenfeldbruck
          </div>
          <h1 className="text-5xl font-serif font-bold leading-tight mb-5 max-w-3xl" style={{ fontFamily: "Georgia, serif" }}>
            Ein faktenbasiertes Lokalmedium für Erneuerbare, Kommunalpolitik und die{" "}
            <span style={{ color: "rgba(110,231,183,0.95)" }}>Zukunft des Landkreises FFB.</span>
          </h1>
          <p className="text-lg mb-8 max-w-xl font-light" style={{ color: "rgba(255,255,255,0.60)" }}>
            Präzise Analysen, ruhige Einordnungen — Fakten vor Meinung, <span className="whitespace-nowrap">ohne Parolen.</span>
          </p>
          <div className="flex gap-4 flex-wrap justify-center mb-8">
            <button className="px-8 py-3 rounded-md font-semibold text-sm" style={{ background: "rgba(52,211,153,0.9)", color: "#071410" }}>
              Newsletter abonnieren
            </button>
            <span className="flex items-center text-sm" style={{ color: "rgba(110,231,183,0.75)" }}>Klimadaten erkunden →</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {[
              { label: "2.019 Std/Jahr", sub: "Sonnenstunden 2025", dot: "rgba(251,191,36,0.8)" },
              { label: "12,8 °C", sub: "Jahresdurchschnitt", dot: "rgba(52,211,153,0.8)" },
              { label: "bis 70 %", sub: "BEG-Förderung", dot: "rgba(20,184,166,0.8)" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 rounded-full px-4 py-2 text-sm" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(12px)" }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                <span className="font-semibold text-white">{s.label}</span>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* === SVG-Landschafts-Silhouette === */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            {/* Hügel-Hintergrund */}
            <path d="M0 200 C200 160 400 140 600 155 C800 170 1000 150 1200 165 C1320 175 1400 190 1440 195 L1440 260 L0 260 Z"
              fill="rgba(13,33,20,0.6)" />
            {/* Hügel-Vordergrund */}
            <path d="M0 220 C150 195 300 185 500 200 C700 215 900 195 1100 205 C1280 214 1380 220 1440 222 L1440 260 L0 260 Z"
              fill="rgba(8,20,13,0.85)" />

            {/* Windrad links */}
            <g transform="translate(160, 120)">
              <line x1="0" y1="0" x2="0" y2="90" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5"/>
              <circle cx="0" cy="0" r="3" fill="rgba(52,211,153,0.7)"/>
              {/* Rotorblätter */}
              <path d="M0 0 C-4 -12 -6 -30 0 -38 C6 -30 4 -12 0 0Z" fill="rgba(255,255,255,0.30)" transform="rotate(0)"/>
              <path d="M0 0 C-4 -12 -6 -30 0 -38 C6 -30 4 -12 0 0Z" fill="rgba(255,255,255,0.30)" transform="rotate(120)"/>
              <path d="M0 0 C-4 -12 -6 -30 0 -38 C6 -30 4 -12 0 0Z" fill="rgba(255,255,255,0.30)" transform="rotate(240)"/>
            </g>

            {/* Windrad Mitte */}
            <g transform="translate(380, 100)">
              <line x1="0" y1="0" x2="0" y2="120" stroke="rgba(255,255,255,0.30)" strokeWidth="3"/>
              <circle cx="0" cy="0" r="4" fill="rgba(52,211,153,0.6)"/>
              <path d="M0 0 C-5 -16 -8 -40 0 -50 C8 -40 5 -16 0 0Z" fill="rgba(255,255,255,0.25)" transform="rotate(30)"/>
              <path d="M0 0 C-5 -16 -8 -40 0 -50 C8 -40 5 -16 0 0Z" fill="rgba(255,255,255,0.25)" transform="rotate(150)"/>
              <path d="M0 0 C-5 -16 -8 -40 0 -50 C8 -40 5 -16 0 0Z" fill="rgba(255,255,255,0.25)" transform="rotate(270)"/>
            </g>

            {/* Solarmodul-Reihe rechts */}
            {[0,1,2,3,4,5].map(i => (
              <g key={i} transform={`translate(${900 + i * 70}, 185)`}>
                <rect x="-28" y="-18" width="56" height="22" rx="2"
                  fill="rgba(20,80,60,0.7)" stroke="rgba(52,211,153,0.3)" strokeWidth="0.5"/>
                <line x1="-28" y1="-7" x2="28" y2="-7" stroke="rgba(52,211,153,0.2)" strokeWidth="0.5"/>
                <line x1="0" y1="-18" x2="0" y2="4" stroke="rgba(52,211,153,0.2)" strokeWidth="0.5"/>
                <line x1="-28" y1="4" x2="-22" y2="22" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                <line x1="28" y1="4" x2="22" y2="22" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                <line x1="-22" y1="22" x2="22" y2="22" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
              </g>
            ))}

            {/* Bäume links */}
            {[0,1,2].map(i => (
              <g key={i} transform={`translate(${60 + i * 38}, 195)`}>
                <polygon points="0,-35 -12,0 12,0" fill="rgba(10,40,20,0.8)"/>
                <polygon points="0,-25 -9,5 9,5" fill="rgba(12,48,24,0.9)"/>
                <rect x="-3" y="0" width="6" height="12" fill="rgba(8,25,14,0.8)"/>
              </g>
            ))}

            {/* Wellen-Übergang ganz unten */}
            <path d="M0 240 C240 215 480 205 720 215 C960 225 1200 215 1440 225 L1440 260 L0 260 Z"
              fill="hsl(160, 22%, 95%)"/>
          </svg>
        </div>
      </section>
    </div>
  );
}
