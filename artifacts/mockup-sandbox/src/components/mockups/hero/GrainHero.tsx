export function GrainHero() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          20% { transform: translate(3%, 2%); }
          30% { transform: translate(-1%, 3%); }
          40% { transform: translate(2%, -1%); }
          50% { transform: translate(-3%, 2%); }
          60% { transform: translate(1%, -2%); }
          70% { transform: translate(-2%, 1%); }
          80% { transform: translate(3%, -3%); }
          90% { transform: translate(-1%, 2%); }
        }
        .grain-layer {
          animation: grain 0.4s steps(1) infinite;
        }
        @keyframes float-orb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-18px) scale(1.04); }
        }
        .orb-float { animation: float-orb 8s ease-in-out infinite; }
        .orb-float-slow { animation: float-orb 12s ease-in-out infinite reverse; }
      `}</style>

      <section
        className="relative w-full overflow-hidden text-white"
        style={{ minHeight: "720px", background: "linear-gradient(135deg, #060f0a 0%, #0d2118 45%, #071410 100%)" }}
      >
        {/* Animierte Glow-Orbs */}
        <div className="orb-float absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.16) 0%, rgba(16,185,129,0.05) 50%, transparent 70%)" }} />
        <div className="orb-float-slow absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, rgba(13,148,136,0.04) 50%, transparent 70%)" }} />
        <div className="orb-float absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.09) 0%, transparent 65%)" }} />

        {/* === Animiertes Film-Grain === */}
        <div
          className="grain-layer pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px 180px",
          }}
        />

        {/* Subtiles Grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Ringe */}
        <div className="absolute top-12 right-[18%] w-72 h-72 rounded-full pointer-events-none"
          style={{ border: "1px solid rgba(52,211,153,0.12)" }} />
        <div className="absolute top-24 right-[20%] w-48 h-48 rounded-full pointer-events-none"
          style={{ border: "1px solid rgba(52,211,153,0.07)" }} />

        {/* Inhalt */}
        <div className="relative flex flex-col items-center justify-center text-center px-8 py-32" style={{ minHeight: "720px" }}>
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.20)", color: "rgba(110,231,183,0.9)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Landkreis Fürstenfeldbruck
          </div>
          <h1 className="text-5xl font-serif font-bold leading-tight mb-6 max-w-3xl" style={{ fontFamily: "Georgia, serif" }}>
            Ein faktenbasiertes Lokalmedium für Erneuerbare, Kommunalpolitik und die{" "}
            <span style={{ color: "rgba(110,231,183,0.95)" }}>Zukunft des Landkreises FFB.</span>
          </h1>
          <p className="text-lg mb-10 max-w-xl font-light" style={{ color: "rgba(255,255,255,0.60)" }}>
            Präzise Analysen, ruhige Einordnungen — Fakten vor Meinung, <span className="whitespace-nowrap">ohne Parolen.</span>
          </p>
          <div className="flex gap-4 flex-wrap justify-center mb-16">
            <button className="px-8 py-3 rounded-md font-semibold text-sm" style={{ background: "rgba(52,211,153,0.88)", color: "#060f0a" }}>
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
              <div key={s.label} className="flex items-center gap-2.5 rounded-full px-4 py-2 text-sm" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(12px)" }}>
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
