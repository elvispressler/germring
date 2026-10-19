import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useParallax, useScrollReveal } from "@/hooks/useParallax";

const klimaKennzahlen = [
  { icon: "☀️", label: "Max. Sonneneinstrahlung",      value: "8,2",   unit: "kWh/m²/Tag", note: "Bestes Solarmonat Juli — ideal für PV-Anlagen" },
  { icon: "🌡️", label: "Jahresdurchschnitt Ø 2022–2025", value: "12,8", unit: "°C",        note: "Mildes Klima — Wärmepumpen laufen hier sehr effizient" },
  { icon: "📅", label: "Sonnenstunden 2025",            value: "2.019", unit: "Std/Jahr",   note: "Rekordjahr 2025 — +22 % mehr als Bundesschnitt (≈1.650 Std)" },
];

type GemeindeRow = { name: string; sonnenstunden: number; wärmepumpen: number; pvAnteil: number; co2ReduktionPP: number };

const gemeindeDatenByYear: Record<number, GemeindeRow[]> = {
  2021: [
    { name: "Germering",        sonnenstunden: 1821, wärmepumpen:  820, pvAnteil: 13, co2ReduktionPP:  8 },
    { name: "Fürstenfeldbruck", sonnenstunden: 1807, wärmepumpen:  610, pvAnteil:  9, co2ReduktionPP:  5 },
    { name: "Puchheim",         sonnenstunden: 1813, wärmepumpen:  440, pvAnteil: 11, co2ReduktionPP:  7 },
    { name: "Olching",          sonnenstunden: 1830, wärmepumpen:  480, pvAnteil: 15, co2ReduktionPP:  9 },
    { name: "Maisach",          sonnenstunden: 1799, wärmepumpen:  260, pvAnteil: 19, co2ReduktionPP:  6 },
    { name: "Gröbenzell",       sonnenstunden: 1809, wärmepumpen:  370, pvAnteil:  8, co2ReduktionPP:  5 },
    { name: "Eichenau",         sonnenstunden: 1815, wärmepumpen:  195, pvAnteil: 10, co2ReduktionPP:  6 },
    { name: "Moorenweis",       sonnenstunden: 1790, wärmepumpen:   95, pvAnteil: 23, co2ReduktionPP:  7 },
  ],
  2022: [
    { name: "Germering",        sonnenstunden: 1910, wärmepumpen: 1050, pvAnteil: 15, co2ReduktionPP: 13 },
    { name: "Fürstenfeldbruck", sonnenstunden: 1895, wärmepumpen:  770, pvAnteil: 11, co2ReduktionPP:  9 },
    { name: "Puchheim",         sonnenstunden: 1901, wärmepumpen:  560, pvAnteil: 13, co2ReduktionPP: 12 },
    { name: "Olching",          sonnenstunden: 1918, wärmepumpen:  620, pvAnteil: 17, co2ReduktionPP: 14 },
    { name: "Maisach",          sonnenstunden: 1887, wärmepumpen:  335, pvAnteil: 21, co2ReduktionPP: 10 },
    { name: "Gröbenzell",       sonnenstunden: 1897, wärmepumpen:  490, pvAnteil: 10, co2ReduktionPP:  9 },
    { name: "Eichenau",         sonnenstunden: 1905, wärmepumpen:  270, pvAnteil: 12, co2ReduktionPP: 10 },
    { name: "Moorenweis",       sonnenstunden: 1879, wärmepumpen:  130, pvAnteil: 26, co2ReduktionPP: 12 },
  ],
  2023: [
    { name: "Germering",        sonnenstunden: 1965, wärmepumpen: 1380, pvAnteil: 18, co2ReduktionPP: 18 },
    { name: "Fürstenfeldbruck", sonnenstunden: 1950, wärmepumpen: 1010, pvAnteil: 14, co2ReduktionPP: 14 },
    { name: "Puchheim",         sonnenstunden: 1957, wärmepumpen:  730, pvAnteil: 15, co2ReduktionPP: 16 },
    { name: "Olching",          sonnenstunden: 1972, wärmepumpen:  800, pvAnteil: 19, co2ReduktionPP: 17 },
    { name: "Maisach",          sonnenstunden: 1942, wärmepumpen:  440, pvAnteil: 24, co2ReduktionPP: 13 },
    { name: "Gröbenzell",       sonnenstunden: 1952, wärmepumpen:  625, pvAnteil: 12, co2ReduktionPP: 12 },
    { name: "Eichenau",         sonnenstunden: 1960, wärmepumpen:  355, pvAnteil: 14, co2ReduktionPP: 14 },
    { name: "Moorenweis",       sonnenstunden: 1935, wärmepumpen:  175, pvAnteil: 29, co2ReduktionPP: 16 },
  ],
  2024: [
    { name: "Germering",        sonnenstunden: 1993, wärmepumpen: 1640, pvAnteil: 20, co2ReduktionPP: 22 },
    { name: "Fürstenfeldbruck", sonnenstunden: 1977, wärmepumpen: 1190, pvAnteil: 15, co2ReduktionPP: 17 },
    { name: "Puchheim",         sonnenstunden: 1984, wärmepumpen:  865, pvAnteil: 17, co2ReduktionPP: 19 },
    { name: "Olching",          sonnenstunden: 2000, wärmepumpen:  955, pvAnteil: 21, co2ReduktionPP: 21 },
    { name: "Maisach",          sonnenstunden: 1969, wärmepumpen:  525, pvAnteil: 25, co2ReduktionPP: 16 },
    { name: "Gröbenzell",       sonnenstunden: 1979, wärmepumpen:  740, pvAnteil: 14, co2ReduktionPP: 15 },
    { name: "Eichenau",         sonnenstunden: 1988, wärmepumpen:  415, pvAnteil: 16, co2ReduktionPP: 17 },
    { name: "Moorenweis",       sonnenstunden: 1963, wärmepumpen:  205, pvAnteil: 30, co2ReduktionPP: 19 },
  ],
  2025: [
    { name: "Germering",        sonnenstunden: 2019, wärmepumpen: 1870, pvAnteil: 22, co2ReduktionPP: 25 },
    { name: "Fürstenfeldbruck", sonnenstunden: 2005, wärmepumpen: 1350, pvAnteil: 17, co2ReduktionPP: 20 },
    { name: "Puchheim",         sonnenstunden: 2011, wärmepumpen:  970, pvAnteil: 19, co2ReduktionPP: 22 },
    { name: "Olching",          sonnenstunden: 2025, wärmepumpen: 1070, pvAnteil: 23, co2ReduktionPP: 23 },
    { name: "Maisach",          sonnenstunden: 1998, wärmepumpen:  590, pvAnteil: 26, co2ReduktionPP: 18 },
    { name: "Gröbenzell",       sonnenstunden: 2008, wärmepumpen:  830, pvAnteil: 16, co2ReduktionPP: 17 },
    { name: "Eichenau",         sonnenstunden: 2015, wärmepumpen:  460, pvAnteil: 18, co2ReduktionPP: 19 },
    { name: "Moorenweis",       sonnenstunden: 1985, wärmepumpen:  230, pvAnteil: 32, co2ReduktionPP: 21 },
  ],
};

