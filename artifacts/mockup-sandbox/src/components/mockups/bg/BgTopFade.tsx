/* V1 — Sanfter Top-Fade
   Grün kommt von oben, wird nach 35% der Seite weiß.
   Ideal für Editorial-Sites: Man sieht es sofort beim Laden,
   danach tritt der Hintergrund zurück und lässt Inhalt führen. */
export function BgTopFade() {
  const bg = "linear-gradient(to bottom, hsl(160,38%,86%) 0%, hsl(160,25%,93%) 25%, #ffffff 55%)";
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: bg, minHeight: "100vh" }}>
      <div style={{ background: "#1a2e23", color: "#6ee7b7", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 16px", textAlign: "center" }}>
        V1 — Sanfter Top-Fade
      </div>

      {/* Navbar */}
      <nav style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "system-ui", fontWeight: 800, fontSize: 17, color: "#14532d", letterSpacing: "-0.04em" }}>germring.de</span>
        <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#6b7280" }}>
          <span>Energie</span><span>Kommunalpolitik</span><span>Zahlen</span>
        </div>
      </nav>

      {/* Hero placeholder */}
      <div style={{ margin: "0 24px 20px", borderRadius: 12, height: 110, background: "linear-gradient(135deg,#064e3b,#0d2118)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Hero-Bereich (dunkler Block)</span>
      </div>

      {/* Cards auf dem Gradient */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, margin: "0 24px 16px" }}>
        {["Energie", "Kommunalpolitik", "Klima"].map(t => (
          <div key={t} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ width: 32, height: 4, background: "#16a34a", borderRadius: 2, marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 4 }}>{t}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.4 }}>Kurze Teaser-Zeile über das Thema hier.</div>
          </div>
        ))}
      </div>

      {/* Zweite Reihe — zeigt wie der Hintergrund bei weißen Karten aussieht */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, margin: "0 24px" }}>
        <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "14px 16px", height: 60 }} />
        <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "14px 16px", height: 60 }} />
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", padding: "16px 0 12px" }}>
        Gradient: <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: 3 }}>hsl(160,38%,86%) → weiß bei 55%</code>
      </div>
    </div>
  );
}
