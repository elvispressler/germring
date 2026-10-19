import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";

const AUSRICHTUNGEN = [
  { label: "Süd (optimal)",          faktor: 1.00 },
  { label: "Süd-Ost / Süd-West",     faktor: 0.92 },
  { label: "Ost / West",             faktor: 0.80 },
  { label: "Flachdach",              faktor: 0.95 },
];

// Germering 2025 Daten
const SONNENSTUNDEN = 2019;
const SPEZIFISCHER_ERTRAG_BASIS = 950; // kWh/kWp bei Süd
const EINSPEISEVERGUETUNG = 0.082; // €/kWh
const STROMPREIS = 0.34; // €/kWh (2026)
const WP_PRO_M2 = 0.22; // kWp pro m² (Standardmodul)
const CO2_PRO_KWH = 0.0004; // t CO₂/kWh (Bundesmix)
const KOSTEN_PRO_KWP = 1395; // € inkl. MwSt.

export function PvRechnerPage() {
  const [flaeche, setFlaeche] = useState(35);
  const [ausrichtungIdx, setAusrichtungIdx] = useState(0);
  const [verbrauch, setVerbrauch] = useState(4500);

  const ausrichtung = AUSRICHTUNGEN[ausrichtungIdx];

  const ergebnis = useMemo(() => {
    const leistung = flaeche * WP_PRO_M2 * ausrichtung.faktor;
    const ertragJahr = leistung * SPEZIFISCHER_ERTRAG_BASIS * (SONNENSTUNDEN / 1650); // skaliert auf lokale Sonnenstunden
    const eigenverbrauchAnteil = Math.min(0.5, verbrauch / ertragJahr * 0.7);
    const eigenverbrauch = ertragJahr * eigenverbrauchAnteil;
    const einspeisung = ertragJahr - eigenverbrauch;
    const ersparnis = eigenverbrauch * STROMPREIS + einspeisung * EINSPEISEVERGUETUNG;
    const investition = leistung * KOSTEN_PRO_KWP;
    const amortisation = investition / ersparnis;
    const co2 = ertragJahr * CO2_PRO_KWH;
    const autarkie = Math.round((eigenverbrauch / verbrauch) * 100);

    return {
      leistung: leistung.toFixed(1),
      ertragJahr: Math.round(ertragJahr).toLocaleString("de-DE"),
      eigenverbrauch: Math.round(eigenverbrauch).toLocaleString("de-DE"),
      eigenverbrauchRaw: Math.round(eigenverbrauch),
      einspeisung: Math.round(einspeisung).toLocaleString("de-DE"),
      ersparnis: Math.round(ersparnis).toLocaleString("de-DE"),
      investition: Math.round(investition).toLocaleString("de-DE"),
      amortisation: amortisation.toFixed(1),
      co2: co2.toFixed(1),
      autarkie: Math.min(autarkie, 99),
      einspeisungVerg: Math.round(einspeisung * EINSPEISEVERGUETUNG).toLocaleString("de-DE"),
    };
  }, [flaeche, ausrichtungIdx, verbrauch]);

  const bewertung = parseFloat(ergebnis.amortisation) < 9 ? { label: "Sehr gut", color: "text-green-600" }
    : parseFloat(ergebnis.amortisation) < 12 ? { label: "Gut", color: "text-amber-600" }
    : { label: "Akzeptabel", color: "text-muted-foreground" };

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-muted/30 border-b py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">Praxis & Zukunft</p>
          <h1 className="text-4xl font-serif font-bold mb-3">PV-Potenzial-Rechner</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Individuelle Hochrechnung auf Basis echter Germering-Klimadaten —{" "}
            <strong>2.019 Sonnenstunden/Jahr (2025)</strong>, kein Bundesdurchschnitt.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Eingaben */}
          <div className="space-y-8">
            <div className="border rounded-xl p-6 bg-card">
              <h2 className="text-lg font-bold mb-6">Ihr Dach</h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-medium">Nutzbare Dachfläche</label>
                    <span className="text-sm font-mono font-bold text-primary">{flaeche} m²</span>
                  </div>
                  <Slider min={10} max={120} step={5} value={[flaeche]} onValueChange={([v]) => setFlaeche(v)} />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>10 m²</span><span>120 m²</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-3">Dachausrichtung</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AUSRICHTUNGEN.map((a, i) => (
                      <button
                        key={a.label}
                        onClick={() => setAusrichtungIdx(i)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-colors text-left ${
                          ausrichtungIdx === i
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-medium">Jahresstromverbrauch</label>
                    <span className="text-sm font-mono font-bold text-primary">{verbrauch.toLocaleString("de-DE")} kWh/a</span>
                  </div>
                  <Slider min={1500} max={12000} step={500} value={[verbrauch]} onValueChange={([v]) => setVerbrauch(v)} />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>1.500 kWh</span><span>12.000 kWh</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-sm space-y-1.5">
              <p className="font-semibold text-primary mb-2">Basis: Germering 2025</p>
              <p className="text-muted-foreground">☀️ 2.019 Sonnenstunden/Jahr (Rekordjahr, +22% ggü. Bundesschnitt)</p>
              <p className="text-muted-foreground">⚡ Spezifischer Ertrag: 950 kWh/kWp (Südanlage)</p>
              <p className="text-muted-foreground">💰 Einspeisevergütung: 8,2 ct/kWh (≤ 10 kWp, 2026)</p>
              <p className="text-muted-foreground">🔌 Strompreis: 34 ct/kWh (Haushalt 2026)</p>
            </div>
          </div>

          {/* Ergebnisse */}
          <div className="space-y-4">
            <div className="border rounded-xl p-6 bg-card">
              <h2 className="text-lg font-bold mb-5">Ihr Potenzial</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Installierte Leistung</p>
                  <p className="text-3xl font-bold font-mono text-primary">{ergebnis.leistung}<span className="text-base font-normal text-muted-foreground ml-1">kWp</span></p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Jährlicher Ertrag</p>
                  <p className="text-3xl font-bold font-mono text-primary">{ergebnis.ertragJahr}<span className="text-base font-normal text-muted-foreground ml-1">kWh/a</span></p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Eigenverbrauch</span>
                  <span className="font-mono font-medium">{ergebnis.eigenverbrauch} kWh/a</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Autarkieanteil</span>
                  <span className="font-mono font-medium">{ergebnis.autarkie} %</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Einspeisung</span>
                  <span className="font-mono font-medium">{ergebnis.einspeisung} kWh/a</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Einspeisevergütung</span>
                  <span className="font-mono font-medium">+ {ergebnis.einspeisungVerg} €/a</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b font-semibold">
                  <span>Ersparnis/Jahr gesamt</span>
                  <span className="font-mono text-primary">{ergebnis.ersparnis} €/a</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Investition (netto)</span>
                  <span className="font-mono font-medium">{ergebnis.investition} €</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Amortisation</span>
                  <span className={`font-mono font-medium ${bewertung.color}`}>{ergebnis.amortisation} Jahre — {bewertung.label}</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="text-muted-foreground">CO₂-Einsparung</span>
                  <span className="font-mono font-medium">{ergebnis.co2} t CO₂/Jahr</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Überschlagsrechnung · Keine Rechtsberatung · Energiepreise Stand 2026 · Individuelle Planung durch Fachbetrieb empfohlen
              </p>
            </div>

            <div className="border rounded-xl p-5 bg-card text-sm space-y-3">
              <p className="font-semibold">Nächste Schritte</p>
              <Link href="/foerderung" className="flex items-center gap-2 text-primary hover:underline">
                → BEG-Förderung bis 70 % erklärt
              </Link>
              <a href="https://mein.bafa.de/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                → BAFA-Portal: Antrag stellen (vor Auftragsvergabe!)
              </a>
              <Link href="/kategorie/praxis-zukunft" className="flex items-center gap-2 text-primary hover:underline">
                → Praxis-Artikel: PV-Förderung im Landkreis FFB
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
