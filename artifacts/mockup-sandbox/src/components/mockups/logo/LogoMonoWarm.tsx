/* Variation 1 — Warm & Geerdet
   Eigenheit: Die Mono-Schrift bleibt, aber Farbe und Kontext wärmen sie auf.
   Bernstein-Akzent statt reines Grün, helleres Off-White, weniger Kälte.
   Fühlt sich an wie ein vertrautes Printmagazin, das gerade digitalisiert wurde. */
export function LogoMonoWarm() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#faf9f5", minHeight: "100vh" }}>
      <div style={{ background: "#78350f", color: "#fde68a", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 16px", textAlign: "center" }}>
        Variation 1 — Warm & Geerdet
      </div>

      {/* Hell */}
      <nav style={{ background: "#fffbf0", borderBottom: "1px solid #e9e0cc", padding: "12px 32px", display: "flex", alignItems: "center" }}>
        <div>
          <span style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 700, fontSize: 20, color: "#1c1208", letterSpacing: "-0.01em" }}>
            germring<span style={{ color: "#b45309" }}>.de</span>
          </span>
          <div style={{ fontSize: 10, color: "#92400e", marginTop: 1, opacity: 0.7, letterSpacing: "0.05em" }}>FFB Energie & Zukunft</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 24, fontSize: 13, color: "#57534e" }}>
          <span>Energie</span><span>Kommunalpolitik</span><span>Zahlen</span>
        </div>
      </nav>

      {/* Dunkel — warmes Dunkelbraun statt Tiefgrün */}
      <nav style={{ background: "#1c1007", padding: "12px 32px", display: "flex", alignItems: "center" }}>
        <div>
          <span style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 700, fontSize: 20, color: "#fbbf24", letterSpacing: "-0.01em" }}>
            germring<span style={{ color: "#fde68a" }}>.de</span>
          </span>
          <div style={{ fontSize: 10, color: "#fde68a", opacity: 0.45, marginTop: 1, letterSpacing: "0.05em" }}>FFB Energie & Zukunft</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 24, fontSize: 13, color: "#d6d3d1", opacity: 0.6 }}>
          <span>Energie</span><span>Kommunalpolitik</span><span>Zahlen</span>
        </div>
      </nav>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "36px 32px", gap: 40, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 700, fontSize: 34, color: "#1c1208", letterSpacing: "-0.01em" }}>
            germring<span style={{ color: "#b45309" }}>.de</span>
          </div>
          <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 4 }}>auf Weiß</div>
        </div>
        <div style={{ background: "#1c1007", padding: "16px 24px", borderRadius: 8, textAlign: "center" }}>
          <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 700, fontSize: 34, color: "#fbbf24", letterSpacing: "-0.01em" }}>
            germring<span style={{ color: "#fde68a" }}>.de</span>
          </div>
          <div style={{ fontSize: 11, color: "#fde68a", opacity: 0.4, marginTop: 4 }}>auf Dunkel</div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 12, color: "#a8a29e", paddingBottom: 24 }}>
        Bernstein-Akzent auf .de · Warmes Off-White · Weniger Klinik, mehr Substanz
      </div>
    </div>
  );
}
