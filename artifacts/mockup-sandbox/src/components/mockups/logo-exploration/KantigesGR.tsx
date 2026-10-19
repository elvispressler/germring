const ink = "#263b38";
const paper = "#f3efe5";
const soft = "#e7e3d8";
const muted = "#727d75";
const line = "#d4d2c7";

function AngularMark({ size = 100, color = ink }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 78"
      fill="none"
      role="img"
      aria-label="Kantiges GR-Monogramm"
      shapeRendering="crispEdges"
      style={{ display: "block", flex: "none" }}
    >
      <path
        d="M5 5H44V16H16V62H35V50H26V39H48V73H5V5Z"
        fill={color}
      />
      <path
        d="M53 5H77C89 5 96 12 96 24C96 33 91 39 82 42L97 73H82L68 44H64V73H53V5ZM64 16V33H76C82 33 85 30 85 24C85 19 82 16 76 16H64Z"
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  );
}

function Label({ children }: { children: string }) {
  return (
    <div
      style={{
        color: muted,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 8,
        letterSpacing: ".14em",
        lineHeight: 1.2,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function Scale({ reversed = false }: { reversed?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
      {[16, 32].map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: size,
              height: size,
              display: "grid",
              placeItems: "center",
              background: reversed ? ink : paper,
              border: reversed ? "none" : `1px solid ${line}`,
            }}
          >
            <AngularMark size={size} color={reversed ? paper : ink} />
          </div>
          <span style={{ color: reversed ? "#c2cbc1" : muted, font: "8px ui-monospace, monospace" }}>{size}px</span>
        </div>
      ))}
    </div>
  );
}

function Lockup({ reversed = false }: { reversed?: boolean }) {
  const foreground = reversed ? paper : ink;
  const secondary = reversed ? "#bdc7bd" : muted;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
      <AngularMark size={42} color={foreground} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: foreground,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: "-.065em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          germring.de
        </div>
        <div
          style={{
            marginTop: 6,
            color: secondary,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 7,
            letterSpacing: ".1em",
            whiteSpace: "nowrap",
          }}
        >
          LANDKREIS FÜRSTENFELDBRUCK · ENERGIE &amp; ZUKUNFT
        </div>
      </div>
    </div>
  );
}

export function KantigesGR() {
  return (
    <main
      style={{
        boxSizing: "border-box",
        width: "100%",
        height: 540,
        overflow: "hidden",
        padding: "19px 22px 16px",
        background: paper,
        color: ink,
        fontFamily: "'DM Sans', 'Avenir Next', sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `1px solid ${line}`, paddingBottom: 11 }}>
        <div>
          <Label>Zeichenstudie · Hypothese B</Label>
          <h1 style={{ margin: "5px 0 0", fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 500, letterSpacing: "-.035em", lineHeight: 1 }}>
            Kantiges GR-Monogramm
          </h1>
        </div>
        <div style={{ border: `1px solid ${line}`, padding: "5px 7px", color: muted, font: "8px ui-monospace, monospace", letterSpacing: ".1em" }}>
          WINKEL / 1C
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 14 }}>
        <div style={{ minWidth: 0 }}>
          <Label>Zeichen · Positivform</Label>
          <div style={{ height: 137, marginTop: 7, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 13px", background: soft }}>
            <div style={{ display: "grid", placeItems: "center", width: 112, height: 112, background: "#f5f2e9" }}>
              <AngularMark size={99} />
            </div>
            <div>
              <Label>Pixelprobe</Label>
              <div style={{ marginTop: 10 }}><Scale /></div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Label>Wort-Bild-Marke · Masthead</Label>
            <div style={{ marginTop: 8, padding: "13px 10px", borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
              <Lockup />
            </div>
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Label>Einfarbig · Umkehrung</Label>
            <span style={{ color: muted, font: "8px ui-monospace, monospace" }}>1C</span>
          </div>
          <div style={{ marginTop: 7, minHeight: 139, padding: "15px 12px 11px", background: ink }}>
            <Lockup reversed />
            <div style={{ display: "flex", alignItems: "flex-end", gap: 15, marginTop: 15, paddingTop: 10, borderTop: "1px solid #53625a" }}>
              <Scale reversed />
              <span style={{ paddingBottom: 16, color: "#bdc7bd", font: "7px ui-monospace, monospace", letterSpacing: ".08em" }}>POSITIV / NEGATIV</span>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Label>Gedanke</Label>
            <p style={{ margin: "6px 0 0", color: "#46534d", fontFamily: "Georgia, serif", fontSize: 12, lineHeight: 1.4 }}>
              G als kantige, offene Grundform; das R steht daneben als eigenständiger Buchstabe. Der gemeinsame Block macht daraus ein sachliches Zeichen statt eines Energierings.
            </p>
          </div>
          <div style={{ marginTop: 12, paddingTop: 9, borderTop: `1px solid ${line}` }}>
            <Label>Trade-off</Label>
            <p style={{ margin: "5px 0 0", color: muted, fontSize: 10, lineHeight: 1.35 }}>
              Bei 16 px bleibt die blockige GR-Anmutung, die Buchstaben sind dort nicht einzeln zuverlässig lesbar. Die Wirkung ist eher institutionell als warm.
            </p>
          </div>
        </div>
      </section>

      <footer style={{ display: "flex", justifyContent: "space-between", marginTop: 13, paddingTop: 8, borderTop: `1px solid ${line}`, color: muted, font: "7px ui-monospace, monospace", letterSpacing: ".08em" }}>
        <span>GERMRING.DE / LOKAL. SACHLICH. ZUKUNFTSNAH.</span>
        <span>FÜRSTENFELDBRUCK</span>
      </footer>
    </main>
  );
}