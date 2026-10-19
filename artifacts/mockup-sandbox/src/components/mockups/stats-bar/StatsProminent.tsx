export function StatsProminent() {
  const stats = [
    {
      value: "2.019",
      unit: "Std/Jahr",
      label: "Sonnenstunden",
      sub: "Rekordjahr 2025 · DWD",
      dot: "#fbbf24",
      href: "/klima",
    },
    {
      value: "12,8 °C",
      unit: "",
      label: "Ø Temperatur",
      sub: "Ideal für Wärmepumpen",
      dot: "#34d399",
      href: "/klima",
    },
    {
      value: "70 %",
      label: "BEG-Förderung",
      unit: "bis zu",
      sub: "KfW + BAFA kombiniert",
      dot: "#2dd4bf",
      href: "/foerderung",
    },
    {
      value: "4",
      unit: "Rubriken",
      label: "Lokaler Journalismus",
      sub: "Energie · Kommunal · Daten · Praxis",
      dot: "#a78bfa",
      href: "/",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        background: "linear-gradient(135deg, #0f2d1a 0%, #1a3d2a 50%, #0a1f10 100%)",
      }}
    >
      <div className="w-full max-w-4xl">
        <p className="text-center text-xs tracking-widest uppercase text-white/40 mb-6">
          Landkreis Fürstenfeldbruck — aktuelle Kennzahlen
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="group flex flex-col gap-1 rounded-2xl px-4 py-4 transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: s.dot, boxShadow: `0 0 6px ${s.dot}` }}
                />
                <span className="text-white/50 text-xs truncate">{s.label}</span>
              </div>

              <div className="flex items-baseline gap-1.5">
                {s.unit && s.unit.length < 4 && (
                  <span className="text-white/40 text-xs">{s.unit}</span>
                )}
                <span className="text-white font-bold text-2xl leading-none tracking-tight">
                  {s.value}
                </span>
                {s.unit && s.unit.length >= 4 && (
                  <span className="text-white/50 text-xs">{s.unit}</span>
                )}
              </div>

              <div
                className="text-xs mt-1 transition-opacity opacity-60 group-hover:opacity-90 leading-snug"
                style={{ color: s.dot }}
              >
                {s.sub}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
