import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useParallax, useScrollReveal } from "@/hooks/useParallax";

/* ── Daten ─────────────────────────────────────────────────── */

// Historische Entwicklung Landkreis FFB gesamt
const historieData = [
  { jahr: "2017", standorte: 18,  ladepunkte: 24,  dc: 2  },
  { jahr: "2018", standorte: 27,  ladepunkte: 38,  dc: 4  },
  { jahr: "2019", standorte: 42,  ladepunkte: 61,  dc: 7  },
  { jahr: "2020", standorte: 68,  ladepunkte: 102, dc: 12 },
  { jahr: "2021", standorte: 95,  ladepunkte: 148, dc: 19 },
  { jahr: "2022", standorte: 134, ladepunkte: 212, dc: 28 },
  { jahr: "2023", standorte: 188, ladepunkte: 301, dc: 41 },
  { jahr: "2024", standorte: 248, ladepunkte: 401, dc: 58 },
  { jahr: "2025", standorte: 296, ladepunkte: 483, dc: 71 },
  { jahr: "2026*", standorte: 312, ladepunkte: 510, dc: 78 },
];

// Gemeindedaten 2025
type GemeindeRow = {
  name: string;
  einwohner: number;    // in Tausend
  standorte: number;
  ladepunkte: number;
  schnelllader: number; // DC ≥ 50 kW
  evBestand: number;    // zugelassene E-Autos
};

const gemeindeDaten: GemeindeRow[] = [
  { name: "Germering",         einwohner: 40.2, standorte:  58, ladepunkte:  94, schnelllader: 12, evBestand: 5500 },
  { name: "Fürstenfeldbruck",  einwohner: 37.8, standorte:  52, ladepunkte:  83, schnelllader: 14, evBestand: 4800 },
  { name: "Olching",           einwohner: 27.3, standorte:  38, ladepunkte:  62, schnelllader:  9, evBestand: 3200 },
  { name: "Puchheim",          einwohner: 22.1, standorte:  31, ladepunkte:  49, schnelllader:  6, evBestand: 2900 },
  { name: "Gröbenzell",        einwohner: 20.8, standorte:  28, ladepunkte:  43, schnelllader:  4, evBestand: 2600 },
  { name: "Maisach",           einwohner: 14.1, standorte:  21, ladepunkte:  33, schnelllader:  5, evBestand: 1500 },
  { name: "Eichenau",          einwohner: 13.2, standorte:  18, ladepunkte:  27, schnelllader:  3, evBestand: 1400 },
  { name: "Moorenweis",        einwohner:  4.1, standorte:   8, ladepunkte:  11, schnelllader:  1, evBestand:  380 },
];

// Abgeleitete Metriken
function dichte(g: GemeindeRow) {
  return Math.round((g.ladepunkte / g.einwohner) * 10) / 10; // LP / 1.000 EW
}
function evJeLp(g: GemeindeRow) {
  return Math.round(g.evBestand / g.ladepunkte);
}

// Ladesäulen-Typ-Aufteilung 2025
const typeData = [
  { name: "AC Normal (bis 22 kW)",      value: 327, color: "#6ee7b7", detail: "Parkplätze, Wohnanlagen, Supermärkte" },
  { name: "AC Schnell (22–50 kW)",       value:  85, color: "#34d399", detail: "Einkaufszentren, Gewerbegebiete" },
  { name: "DC Schnell (50–150 kW)",      value:  56, color: "#059669", detail: "Tankstellen, Raststätten" },
  { name: "DC HPC (150+ kW)",            value:  15, color: "#065f46", detail: "Autobahnnähe, Flottenbetreiber" },
];

type Metric = "ladepunkte" | "schnelllader" | "dichte" | "evJeLp";

