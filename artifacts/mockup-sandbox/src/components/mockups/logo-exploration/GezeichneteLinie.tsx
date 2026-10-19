const colors = {
  paper: "#f4f0e6",
  paperDeep: "#e9e5d8",
  ink: "#243d38",
  quiet: "#68786f",
  rule: "#d5d1c3",
  panel: "#ebece3",
  inverse: "#29433d",
  inverseQuiet: "#bdc9bd",
};

function LineMark({
  width = 200,
  color = colors.ink,
}: {
  width?: number;
  color?: string;
}) {
  return (
    <svg
      width={width}
      height={width * 0.48}
      viewBox="0 0 240 116"
      fill="none"
      role="img"
      aria-label="Einzügiges GR-Monogramm"
      style={{ display: "block", flex: "none", overflow: "visible" }}
    >
      <path
        d="M91 20
          C82 12 70 9 58 11
          C36 14 20 32 19 54
          C17 78 34 96 57 98
          C77 100 93 88 98 71
          C100 65 100 59 98 53
          L76 53
          L128 53
          L128 17
          C128 17 151 17 163 17
          C181 17 192 27 192 42
          C192 57 181 67 163 67
          L128 67
          L128 99
           L128 67
           L178 99"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Label({ children }: { children: string }) {
  return <div className="gl-label">{children}</div>;
}

function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="gl-wordmark">
      <LineMark width={58} color={inverse ? colors.paper : colors.ink} />
      <div>
        <div className="gl-word" style={{ color: inverse ? colors.paper : colors.ink }}>
          germring.de
        </div>
        <div className="gl-sub" style={{ color: inverse ? colors.inverseQuiet : colors.quiet }}>
          FÜRSTENFELDBRUCK · ENERGIE &amp; ZUKUNFT
        </div>
      </div>
    </div>
  );
}

function Favicon({ size, inverse = false }: { size: number; inverse?: boolean }) {
  return (
    <div className="gl-favicon-sample">
      <div
        className="gl-favicon"
        style={{
          width: size,
          height: size,
          background: inverse ? colors.ink : colors.paperDeep,
        }}
      >
        <LineMark width={size * 0.86} color={inverse ? colors.paper : colors.ink} />
      </div>
      <span>{size} px</span>
    </div>
  );
}