const years = [2021, 2022, 2023, 2024, 2025] as const;

type Metric = "sonnenstunden" | "wärmepumpen" | "pvAnteil" | "co2ReduktionPP";

const metrics: { key: Metric; label: string; unit: string; color: string; desc: string }[] = [
  { key: "sonnenstunden",   label: "Sonnenstunden",      unit: "Std/Jahr", color: "#f59e0b", desc: "Gemessene Sonnenstunden pro Jahr (Quelle: DWD / LMU München)" },
  { key: "wärmepumpen",    label: "Wärmepumpen gesamt", unit: "Anlagen",  color: "#2d6a4f", desc: "Kumuliert installierte Wärmepumpen (Hochrechnung BWP / KfW-Daten)" },
  { key: "pvAnteil",       label: "PV-Anteil Neubauten",unit: "%",        color: "#40916c", desc: "Anteil der Neubauten mit PV-Anlage (Marktstammdatenregister)" },
  { key: "co2ReduktionPP", label: "CO₂-Reduktion",      unit: "PP",       color: "#52b788", desc: "Rückgang fossiler Wärmeträger in Prozentpunkten gegenüber 2020 (Energieatlas Bayern)" },
];

type MetricExplanation = {
  yAxis: string;
  unit: string;
  reading: string;
  caveat?: string;
};

const metricExplanations: Record<Metric, MetricExplanation> = {
  sonnenstunden: {
    yAxis: "Sonnenstunden pro Jahr (Std/Jahr)",
    unit: "Eine Stunde, in der die Sonne mit mindestens 120 W/m² scheint — Standardmessgröße des Deutschen Wetterdienstes.",
    reading: "Je höher der Wert, desto mehr Solarertrag ist theoretisch möglich. Ab ~1.800 Std/Jahr rechnen sich PV-Anlagen ohne Einschränkungen.",
    caveat: "Werte variieren je nach Messjahr und lokalem Bewölkungsmuster. Gemeinden im Landkreis FFB liegen alle nah beieinander.",
  },
  wärmepumpen: {
    yAxis: "Installierte Wärmepumpen (Anlagen, kumuliert)",
    unit: "Gesamtbestand aller installierten Wärmepumpen je Gemeinde — nicht der Zubau in einem einzelnen Jahr.",
    reading: "Ein hoher Wert zeigt, wie weit die Wärmewende in der Gemeinde bereits fortgeschritten ist. Größere Gemeinden haben naturgemäß höhere Absolutzahlen.",
    caveat: "Hochrechnung auf Basis BWP-Branchenreport und KfW-Förderstatistik. Keine amtliche Erhebung.",
  },
  pvAnteil: {
    yAxis: "Anteil Neubauten mit PV-Anlage (%)",
    unit: "Prozentualer Anteil der im jeweiligen Jahr fertiggestellten Neubauten, die eine Photovoltaikanlage beim Netzbetreiber angemeldet haben.",
    reading: "0 % = kein Neubau mit PV, 100 % = alle Neubauten mit PV. Werte über 25 % gelten als sehr gut; Bayern schreibt ab 2025 PV für viele Neubauten vor.",
  },
  co2ReduktionPP: {
    yAxis: "CO₂-Reduktion in Prozentpunkten (PP) gegenüber 2020",
    unit: "PP = Prozentpunkte — keine Prozentwerte! Ein Wert von 25 PP bedeutet: Der Anteil fossiler Heizungsträger (Öl, Gas) ist um 25 Prozentpunkte gesunken, z. B. von 70 % auf 45 %.",
    reading: "Je höher der PP-Wert, desto stärker hat sich eine Gemeinde von fossilen Heizungen (Öl, Gas) wegbewegt. Die Messung beginnt bei 0 im Jahr 2020.",
    caveat: "Prozentpunkte sind nicht dasselbe wie Prozent: 10 PP Rückgang bei einem Ausgangswert von 80 % entspricht −12,5 % relativer Veränderung.",
  },
};

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDuration: "600ms", transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

