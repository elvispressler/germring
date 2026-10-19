const palette = {
  paper: "#f4f0e6",
  paperShade: "#e9e5d9",
  ink: "#243d38",
  quiet: "#68786f",
  rule: "#d5d1c3",
  panel: "#ebece3",
  reverse: "#29433d",
  reverseQuiet: "#bdc9bd",
};

function Gesture({
  width = 220,
  color = palette.ink,
  micro = false,
}: {
  width?: number;
  color?: string;
  micro?: boolean;
}) {
  const stroke = micro ? 23 : 9;
  const path = micro
    ? `M91 20 C82 12 70 9 58 11 C36 14 20 32 19 54 C17 78 34 96 57 98 C77 100 93 88 98 71 C100 65 100 59 98 53 L77 53 L121 53 L128 49 L128 17 C128 17 151 17 163 17 C181 17 192 27 192 42 C192 57 181 67 163 67 L128 67 L128 99 L128 67 L178 99`
    : `M91 20 C82 12 70 9 58 11 C36 14 20 32 19 54 C17 78 34 96 57 98 C77 100 93 88 98 71 C100 65 100 59 98 53 L77 53 L119 53 Q124 53 128 48 L128 17 C128 17 151 17 163 17 C181 17 192 27 192 42 C192 57 181 67 163 67 L128 67 L128 99 L128 67 L178 99`;
  return (
    <svg
      width={width}
      height={width * 0.483}
      viewBox="0 0 240 116"
      fill="none"
      role="img"
      aria-label="Durchgehendes GR-Zeichen mit klarer Übergabe"
      style={{ display: "block", flex: "none", overflow: "visible" }}
    >
      <path
        d={path}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicroSample({ size, inverse = false }: { size: 16 | 32; inverse?: boolean }) {
  return (
    <div className="lu-sample">
      <div
        className="lu-favicon"
        style={{
          width: size,
          height: size,
          background: inverse ? palette.ink : palette.paperShade,
        }}
      >
        <Gesture
          width={size * 0.89}
          color={inverse ? palette.paper : palette.ink}
          micro
        />
      </div>
      <span>{size} px</span>
    </div>
  );
}

function Lockup({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="lu-lockup">
      <Gesture width={58} color={inverse ? palette.paper : palette.ink} />
      <div>
        <div className="lu-word" style={{ color: inverse ? palette.paper : palette.ink }}>
          germring.de
        </div>
        <div
          className="lu-sub"
          style={{ color: inverse ? palette.reverseQuiet : palette.quiet }}
        >
          FÜRSTENFELDBRUCK · ENERGIE &amp; ZUKUNFT
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: string }) {
  return <div className="lu-label">{children}</div>;
}

export function LinieUebergang() {
  return (
    <main className="lu-board">
      <style>{`
        .lu-board {
          box-sizing:border-box; width:100%; height:550px; overflow:hidden;
          padding:21px 24px 16px; color:${palette.ink}; background:${palette.paper};
          font-family:"DM Sans","Avenir Next",sans-serif;
          -webkit-font-smoothing:antialiased;
        }
        .lu-board * { box-sizing:border-box; }
        .lu-mono,.lu-label,.lu-tag,.lu-sub,.lu-sample span,.lu-footer {
          font-family:"IBM Plex Mono","SFMono-Regular",monospace;
          text-transform:uppercase; letter-spacing:.11em;
        }
        .lu-header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:12px; border-bottom:1px solid ${palette.rule}; }
        .lu-label { color:${palette.quiet}; font-size:8px; line-height:1.3; }
        .lu-title { margin:5px 0 0; font-family:"Newsreader",Georgia,serif; font-size:22px; font-weight:500; line-height:1; letter-spacing:-.035em; }
        .lu-tag { padding:6px 8px; border:1px solid #bdc9bd; color:#566c62; font-size:7px; white-space:nowrap; }
        .lu-layout { display:grid; grid-template-columns:1.05fr .95fr; gap:15px; padding-top:15px; }
        .lu-stage { height:147px; margin-top:7px; display:grid; place-items:center; background:${palette.panel}; position:relative; }
        .lu-stage svg { width:220px; height:auto; }
        .lu-stage-note { position:absolute; right:9px; bottom:8px; color:${palette.quiet}; font:7px "IBM Plex Mono",monospace; letter-spacing:.08em; }
        .lu-lockup-block { margin-top:13px; padding:11px 3px 11px; border-top:1px solid ${palette.rule}; border-bottom:1px solid ${palette.rule}; }
        .lu-lockup { display:flex; align-items:center; gap:9px; min-width:0; }
        .lu-word { font-size:21px; line-height:1; font-weight:700; letter-spacing:-.07em; white-space:nowrap; }
        .lu-sub { margin-top:5px; font-size:6px; line-height:1.25; letter-spacing:.095em; white-space:nowrap; }
        .lu-proof { padding:12px; background:${palette.panel}; border:1px solid ${palette.rule}; }
        .lu-proofhead { display:flex; justify-content:space-between; align-items:center; }
        .lu-one { color:${palette.quiet}; font:8px "IBM Plex Mono",monospace; letter-spacing:.1em; }
        .lu-dark { margin-top:9px; padding:12px 10px 10px; background:${palette.reverse}; }
        .lu-dark .lu-word { font-size:17px; }
        .lu-dark .lu-sub { font-size:5px; }
        .lu-dark .lu-lockup { gap:8px; }
        .lu-sizes { display:flex; align-items:flex-end; gap:13px; margin-top:11px; padding-top:9px; border-top:1px solid #53675d; }
        .lu-sample { display:flex; flex-direction:column; align-items:center; gap:5px; }
        .lu-favicon { display:grid; place-items:center; overflow:hidden; border-radius:3px; }
        .lu-sample span { color:${palette.quiet}; font-size:7px; letter-spacing:.03em; white-space:nowrap; }
        .lu-dark .lu-sample span { color:${palette.reverseQuiet}; }
        .lu-insight { margin:11px 1px 0; color:#445b51; font-family:"Newsreader",Georgia,serif; font-size:12px; line-height:1.34; }
        .lu-insight strong { color:${palette.ink}; font-family:"DM Sans",sans-serif; font-size:9px; }
        .lu-trade { margin-top:9px; padding-top:8px; border-top:1px solid ${palette.rule}; color:${palette.quiet}; font-size:9px; line-height:1.35; }
        .lu-trade strong { display:block; margin-bottom:3px; font:7px "IBM Plex Mono",monospace; letter-spacing:.12em; text-transform:uppercase; }
        .lu-footer { display:flex; justify-content:space-between; gap:12px; margin-top:13px; padding-top:8px; border-top:1px solid ${palette.rule}; color:${palette.quiet}; font-size:7px; letter-spacing:.08em; }
        @media(max-width:480px) {
          .lu-board { padding:17px 16px; }
          .lu-layout { gap:10px; grid-template-columns:1fr .96fr; }
          .lu-proof { padding:9px; }
          .lu-stage { height:140px; }
          .lu-stage svg { width:198px; }
          .lu-sizes { gap:9px; }
          .lu-word { font-size:18px; }
        }
      `}</style>

      <header className="lu-header">
        <div>
          <Label>Zeichenstudie · Hypothese B.2</Label>
          <h1 className="lu-title">Klarer Übergang</h1>
        </div>
        <div className="lu-tag">GR · Übergabe</div>
      </header>

      <div className="lu-layout">
        <section aria-label="GR-Zeichen und Wortmarke">
          <Label>Monogramm · verbundener Zug</Label>
          <div className="lu-stage">
            <Gesture width={220} />
            <span className="lu-stage-note">QUERSTRICH → R-STAMM</span>
          </div>
          <div className="lu-lockup-block">
            <Label>Wort-Bild-Marke · Masthead</Label>
            <div style={{ marginTop: 9 }}><Lockup /></div>
          </div>
        </section>

        <section aria-label="Einfarbige und kleine Anwendungen">
          <div className="lu-proof">
            <div className="lu-proofhead">
              <Label>Einfarbig · Umkehrung</Label>
              <span className="lu-one">1C</span>
            </div>
            <div className="lu-dark">
              <Lockup inverse />
              <div className="lu-sizes">
                <MicroSample size={16} inverse />
                <MicroSample size={32} inverse />
              </div>
            </div>
            <p className="lu-insight">
              <strong>Gedanke.</strong> Der G-Querstrich landet über eine kurze, kontrollierte Schulter am R-Stamm. So wird die Übergabe lesbar – und bleibt eine einzige gezeichnete Linie.
            </p>
            <div className="lu-trade">
              <strong>Trade-off</strong>
              Bei 16 px vereinfacht sich die kleine Kehle zur kräftigen Verbindung; der genaue Knick ist erst ab Masthead-Größe sichtbar.
            </div>
          </div>
        </section>
      </div>

      <footer className="lu-footer">
        <span>GERMRING.DE / FFB</span>
        <span>Lokal berichtet · Zukunft vor Ort</span>
      </footer>
    </main>
  );
}