export function GezeichneteLinie() {
  return (
    <main className="gl-board">
      <style>{`
        .gl-board {
          box-sizing:border-box; width:100%; height:550px; overflow:hidden;
          padding:22px 24px 18px; color:${colors.ink}; background:${colors.paper};
          font-family:"DM Sans","Avenir Next",sans-serif;
          -webkit-font-smoothing:antialiased;
        }
        .gl-board * { box-sizing:border-box; }
        .gl-header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:12px; border-bottom:1px solid ${colors.rule}; }
        .gl-label,.gl-tag,.gl-favicon-sample span,.gl-sub,.gl-foot,.gl-index {
          font-family:"IBM Plex Mono","SFMono-Regular",monospace;
          text-transform:uppercase; letter-spacing:.12em;
        }
        .gl-label { color:${colors.quiet}; font-size:8px; line-height:1.3; }
        .gl-title { margin:5px 0 0; font-family:"Newsreader",Georgia,serif; font-size:22px; font-weight:500; line-height:1; letter-spacing:-.035em; }
        .gl-tag { padding:6px 8px; border:1px solid #bdc9bd; color:#566c62; font-size:7px; white-space:nowrap; }
        .gl-main { display:grid; grid-template-columns:1.04fr .96fr; gap:16px; padding-top:16px; }
        .gl-left,.gl-right { min-width:0; }
        .gl-stage { height:158px; margin-top:7px; display:grid; place-items:center; background:${colors.panel}; }
        .gl-stage svg { width:222px; height:auto; }
        .gl-lockup-block { margin-top:16px; padding:13px 4px 12px; border-top:1px solid ${colors.rule}; border-bottom:1px solid ${colors.rule}; }
        .gl-wordmark { display:flex; align-items:center; gap:10px; min-width:0; }
        .gl-word { font-family:"DM Sans","Avenir Next",sans-serif; font-size:21px; line-height:1; font-weight:700; letter-spacing:-.07em; white-space:nowrap; }
        .gl-sub { margin-top:5px; font-size:6px; line-height:1.25; letter-spacing:.095em; white-space:nowrap; }
        .gl-proof { padding:13px 13px 12px; background:${colors.panel}; border:1px solid ${colors.rule}; }
        .gl-proof-head { display:flex; justify-content:space-between; align-items:center; }
        .gl-one { color:${colors.quiet}; font:8px "IBM Plex Mono",monospace; letter-spacing:.1em; }
        .gl-inverse { margin-top:10px; padding:13px 11px 11px; background:${colors.inverse}; }
        .gl-inverse .gl-word { font-size:18px; }
        .gl-inverse .gl-sub { font-size:5.5px; }
        .gl-inverse .gl-wordmark { gap:8px; }
        .gl-sizes { display:flex; align-items:flex-end; gap:13px; margin-top:12px; padding-top:10px; border-top:1px solid #53675d; }
        .gl-favicon-sample { display:flex; flex-direction:column; align-items:center; gap:5px; }
        .gl-favicon { display:grid; place-items:center; overflow:hidden; border-radius:3px; }
        .gl-favicon-sample span { color:${colors.quiet}; font-size:7px; letter-spacing:.03em; white-space:nowrap; }
        .gl-inverse .gl-favicon-sample span { color:${colors.inverseQuiet}; }
        .gl-thought { margin:13px 1px 0; color:#445b51; font-family:"Newsreader",Georgia,serif; font-size:13px; line-height:1.34; }
        .gl-thought strong { color:${colors.ink}; font-family:"DM Sans",sans-serif; font-size:10px; }
        .gl-trade { margin-top:11px; padding-top:9px; border-top:1px solid ${colors.rule}; color:${colors.quiet}; font-size:10px; line-height:1.35; }
        .gl-trade strong { display:block; margin-bottom:4px; font:8px "IBM Plex Mono",monospace; letter-spacing:.12em; text-transform:uppercase; }
        .gl-footer { display:flex; justify-content:space-between; gap:12px; margin-top:15px; padding-top:9px; border-top:1px solid ${colors.rule}; color:${colors.quiet}; font:7px "IBM Plex Mono",monospace; letter-spacing:.08em; }
        @media(max-width:480px) {
          .gl-board { padding:17px 16px; }
          .gl-main { gap:11px; grid-template-columns:1fr .96fr; }
          .gl-proof { padding:10px; }
          .gl-stage { height:145px; }
          .gl-stage svg { width:205px; }
          .gl-sizes { gap:9px; }
          .gl-word { font-size:18px; }
        }
      `}</style>

      <header className="gl-header">
        <div>
          <Label>Zeichenstudie · Hypothese B</Label>
          <h1 className="gl-title">Gezeichnete Linie</h1>
        </div>
        <div className="gl-tag">GR · Einzug</div>
      </header>

      <div className="gl-main">
        <section className="gl-left" aria-label="GR-Zeichen und Wortmarke">
          <Label>Monogramm · durchgehender Zug</Label>
          <div className="gl-stage">
            <LineMark width={222} />
          </div>
          <div className="gl-lockup-block">
            <Label>Wort-Bild-Marke · Masthead</Label>
            <div style={{ marginTop: 10 }}><Wordmark /></div>
          </div>
        </section>

        <section className="gl-right" aria-label="Einfarbiger und negativer Einsatz">
          <div className="gl-proof">
            <div className="gl-proof-head">
              <Label>Einfarbig · Umkehrung</Label>
              <span className="gl-one">1C</span>
            </div>
            <div className="gl-inverse">
              <Wordmark inverse />
              <div className="gl-sizes">
                <Favicon size={16} inverse />
                <Favicon size={32} inverse />
                <Favicon size={48} inverse />
              </div>
            </div>
            <p className="gl-thought">
              <strong>Gedanke.</strong> Ein einziger Zug schreibt erst das G, führt dessen Querstrich bis in den R-Stamm und vollendet dort Bogen und Bein. Die sichtbare Übergabe verbindet beide Initialen, ohne sie zu verschmelzen.
            </p>
            <div className="gl-trade">
              <strong>Trade-off</strong>
              Auf 16 px zählt die markante GR-Rhythmik mehr als die exakte Buchstabenlesung; als Wortmarken-Zeichen bleibt die Linie eindeutig.
            </div>
          </div>
        </section>
      </div>

      <footer className="gl-footer">
        <span className="gl-index">GERMRING.DE / FFB</span>
        <span>Lokal berichtet · Zukunft vor Ort</span>
      </footer>
    </main>
  );
}