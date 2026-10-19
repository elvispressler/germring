/* Variation 2 — Minimal & Still
   Eigenheit: Maximale Reduktion. Kein Sub-Label unter dem Logo, kein Farbakzent —
   nur das reine Wort in der richtigen Größe. Wer sich traut, nichts zu erklären,
   muss sicher sein, dass man ihn kennt. Selbstbewusste Stille. */
export function LogoMonoQuiet() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ background: "#111827", color: "#9ca3af", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 16px", textAlign: "center" }}>
        Variation 2 — Minimal & Still
      </div>

      {/* Hell — kein Subtext, kein Farb-Splitter */}
      <nav style={{ background: "#ffffff", borderBottom: "1px solid #f3f4f6", padding: "14px 32px", display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 400, fontSize: 17, color: "#111827", letterSpacing: "0.01em" }}>
          germring.de
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 24, fontSize: 12, color: "#9ca3af", letterSpacing: "0.02em" }}>
          <span>Energie</span><span>Kommunalpolitik</span><span>Zahlen</span>
        </div>
      </nav>

      {/* Dunkel — auch hier: Ruhe */}
      <nav style={{ background: "#0f172a", padding: "14px 32px", display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 400, fontSize: 17, color: "#e2e8f0", letterSpacing: "0.01em" }}>
          germring.de
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 24, fontSize: 12, color: "#475569", letterSpacing: "0.02em" }}>
          <span>Energie</span><span>Kommunalpolitik</span><span>Zahlen</span>
        </div>
      </nav>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px 32px", gap: 56, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 400, fontSize: 32, color: "#111827", letterSpacing: "0.02em" }}>
            germring.de
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>auf Weiß</div>
        </div>
        <div style={{ background: "#0f172a", padding: "16px 28px", borderRadius: 8, textAlign: "center" }}>
          <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 400, fontSize: 32, color: "#e2e8f0", letterSpacing: "0.02em" }}>
            germring.de
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>auf Dunkel</div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", paddingBottom: 24 }}>
        Regular-Gewicht · Kein Subtext · Kein Farbakzent — das Wort erklärt sich selbst
      </div>
    </div>
  );
}
