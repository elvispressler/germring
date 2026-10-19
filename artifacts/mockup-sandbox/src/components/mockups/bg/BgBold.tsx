/* V3 — Satte Welle
   Stärker als V1: Grün hält sich bis zur Mitte, Gradient diagonal.
   Karten bekommen ein leichtes Glassmorphism-Feeling.
   Sieht auf jedem Bildschirm garantiert. */
export function BgBold() {
  const bg = "linear-gradient(135deg, hsl(160,45%,80%) 0%, hsl(160,32%,89%) 40%, #ffffff 72%)";
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: bg, minHeight: "100vh" }}>
      <div style={{ background: "#052e16", color: "#bbf7d0", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 16px", textAlign: "center" }}>
        V3 — Satte Diagonale
      </div>

      <nav style={{ background: "rgba(255,255,255,0.60)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(22,163,74,0.12)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "system-ui", fontWeight: 800, fontSize: 17, color: "#14532d", letterSpacing: "-0.04em" }}>germring.de</span>
        <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#6b7280" }}>
          <span>Energie</span><span>Kommunalpolitik</span><span>Zahlen</span>
        </div>
      </nav>

      <div style={{ margin: "0 24px 20px", borderRadius: 12, height: 110, background: "linear-gradient(135deg,#064e3b,#0d2118)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Hero-Bereich (dunkler Block)</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, margin: "0 24px 16px" }}>
        {["Energie", "Kommunalpolitik", "Klima"].map(t => (
          <div key={t} style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(22,163,74,0.10)", borderRadius: 10, padding: "14px 16px", backdropFilter: "blur(8px)" }}>
            <div style={{ width: 32, height: 4, background: "#16a34a", borderRadius: 2, marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 4 }}>{t}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.4 }}>Kurze Teaser-Zeile über das Thema hier.</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, margin: "0 24px" }}>
        <div style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(22,163,74,0.10)", borderRadius: 10, padding: "14px 16px", height: 60, backdropFilter: "blur(8px)" }} />
        <div style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(22,163,74,0.10)", borderRadius: 10, padding: "14px 16px", height: 60, backdropFilter: "blur(8px)" }} />
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "#6b7280", padding: "16px 0 12px" }}>
        Gradient: <code style={{ background: "rgba(255,255,255,0.6)", padding: "1px 4px", borderRadius: 3 }}>Diagonal, hsl(160,45%,80%) → weiß bei 72%</code>
      </div>
    </div>
  );
}
