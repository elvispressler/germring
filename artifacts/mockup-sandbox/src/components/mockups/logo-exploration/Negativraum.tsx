const colors = {
  paper: "#f3efe5",
  paperDeep: "#e9e3d7",
  ink: "#263c38",
  muted: "#71817a",
  rule: "#d4d5c9",
  white: "#fbfaf6",
};

function NegativeMark({
  size = 100,
  reverse = false,
  compact = false,
  strictMono = false,
}: {
  size?: number;
  reverse?: boolean;
  compact?: boolean;
  strictMono?: boolean;
}) {
  const ground = strictMono
    ? reverse ? "#111111" : "#ffffff"
    : reverse ? colors.ink : colors.paper;
  const shape = strictMono
    ? reverse ? "#ffffff" : "#111111"
    : reverse ? colors.paper : colors.ink;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="G/R als Negativraum in einem offenen Ring"
      style={{ display: "block", flex: "none" }}
    >
      <path
        fill={shape}
        d="M50 4a46 46 0 1 0 45.1 55.1h-15A31 31 0 1 1 72 25l10.4-10.8A45.8 45.8 0 0 0 50 4Z"
      />
      <path
        fill={shape}
        d="M83.4 18.7 94 29.3V50H79V38.5l-6.2-6.2 10.6-13.6Z"
      />
      {!compact && (
        <path
          d="M65.7 37.1a20.7 20.7 0 1 0 3.2 24.1H53.3V50.7h27.2v5.1c0 17.2-13.6 30.8-30.7 30.8S19 72.9 19 55.7 32.7 25 49.8 25c9.7 0 17.6 3.4 23.4 9.8l-7.5 7.8Z"
          fill={ground}
        />
      )}
      {compact ? (
        <path
          d="M30 32v39h11V56h10l15 15h14L62 53c7-3 11-8 11-15 0-11-8-18-21-18H30Zm11 9h10c7 0 11 2 11 7s-4 8-11 8H41V41Z"
          fill={ground}
        />
      ) : (
        <>
          <path
            d="M47.6 50.7h33v5.1c0 17.2-13.6 30.8-30.7 30.8"
            fill="none"
            stroke={ground}
            strokeWidth="10.5"
            strokeLinejoin="round"
          />
          <path
            d="M50 48.5h9.9c7.2 0 11.4 3.7 11.4 9.4 0 5.8-4.2 9.5-11.4 9.5H50V48.5Zm10.1 18.9 15 15.2"
            fill="none"
            stroke={ground}
            strokeWidth="10.5"
            strokeLinejoin="round"
            strokeLinecap="square"
          />
        </>
      )}
    </svg>
  );
}

function TinyLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        color: colors.muted,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 8,
        letterSpacing: "0.15em",
        lineHeight: 1.2,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function ScaleSample({ size, compact = false }: { size: number; compact?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: size,
          height: size,
          display: "grid",
          placeItems: "center",
          borderRadius: size <= 16 ? 2 : 5,
          background: colors.paper,
          boxShadow: "inset 0 0 0 1px rgba(38,60,56,.08)",
        }}
      >
        <NegativeMark size={size} compact={compact} />
      </div>
      <span
        style={{
          color: colors.muted,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 8,
        }}
      >
        {size}px
      </span>
    </div>
  );
}

