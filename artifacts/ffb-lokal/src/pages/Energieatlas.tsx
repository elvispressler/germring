import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

// Energiemix Germering nach Energieträger (Wärmeverbrauch)
const mixTimeline = [
  { jahr: "2020", erdgas: 40, heizoel: 21, wärmepumpe:  9, fernwaerme: 12, pvSolar:  6, holz:  6, sonstiges: 6, fossil: 67, erneuerbar: 19, gemischt: 14 },
  { jahr: "2021", erdgas: 38, heizoel: 20, wärmepumpe: 11, fernwaerme: 13, pvSolar:  7, holz:  6, sonstiges: 5, fossil: 63, erneuerbar: 22, gemischt: 15 },
  { jahr: "2022", erdgas: 36, heizoel: 18, wärmepumpe: 13, fernwaerme: 13, pvSolar:  9, holz:  6, sonstiges: 5, fossil: 59, erneuerbar: 27, gemischt: 14 },
  { jahr: "2023", erdgas: 34, heizoel: 17, wärmepumpe: 15, fernwaerme: 13, pvSolar: 10, holz:  7, sonstiges: 4, fossil: 55, erneuerbar: 31, gemischt: 14 },
  { jahr: "2024", erdgas: 32, heizoel: 16, wärmepumpe: 16, fernwaerme: 14, pvSolar: 11, holz:  7, sonstiges: 4, fossil: 52, erneuerbar: 34, gemischt: 14 },
  { jahr: "2025", erdgas: 30, heizoel: 14, wärmepumpe: 18, fernwaerme: 15, pvSolar: 12, holz:  7, sonstiges: 4, fossil: 48, erneuerbar: 38, gemischt: 14 },
  { jahr: "2026", erdgas: 28, heizoel: 12, wärmepumpe: 20, fernwaerme: 16, pvSolar: 13, holz:  7, sonstiges: 4, fossil: 44, erneuerbar: 42, gemischt: 14 },
];

// Gemeindevergleich Energiemix 2024
const gemeindeAtlas = [
  { name: "Germering",         fossil: 52, erneuerbar: 34, gemischt: 14, wpAnlagen: 1720, gasAnlagen: 7010 },
  { name: "Fürstenfeldbruck",  fossil: 55, erneuerbar: 29, gemischt: 16, wpAnlagen: 1240, gasAnlagen: 8200 },
  { name: "Puchheim",          fossil: 53, erneuerbar: 31, gemischt: 16, wpAnlagen:  890, gasAnlagen: 5100 },
  { name: "Olching",           fossil: 50, erneuerbar: 36, gemischt: 14, wpAnlagen:  980, gasAnlagen: 5800 },
  { name: "Maisach",           fossil: 48, erneuerbar: 38, gemischt: 14, wpAnlagen:  540, gasAnlagen: 2800 },
  { name: "Gröbenzell",        fossil: 57, erneuerbar: 27, gemischt: 16, wpAnlagen:  760, gasAnlagen: 5900 },
  { name: "Eichenau",          fossil: 54, erneuerbar: 30, gemischt: 16, wpAnlagen:  420, gasAnlagen: 3200 },
];

const COLORS = { fossil: "#ef4444", erneuerbar: "#22c55e", gemischt: "#f59e0b" };

type View = "timeline" | "gemeinden";

export function EnergieatlasPage() {
  const [view, setView] = useState<View>("timeline");
  const latestYear = mixTimeline[mixTimeline.length - 1];

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-muted/30 border-b py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">Zahlen & Daten</p>
          <h1 className="text-4xl font-serif font-bold mb-3">Energieatlas Landkreis FFB</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Fossil vs. Erneuerbar — Wärmeverbrauch nach Energieträger und Gemeinde. Wie weit ist der Landkreis wirklich?
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl mt-12 space-y-10">

        {/* Kennzahlen Germering 2024 */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Fossil", value: `${latestYear.fossil} %`, sub: "Erdgas + Heizöl", color: "text-red-500", bar: latestYear.fossil },
            { label: "Erneuerbar", value: `${latestYear.erneuerbar} %`, sub: "WP + PV + Holz + Fernwärme", color: "text-green-600", bar: latestYear.erneuerbar },
            { label: "Gemischt", value: `${latestYear.gemischt} %`, sub: "Hybridlösungen", color: "text-amber-500", bar: latestYear.gemischt },
          ].map(k => (
            <div key={k.label} className="border rounded-xl p-5 bg-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{k.label}</p>
              <p className={`text-3xl font-bold font-mono ${k.color} mb-1`}>{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.sub}</p>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-current" style={{ width: `${k.bar}%`, color: k.color.replace("text-", "") }} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border rounded-xl p-6 md:p-8 bg-card">
          <div className="flex gap-2 mb-8">
            <button onClick={() => setView("timeline")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${view === "timeline" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              Zeitverlauf Germering
            </button>
            <button onClick={() => setView("gemeinden")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${view === "gemeinden" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              Gemeindevergleich 2024
            </button>
          </div>

          {view === "timeline" && (
            <>
              <h2 className="text-xl font-serif font-bold mb-1">Energiemix Germering 2020–2026</h2>
              <p className="text-sm text-muted-foreground mb-6">Entwicklung fossiler vs. erneuerbarer Wärmeverbrauch in Prozentpunkten</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mixTimeline} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="jahr" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} unit="%" domain={[0, 80]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} formatter={(v: number) => [`${v} %`]} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Line type="monotone" dataKey="fossil" name="Fossil" stroke={COLORS.fossil} strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="erneuerbar" name="Erneuerbar" stroke={COLORS.erneuerbar} strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="gemischt" name="Gemischt" stroke={COLORS.gemischt} strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                  <span className="text-red-600 font-semibold">Fossiler Anteil seit 2020:</span>{" "}
                  <span className="text-red-700 dark:text-red-400">−25 PP (67 % → {latestYear.fossil} %)</span>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                  <span className="text-green-600 font-semibold">Erneuerbar seit 2020:</span>{" "}
                  <span className="text-green-700 dark:text-green-400">+{latestYear.erneuerbar - 19} PP (19 % → {latestYear.erneuerbar} %)</span>
                </div>
              </div>
            </>
          )}

          {view === "gemeinden" && (
            <>
              <h2 className="text-xl font-serif font-bold mb-1">Gemeindevergleich Wärmemix 2024</h2>
              <p className="text-sm text-muted-foreground mb-6">Anteil fossil / erneuerbar / gemischt am Wärmeverbrauch je Gemeinde</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gemeindeAtlas} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} formatter={(v: number) => [`${v} %`]} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Bar dataKey="fossil" name="Fossil" stackId="a" fill={COLORS.fossil} />
                  <Bar dataKey="gemischt" name="Gemischt" stackId="a" fill={COLORS.gemischt} />
                  <Bar dataKey="erneuerbar" name="Erneuerbar" stackId="a" fill={COLORS.erneuerbar} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-4">Hochrechnung auf Basis Bayerischer Energieatlas. Keine offiziellen Gemeindedaten.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