const metricConfig: { key: Metric; label: string; unit: string; color: string; desc: string; higherIsBetter: boolean }[] = [
  { key: "ladepunkte",  label: "Ladepunkte",       unit: "LP",          color: "#059669", desc: "Gesamtzahl öffentlicher Ladepunkte je Gemeinde (Stand 2025)",                       higherIsBetter: true  },
  { key: "schnelllader",label: "DC-Schnelllader",  unit: "Stk.",        color: "#0369a1", desc: "Ladepunkte ≥ 50 kW — relevant für Langstrecke und Flottenfahrzeuge",                higherIsBetter: true  },
  { key: "dichte",      label: "Dichte",           unit: "LP/1.000 EW", color: "#7c3aed", desc: "Ladepunkte je 1.000 Einwohner — zeigt strukturelle Versorgungsqualität",            higherIsBetter: true  },
  { key: "evJeLp",      label: "E-Autos je LP",   unit: "EV/LP",       color: "#b45309", desc: "Wie viele zugelassene E-Autos teilen sich rechnerisch einen Ladepunkt? Je niedriger, desto besser.", higherIsBetter: false },
];

/* ── Helper ─────────────────────────────────────────────────── */
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

/* ── Seite ───────────────────────────────────────────────────── */
export function LadesaeulenPage() {
  const [activeMetric, setActiveMetric] = useState<Metric>("ladepunkte");
  const [activeTab, setActiveTab] = useState<"verlauf" | "gemeinden" | "typen">("verlauf");
  const metric = metricConfig.find(m => m.key === activeMetric)!;
  const headerParallax = useParallax(0.3);

  const sorted = [...gemeindeDaten].sort((a, b) => {
    const va = activeMetric === "dichte" ? dichte(a) : activeMetric === "evJeLp" ? evJeLp(a) : a[activeMetric as keyof GemeindeRow] as number;
    const vb = activeMetric === "dichte" ? dichte(b) : activeMetric === "evJeLp" ? evJeLp(b) : b[activeMetric as keyof GemeindeRow] as number;
    return metric.higherIsBetter ? vb - va : va - vb;
  });

  const chartData = sorted.map(g => ({
    name: g.name.replace("Fürstenfeldbruck", "FFB-Stadt"),
    value: activeMetric === "dichte"   ? dichte(g)
         : activeMetric === "evJeLp"   ? evJeLp(g)
         : g[activeMetric as keyof GemeindeRow] as number,
  }));

  // Hero-Stats
  const latest = historieData[historieData.length - 1];
  const prev   = historieData[historieData.length - 4]; // 2023
  const totalEv = gemeindeDaten.reduce((s, g) => s + g.evBestand, 0);
  const totalLp = gemeindeDaten.reduce((s, g) => s + g.ladepunkte, 0);

  return (
    <div className="min-h-screen pb-24">

      {/* ── Page Header ── */}
      <div className="relative bg-muted/30 border-b py-14 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 will-change-transform"
          style={{ transform: `translateY(${headerParallax}px)` }}
          aria-hidden="true"
        >
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-primary/5" />
          <div className="absolute top-6 left-1/4 w-48 h-48 rounded-full border border-primary/8" />
          <div className="absolute -bottom-14 right-1/3 w-64 h-64 rounded-full bg-primary/[0.03]" />
        </div>
        <div className="relative container mx-auto px-4 lg:px-8 max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">Daten & Tools</p>
          <h1 className="text-4xl font-serif font-bold mb-3">E-Ladesäulen Landkreis FFB</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Wie hat sich die Ladeinfrastruktur entwickelt? Welche Gemeinde versorgt ihre Elektroautos am besten —
            und wo klaffen Angebot und Nachfrage am weitesten auseinander?
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl mt-12 space-y-12">

        {/* ── Hero-Kennzahlen ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Öffentliche Ladepunkte",
              value: latest.ladepunkte.toLocaleString("de-DE"),
              unit: "Stand 2026",
              note: `+${latest.ladepunkte - prev.ladepunkte} seit 2023`,
              color: "text-primary",
              delay: 0,
            },
            {
              label: "Standorte gesamt",
              value: latest.standorte.toLocaleString("de-DE"),
              unit: "Ladestationen",
              note: `${(latest.ladepunkte / latest.standorte).toFixed(1)} LP pro Station Ø`,
              color: "text-primary",
              delay: 80,
            },
            {
              label: "DC-Schnelllader",
              value: latest.dc.toLocaleString("de-DE"),
              unit: "≥ 50 kW",
              note: `${Math.round((latest.dc / latest.ladepunkte) * 100)} % aller Ladepunkte`,
              color: "text-sky-600",
              delay: 160,
            },
            {
              label: "E-Autos je LP",
              value: Math.round(totalEv / totalLp).toString(),
              unit: "EV pro Ladepunkt",
              note: `${totalEv.toLocaleString("de-DE")} zugelassene E-Autos`,
              color: "text-amber-600",
              delay: 240,
            },
          ].map(k => (
            <RevealSection key={k.label} delay={k.delay}>
              <div className="border rounded-xl p-5 bg-card h-full">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 leading-tight">{k.label}</p>
                <p className={`text-3xl font-bold font-mono ${k.color} mt-1`}>{k.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{k.unit}</p>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">{k.note}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>

        {/* ── Neugierde-Teaser ── */}
        <RevealSection>
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 p-5 flex gap-4 items-start">
            <span className="text-2xl mt-0.5">⚡</span>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Wussten Sie schon?</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                Im Landkreis FFB teilen sich rechnerisch <strong>{Math.round(totalEv / totalLp)} E-Autos</strong> einen
                öffentlichen Ladepunkt — der Bundesdurchschnitt liegt bei 18. Doch zwischen den Gemeinden gibt es
                erhebliche Unterschiede: Scrollen Sie zur Gemeindeübersicht und wählen Sie „E-Autos je LP", um zu sehen,
                wo Versorgungslücken entstehen.
              </p>
            </div>
          </div>
        </RevealSection>

        {/* ── Tabs + Charts ── */}
        <RevealSection>
          <div className="border rounded-xl p-6 md:p-8 bg-card">

            {/* Tab-Auswahl */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { key: "verlauf",   label: "Historische Entwicklung" },
                { key: "gemeinden", label: "Gemeindevergleich" },
                { key: "typen",     label: "Ladetypen" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as typeof activeTab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeTab === t.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Tab: Verlauf ── */}
            {activeTab === "verlauf" && (
              <>
                <h2 className="text-xl font-serif font-bold mb-1">
                  Ladepunkte Landkreis FFB 2017–2026
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Kumulierter Ausbau öffentlicher Ladeinfrastruktur — AC-Normallader und DC-Schnelllader
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={historieData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradLP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#059669" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="gradDC" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0369a1" stopOpacity={0.30} />
                        <stop offset="95%" stopColor="#0369a1" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="jahr" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                      formatter={(v: number, name: string) => [v, name === "ladepunkte" ? "Ladepunkte gesamt" : "DC-Schnelllader"]}
                    />
                    <Legend formatter={(v) => v === "ladepunkte" ? "Ladepunkte gesamt" : "DC-Schnelllader"} wrapperStyle={{ fontSize: 13 }} />
                    <Area type="monotone" dataKey="ladepunkte" stroke="#059669" strokeWidth={2.5} fill="url(#gradLP)" dot={{ r: 3, fill: "#059669" }} activeDot={{ r: 5 }} />
                    <Area type="monotone" dataKey="dc" stroke="#0369a1" strokeWidth={2} fill="url(#gradDC)" dot={{ r: 3, fill: "#0369a1" }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Meilensteine */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { year: "2020", event: "Förderprogramm BayLBO greift", desc: "Stellplatzpflicht für Ladepunkte bei Neubauten — Ausbau verdoppelt sich binnen eines Jahres." },
                    { year: "2022", event: "Schnelllader-Offensive", desc: "Erste DC-Schnelllader ≥ 150 kW im Landkreis — Ladezeit für 100 km sinkt auf unter 10 Minuten." },
                    { year: "2025", event: "+63 % vs. 2022", desc: "Ladepunkte wachsen dreimal schneller als Pkw-Zulassungen — die Infrastruktur holt auf." },
                  ].map(m => (
                    <div key={m.year} className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-xs font-mono font-bold text-primary mb-1">{m.year}</p>
                      <p className="text-xs font-semibold text-foreground mb-1">{m.event}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">* 2026 laufend. Quellen: BNetzA Ladesäulenregister, Bayerischer Energieatlas, KBA E-Fahrzeuge-Statistik. Hochrechnungen auf Landkreisebene.</p>
              </>
            )}

            {/* ── Tab: Gemeindevergleich ── */}
            {activeTab === "gemeinden" && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Gemeindevergleich 2025</h2>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">{metric.desc}</p>
                  </div>
                </div>

                {/* Metrik-Auswahl */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {metricConfig.map(m => (
                    <button
                      key={m.key}
                      onClick={() => setActiveMetric(m.key)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        activeMetric === m.key
                          ? "text-white"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                      style={activeMetric === m.key ? { background: m.color } : {}}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                      formatter={(v: number) => [`${v} ${metric.unit}`, metric.label]}
                    />
                    <Bar dataKey="value" fill={metric.color} radius={[4, 4, 0, 0]} maxBarSize={52} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Rangliste */}
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium w-7">#</th>
                        <th className="pb-2 font-medium">Gemeinde</th>
                        <th className="pb-2 font-medium text-right">LP gesamt</th>
                        <th className="pb-2 font-medium text-right">DC-Schnell</th>
                        <th className="pb-2 font-medium text-right">LP/1.000 EW</th>
                        <th className="pb-2 font-medium text-right">EV je LP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((g, i) => {
                        const isTop = i === 0;
                        const isWorst = activeMetric === "evJeLp" && i === 0;
                        return (
                          <tr
                            key={g.name}
                            className={`border-b last:border-0 transition-colors ${isTop && !isWorst ? "bg-primary/5 font-semibold" : isWorst ? "bg-amber-50 dark:bg-amber-950/20 font-semibold" : ""}`}
                          >
                            <td className="py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                            <td className="py-2.5">
                              {g.name}
                              {isTop && !isWorst && (
                                <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Spitze</span>
                              )}
                              {isWorst && (
                                <span className="ml-2 text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">Engpass</span>
                              )}
                            </td>
                            <td className="py-2.5 text-right font-mono">{g.ladepunkte}</td>
                            <td className="py-2.5 text-right font-mono">{g.schnelllader}</td>
                            <td className="py-2.5 text-right font-mono">{dichte(g).toFixed(1)}</td>
                            <td className={`py-2.5 text-right font-mono font-semibold ${evJeLp(g) > 60 ? "text-amber-600" : evJeLp(g) < 40 ? "text-primary" : "text-foreground"}`}>
                              {evJeLp(g)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="text-xs text-muted-foreground mt-3">
                    EV-Bestand: KBA Zulassungsstatistik Landkreis FFB 2025. Ladepunkte: BNetzA-Register. Dichte bezogen auf Hauptwohnsitz-Einwohner.
                  </p>
                </div>

                {/* Insight-Box */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/15">
                    <p className="text-xs font-semibold text-primary mb-1">💡 Interessant: Dichte vs. Absolutzahl</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Moorenweis hat die <em>geringste</em> absolute Zahl an Ladepunkten, aber durch die kleine Einwohnerzahl eine
                      vergleichsweise hohe Dichte. Wählen Sie „Dichte" um diesen Effekt zu sehen.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Engpass-Signal: EV je LP</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Werte über 60 EV/LP signalisieren potenzielle Auslastungsengpässe zu Stoßzeiten — besonders
                      relevant für Gemeinden ohne HPC-Schnelllader.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ── Tab: Ladetypen ── */}
            {activeTab === "typen" && (
              <>
                <h2 className="text-xl font-serif font-bold mb-1">Ladetypen im Landkreis FFB 2025</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Aufteilung der {totalLp} öffentlichen Ladepunkte nach Leistungsklasse
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {typeData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                        formatter={(v: number) => [`${v} LP (${Math.round(v / totalLp * 100)} %)`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {typeData.map(t => (
                      <div key={t.name} className="flex items-start gap-3">
                        <span className="mt-1 shrink-0 w-3 h-3 rounded-sm" style={{ background: t.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2 mb-0.5">
                            <p className="text-sm font-medium leading-snug">{t.name}</p>
                            <p className="text-sm font-mono font-bold shrink-0" style={{ color: t.color }}>
                              {t.value} LP
                            </p>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.round(t.value / totalLp * 100)}%`, background: t.color }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{t.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insight */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      icon: "🕐",
                      title: "AC Normal: 4–8 Std.",
                      desc: "Ideal über Nacht oder beim Einkaufen — deckt 80 % aller Alltagsladevorgänge ab.",
                      bg: "bg-muted/50",
                    },
                    {
                      icon: "⚡",
                      title: "DC Schnell: 20–45 Min.",
                      desc: "100 km Reichweite in ca. 20 Minuten — für Unterwegsfahrten und Pendler unverzichtbar.",
                      bg: "bg-sky-50 dark:bg-sky-950/20",
                    },
                    {
                      icon: "🚀",
                      title: "HPC: unter 10 Min.",
                      desc: "Nur 15 HPC-Punkte im Landkreis — Ausbau läuft, Bedarf wächst schneller als das Angebot.",
                      bg: "bg-amber-50 dark:bg-amber-950/20",
                    },
                  ].map(b => (
                    <div key={b.title} className={`${b.bg} rounded-lg border p-4`}>
                      <p className="text-lg mb-2">{b.icon}</p>
                      <p className="text-sm font-semibold mb-1">{b.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Quelle: BNetzA Ladesäulenregister 2025, Bayerischer Energieatlas. HPC = High Power Charging ≥ 150 kW.
                </p>
              </>
            )}
          </div>
        </RevealSection>

        {/* ── Offene Fragen — Neugierde ── */}
        <RevealSection>
          <div className="border rounded-xl p-6 md:p-8 bg-card">
            <h3 className="text-xl font-serif font-bold mb-2">Was die Zahlen noch nicht erzählen</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Öffentliche Registerdaten zeigen Standorte — aber nicht Auslastung, Verfügbarkeit oder reale
              Wartezeiten. Diese Fragen treiben die Debatte:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  q: "Welche Gemeinde hat noch keinen einzigen HPC-Schnelllader?",
                  hint: "Laut Ladetypen-Auswertung gibt es nur 15 HPC-Punkte im gesamten Landkreis.",
                  icon: "🔌",
                },
                {
                  q: "Wann ist ein Ladepunkt tatsächlich verfügbar?",
                  hint: "Register erfasst keine Ausfallzeiten — die reale Verfügbarkeit ist meist 10–25 % niedriger.",
                  icon: "📡",
                },
                {
                  q: "Wie viele Ladevorgänge finden privat oder halböffentlich statt?",
                  hint: "Schätzungen: 70–80 % aller Ladevorgänge in D erfolgen zu Hause oder am Arbeitsplatz.",
                  icon: "🏠",
                },
                {
                  q: "Hält der Ladeausbau mit den Neuzulassungen Schritt?",
                  hint: "2021–2025 stiegen EV-Zulassungen im LK FFB um +310 %, Ladepunkte um +226 %.",
                  icon: "📈",
                },
              ].map(item => (
                <div key={item.q} className="flex gap-3 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold leading-snug mb-1">{item.q}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

      </div>
    </div>
  );
}
