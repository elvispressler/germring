/* Variation 3 — Stark & Editorial
   Eigenheit: Maximales Gewicht, Uppercase-Wordmark mit Punkt-Separator zwischen
   "GERMRING" und "DE". Wie ein Magazin-Masthead. Große Geste, keine Entschuldigung.
   Der Grün-Akzent landet auf dem Punkt — klein aber unübersehbar. */
export function LogoMonoBold() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f4f7f5", minHeight: "100vh" }}>
      <div style={{ background: "#052e16", color: "#bbf7d0", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 16px", textAlign: "center" }}>
        Variation 3 — Stark & Editorial
      </div>

      {/* Hell */}
      <nav style={{ background: "#fff", borderBottom: "2px solid #052e16", padding: "10px 32px", display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 700, fontSize: 18, color: "#052e16", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1 }}>
            GERMRING<span style={{ color: "#16a34a" }}>·</span>DE
          </div>
          <div style={{ fontSize: 9, color: "#166534", marginTop: 2, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            FFB Energie & Zukunft
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 24, fontSize: 12, color: "#374151", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          <span>Energie</span><span>Kommunalpolitik</span><span>Zahlen</span>
        </div>
      </nav>

      {/* Dunkel — mit weißer Linie oben */}
      <nav style={{ background: "#052e16", borderTop: "3px solid #16a34a", padding: "10px 32px", display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 700, fontSize: 18, color: "#ffffff", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1 }}>
            GERMRING<span style={{ color: "#4ade80" }}>·</span>DE
          </div>
          <div style={{ fontSize: 9, color: "#86efac", marginTop: 2, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.6 }}>
            FFB Energie & Zukunft
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 24, fontSize: 12, color: "#bbf7d0", opacity: 0.65, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          <span>Energie</span><span>Kommunalpolitik</span><span>Zahlen</span>
        </div>
      </nav>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "36px 32px", gap: 40, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 700, fontSize: 30, color: "#052e16", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            GERMRING<span style={{ color: "#16a34a" }}>·</span>DE
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>auf Weiß</div>
        </div>
        <div style={{ background: "#052e16", padding: "16px 24px", borderRadius: 4, textAlign: "center" }}>
          <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 700, fontSize: 30, color: "#ffffff", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            GERMRING<span style={{ color: "#4ade80" }}>·</span>DE
          </div>
          <div style={{ fontSize: 11, color: "#86efac", opacity: 0.45, marginTop: 4 }}>auf Dunkel</div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", paddingBottom: 24 }}>
        Uppercase · Punkt-Separator · Magazin-Masthead — maximale Geste
      </div>
    </div>
  );
}
