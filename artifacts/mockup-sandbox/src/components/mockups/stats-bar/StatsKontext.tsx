export function StatsKontext() {
  const stats = [
    {
      value: "2.019",
      unit: "Std/Jahr",
      label: "Sonnenstunden 2025",
      context: "+22 % über Bundesschnitt",
      dot: "#fbbf24",
      href: "/klima",
    },
    {
      value: "12,8 °C",
      unit: "",
      label: "Jahresdurchschnitt",
      context: "Ideal für Wärmepumpen",
      dot: "#34d399",
      href: "/klima",
    },
    {
      value: "bis 70 %",
      unit: "",
      label: "BEG-Förderung",
      context: "KfW & BAFA kombinierbar",
      dot: "#2dd4bf",
      href: "/foerderung",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        background: "linear-gradient(135deg, #0f2d1a 0%, #1a3d2a 50%, #0a1f10 100%)",
      }}
    >
      <div className="w-full max-w-3xl space-y-4">
        <p className="text-center text-xs tracking-widest uppercase text-white/40 mb-6">
          Landkreis Fürstenfeldbruck — aktuelle Kennzahlen
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {stats.map((s) => (
            <a
              key={s.value}
              href={s.href}
              className="group flex items-start gap-3 rounded-2xl px-5 py-3.5 transition-all duration-200 hover:scale-[1.03] cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
                minWidth: "220px",
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                style={{ background: s.dot, boxShadow: `0 0 8px ${s.dot}` }}
              />
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white font-semibold text-base leading-tight">
                    {s.value}
                  </span>
                  {s.unit && (
                    <span className="text-white/60 text-xs">{s.unit}</span>
                  )}
                </div>
                <div className="text-white/70 text-sm leading-tight mt-0.5">{s.label}</div>
                <div
                  className="text-xs mt-1 font-medium transition-colors group-hover:opacity-100"
                  style={{ color: s.dot, opacity: 0.8 }}
                >
                  {s.context} →
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