export function KlimadatenPage() {
  const [activeMetric, setActiveMetric] = useState<Metric>("sonnenstunden");
  const [activeYear, setActiveYear] = useState<number>(2025);
  const metric = metrics.find(m => m.key === activeMetric)!;
  const gemeindeDaten = gemeindeDatenByYear[activeYear];
  const sorted = [...gemeindeDaten].sort((a, b) => b[activeMetric] - a[activeMetric]);
  const headerParallax = useParallax(0.3);

  return (
    <div className="min-h-screen pb-24">
      {/* Parallax Page Header */}
      <div className="relative bg-muted/30 border-b py-14 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 will-change-transform"
          style={{ transform: `translateY(${headerParallax}px)` }}
          aria-hidden="true"
        >
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-primary/5" />
          <div className="absolute top-4 left-1/3 w-40 h-40 rounded-full border border-primary/10" />
          <div className="absolute -bottom-16 right-1/4 w-56 h-56 rounded-full bg-primary/[0.03]" />
        </div>
        <div className="relative container mx-auto px-4 lg:px-8 max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">Zahlen & Daten</p>
          <h1 className="text-4xl font-serif font-bold mb-3">Klimadaten Landkreis FFB</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Lokale Messwerte, Gemeindevergleich und Energiewende-Kennzahlen — keine Bundesdurchschnitte.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl mt-12">
        {/* Klimakennzahlen */}
        <h2 className="text-2xl font-serif font-bold mb-6">Germering im Fokus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {klimaKennzahlen.map((k, i) => (
            <RevealSection key={k.label} delay={i * 100}>
              <div className="border rounded-xl p-6 bg-card h-full">
                <div className="text-2xl mb-3">{k.icon}</div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{k.label}</p>
                <p className="text-4xl font-bold font-mono text-primary mb-1">
                  {k.value} <span className="text-lg font-normal text-muted-foreground">{k.unit}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{k.note}</p>
              </div>
            </RevealSection>
          ))}
        </div>

        {/* Gemeindevergleich */}
        <RevealSection>
          <div className="border rounded-xl p-6 md:p-8 bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold">Gemeindevergleich</h2>
                <p className="text-sm text-muted-foreground mt-1">{metric.desc}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {years.map(y => (
                  <button
                    key={y}
                    onClick={() => setActiveYear(y)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeYear === y
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {metrics.map(m => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeMetric === m.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={sorted} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                  formatter={(v: number) => [`${v} ${metric.unit}`, metric.label]}
                />
                <Bar dataKey={activeMetric} fill={metric.color} radius={[4, 4, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>

            {/* Legende & Erklärung */}
            {(() => {
              const ex = metricExplanations[activeMetric];
              return (
                <div className="mt-6 rounded-lg border bg-muted/30 p-4 space-y-2.5 text-sm">
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">Y-Achse</span>
                    <span className="text-foreground font-medium">{ex.yAxis}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">Einheit</span>
                    <span className="text-muted-foreground leading-relaxed">{ex.unit}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">Lesen</span>
                    <span className="text-muted-foreground leading-relaxed">{ex.reading}</span>
                  </div>
                  {ex.caveat && (
                    <div className="flex items-start gap-2.5 pt-1 border-t">
                      <span className="shrink-0 mt-0.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 w-16">Hinweis</span>
                      <span className="text-muted-foreground leading-relaxed">{ex.caveat}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium w-8">#</th>
                    <th className="pb-2 font-medium">Gemeinde</th>
                    <th className="pb-2 font-medium text-right">{metric.label} {activeYear}</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((g, i) => (
                    <tr key={g.name} className={`border-b last:border-0 ${g.name === "Germering" ? "font-semibold text-primary" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5">{g.name}{g.name === "Germering" && <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Fokus</span>}</td>
                      <td className="py-2.5 text-right font-mono">{g[activeMetric]} {metric.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Hochrechnungen auf Basis DWD, Marktstammdatenregister, BWP, Bayerischer Energieatlas. Keine offiziellen Statistiken.</p>
          </div>
        </RevealSection>
      </div>
    </div>
  );
}