export function Negativraum() {
  return (
    <main
      style={{
        width: "100%",
        height: "100%",
        minHeight: 480,
        boxSizing: "border-box",
        overflow: "hidden",
        padding: "19px 21px 17px",
        background: colors.paper,
        color: colors.ink,
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: `1px solid ${colors.rule}`,
          paddingBottom: 11,
        }}
      >
        <div>
          <TinyLabel>G/R · Markenprüfung 02</TinyLabel>
          <h1 style={{ margin: "5px 0 0", fontSize: 20, lineHeight: 1, fontWeight: 600, letterSpacing: "-.035em" }}>
            Negativraum-Monogramm
          </h1>
        </div>
        <div
          style={{
            marginTop: 1,
            border: `1px solid ${colors.rule}`,
            borderRadius: 99,
            padding: "5px 9px 4px",
            color: colors.muted,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 8,
            letterSpacing: ".11em",
            textTransform: "uppercase",
          }}
        >
          Stempel / 1C
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1.02fr", gap: 20, paddingTop: 16 }}>
        <div style={{ minWidth: 0 }}>
          <TinyLabel>Zeichen · Positivform</TinyLabel>
          <div
            style={{
              height: 151,
              marginTop: 8,
              display: "grid",
              placeItems: "center",
              background: colors.paperDeep,
              borderRadius: 4,
              position: "relative",
            }}
          >
            <NegativeMark size={126} />
            <span
              style={{
                position: "absolute",
                bottom: 9,
                right: 10,
                color: "#89958d",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 7,
                letterSpacing: ".12em",
              }}
            >
              GR / RING
            </span>
          </div>
          <div style={{ marginTop: 15 }}>
            <TinyLabel>Favicon · reale Pixelgrößen</TinyLabel>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 17, marginTop: 9, paddingLeft: 2 }}>
              <ScaleSample size={16} compact />
              <ScaleSample size={32} />
              <ScaleSample size={58} />
            </div>
          </div>
        </div>

        <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
          <TinyLabel>Wort-Bild-Marke · Navigation</TinyLabel>
          <div
            style={{
              minHeight: 76,
              display: "flex",
              alignItems: "center",
              gap: 11,
              marginTop: 8,
              padding: "10px 11px",
              background: colors.white,
              border: `1px solid ${colors.rule}`,
              borderRadius: 4,
            }}
          >
            <NegativeMark size={47} />
            <div style={{ minWidth: 0 }}>
              <div style={{ whiteSpace: "nowrap", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 21, lineHeight: 1, fontWeight: 700, letterSpacing: "-.065em" }}>
                germring.de
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: colors.muted,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 7,
                  letterSpacing: ".1em",
                }}
              >
                FFB · ENERGIE &amp; ZUKUNFT
              </div>
            </div>
          </div>

          <div style={{ marginTop: 13 }}>
            <TinyLabel>Einfarbig · Negativ auf Tinte</TinyLabel>
            <div
              style={{
                minHeight: 83,
                marginTop: 8,
                padding: "13px 12px",
                display: "flex",
                alignItems: "center",
                gap: 11,
                background: "#111111",
                borderRadius: 4,
              }}
            >
              <NegativeMark size={46} reverse strictMono />
              <div>
                <div style={{ color: "#ffffff", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 20, lineHeight: 1, fontWeight: 700, letterSpacing: "-.065em" }}>
                  germring.de
                </div>
                <div style={{ marginTop: 6, color: "#ffffff", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 7, letterSpacing: ".1em" }}>
                  FFB · ENERGIE &amp; ZUKUNFT
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: 12 }}>
            <TinyLabel>Prüfnotiz</TinyLabel>
            <p style={{ margin: "6px 0 0", color: "#405650", fontSize: 11, lineHeight: 1.45 }}>
              Der geschlossene Körper bündelt Ring und Initialen zu einem ruhigen Masthead-Zeichen. G bleibt die äußere Kontur, R entsteht im gemeinsamen Innenraum — auch als Umkehrung ohne zweite Farbe.
            </p>
          </div>
        </div>
      </section>

      <footer
        style={{
          marginTop: 13,
          borderTop: `1px solid ${colors.rule}`,
          paddingTop: 8,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          color: colors.muted,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 8,
          lineHeight: 1.3,
        }}
      >
        <span>TRADE-OFF</span>
        <span style={{ maxWidth: 365, textAlign: "right" }}>
          Bei 16 px zählt zuerst die kompakte GR-Silhouette; die feine R-Innenform wird erst ab 32 px eindeutig.
        </span>
      </footer>
    </main>
  );
}