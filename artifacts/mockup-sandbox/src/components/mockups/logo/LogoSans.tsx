export function LogoSans() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f4f7f5", minHeight: "100vh" }}>
      {/* Label */}
      <div style={{ background: "#1a2e23", color: "#6ee7b7", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 16px", textAlign: "center" }}>
        B — Public Sans Bold
      </div>

      {/* Navbar — hell */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2ebe6", padding: "12px 32px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "'Public Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: "-0.04em", color: "#14532d", lineHeight: 1 }}>
            germring.de
          </span>
          <span style={{ fontSize: 10, color: "#6b7280", marginTop: 2, letterSpacing: "0.04em" }}>FFB Energie & Zukunft</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 24, fontSize: 13, color: "#374151" }}>
          <span>Energie</span><span>Kommunalpolitik</span><span>Zahlen</span>
        </div>
      </nav>

      {/* Navbar — dunkel */}
      <nav style={{ background: "#0d2118", padding: "12px 32px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "'Public Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: "-0.04em", color: "#34d399", lineHeight: 1 }}>
            germring.de
          </span>
          <span style={{ fontSize: 10, color: "#6ee7b7", opacity: 0.6, marginTop: 2, letterSpacing: "0.04em" }}>FFB Energie & Zukunft</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 24, fontSize: 13, color: "#d1fae5", opacity: 0.7 }}>
          <span>Energie</span><span>Kommunalpolitik</span><span>Zahlen</span>
        </div>
      </nav>

      {/* Isoliertes Logo groß */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 32px", gap: 48, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "'Public Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: "-0.05em", color: "#14532d" }}>
            germring.de
          </span>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>auf Weiß</div>
        </div>
        <div style={{ textAlign: "center", background: "#0d2118", padding: "16px 24px", borderRadius: 8 }}>
          <span style={{ fontFamily: "'Public Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: "-0.05em", color: "#34d399" }}>
            germring.de
          </span>
          <div style={{ fontSize: 11, color: "#6ee7b7", opacity: 0.5, marginTop: 4 }}>auf Dunkel</div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", paddingBottom: 24 }}>
        Eigenheit: Journalistisch · Selbstbewusst · Leicht kondensiert — wirkt wie Magazin
      </div>
    </div>
  );
}
