const colors = {
  paper: "#f4f0e7",
  ink: "#263a36",
  muted: "#68746d",
  rule: "#d8d3c6",
  stage: "#e8e5da",
  reverse: "#263a36",
  reverseMuted: "#c6c9bb",
};

function EditorialMark({ size = 120, color = colors.ink }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 120"
      fill="none"
      role="img"
      aria-label="GR-Ligatur aus gemeinsamem Stamm"
      style={{ display: "block", flex: "none" }}
    >
      {/* The G's open bowl and bar meet the R at a deliberately shared stem. */}
      <path
        d="M82 16C68 9 50 10 37 18C18 29 10 49 14 69C18 91 37 105 59 105C80 105 94 91 94 70H113"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
      <path d="M82 16V105" stroke={color} strokeWidth="8" strokeLinecap="butt" />
      <path
        d="M82 16H98C115 16 123 24 123 37C123 51 113 58 91 58H82"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
      <path d="M91 58L119 105" stroke={color} strokeWidth="8" strokeLinecap="butt" />
      {/* Fine editorial terminals keep the drawn forms typographic, not pictorial. */}
      <path d="M76 16H89M76 105H91M109 105H127" stroke={color} strokeWidth="3" strokeLinecap="square" />
    </svg>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <div className="rl-eyebrow">{children}</div>;
}

function Tile({ size, reverse = false }: { size: number; reverse?: boolean }) {
  return (
    <div className="rl-sample">
      <div
        className="rl-tile"
        style={{
          width: size,
          height: size,
          background: reverse ? colors.reverse : colors.stage,
        }}
      >
        <EditorialMark size={size * 0.9} color={reverse ? colors.paper : colors.ink} />
      </div>
      <span>{size} px</span>
    </div>
  );
}

function Lockup({ reverse = false, compact = false }: { reverse?: boolean; compact?: boolean }) {
  const foreground = reverse ? colors.paper : colors.ink;
  const secondary = reverse ? colors.reverseMuted : colors.muted;
  return (
    <div className={`rl-lockup${compact ? " rl-lockup-compact" : ""}`}>
      <EditorialMark size={compact ? 42 : 48} color={foreground} />
      <div>
        <div className="rl-word" style={{ color: foreground }}>
          germring.de
        </div>
        <div className="rl-subline" style={{ color: secondary }}>
          FÜRSTENFELDBRUCK · ENERGIE &amp; ZUKUNFT
        </div>
      </div>
    </div>
  );
}

export function RedaktionelleLigatur() {
  return (
    <main className="rl-board">
      <style>{`
        .rl-board {
          --paper:${colors.paper}; --ink:${colors.ink}; --muted:${colors.muted}; --rule:${colors.rule};
          --stage:${colors.stage}; --reverse:${colors.reverse};
          box-sizing:border-box; width:100%; height:550px; overflow:hidden;
          padding:22px 24px 19px; color:var(--ink); background:var(--paper);
          font-family:"DM Sans","Avenir Next",sans-serif; -webkit-font-smoothing:antialiased;
        }
        .rl-board * { box-sizing:border-box; }
        .rl-eyebrow,.rl-sample span,.rl-subline,.rl-footer-label {
          font-family:"IBM Plex Mono","SFMono-Regular",monospace;
          text-transform:uppercase; letter-spacing:.12em;
        }
        .rl-eyebrow { color:var(--muted); font-size:8px; line-height:1.25; }
        .rl-head { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:12px; border-bottom:1px solid var(--rule); }
        .rl-title { margin:5px 0 0; font-family:"Newsreader",Georgia,serif; font-size:22px; font-weight:500; line-height:1; letter-spacing:-.035em; }
        .rl-index { border:1px solid #c8c6b9; padding:6px 8px; color:#59675f; font:8px "IBM Plex Mono",monospace; letter-spacing:.1em; }
        .rl-main { display:grid; grid-template-columns:1.04fr .96fr; gap:20px; padding-top:16px; }
        .rl-left,.rl-right { min-width:0; }
        .rl-markstage { height:173px; margin-top:7px; display:grid; place-items:center; background:var(--stage); }
        .rl-markstage svg { width:156px; height:134px; }
        .rl-scale { display:flex; align-items:flex-end; gap:15px; margin-top:12px; }
        .rl-sample { display:flex; flex-direction:column; align-items:center; gap:5px; }
        .rl-tile { display:grid; place-items:center; overflow:hidden; }
        .rl-sample span { color:var(--muted); font-size:7px; letter-spacing:.04em; white-space:nowrap; }
        .rl-lockup-area { margin-top:14px; padding-top:10px; border-top:1px solid var(--rule); }
        .rl-lockup { display:flex; align-items:center; gap:10px; min-width:0; }
        .rl-lockup svg { flex:none; }
        .rl-word { font-family:"Newsreader",Georgia,serif; font-size:24px; font-weight:600; letter-spacing:-.045em; line-height:1; white-space:nowrap; }
        .rl-subline { margin-top:6px; font-size:6px; letter-spacing:.09em; white-space:nowrap; }
        .rl-panel { padding:12px; background:#eeece3; border:1px solid var(--rule); }
        .rl-panelhead { display:flex; justify-content:space-between; align-items:center; }
        .rl-oneink { color:var(--muted); font:8px "IBM Plex Mono",monospace; letter-spacing:.12em; }
        .rl-reverse { margin-top:9px; padding:13px 11px 11px; background:var(--reverse); }
        .rl-reverse .rl-word { font-size:20px; }
        .rl-reverse .rl-subline { font-size:6px; }
        .rl-reverse .rl-scale { gap:12px; margin-top:11px; padding-top:9px; border-top:1px solid #536158; }
        .rl-reverse .rl-sample span { color:#c6c9bb; }
        .rl-copy { margin:13px 1px 0; color:#43554e; font-family:"Newsreader",Georgia,serif; font-size:14px; line-height:1.35; }
        .rl-copy strong { color:var(--ink); font-family:"DM Sans",sans-serif; font-size:10px; }
        .rl-note { margin:10px 1px 0; padding-top:9px; border-top:1px solid var(--rule); color:var(--muted); font-size:10px; line-height:1.4; }
        .rl-footer { display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin-top:14px; padding-top:9px; border-top:1px solid var(--rule); color:var(--muted); }
        .rl-footer-label { font-size:7px; white-space:nowrap; }
        .rl-footer-copy { text-align:right; font-size:9px; line-height:1.35; }
        @media(max-width:480px) {
          .rl-board { padding:17px 15px; }
          .rl-main { gap:11px; grid-template-columns:1fr .98fr; }
          .rl-panel { padding:9px; }
          .rl-markstage { height:160px; }
          .rl-markstage svg { width:140px; }
          .rl-word { font-size:21px; }
          .rl-scale { gap:9px; }
          .rl-copy { font-size:12px; }
        }
      `}</style>

      <header className="rl-head">
        <div>
          <Eyebrow>Zeichenstudie · Redaktionelle Ligatur</Eyebrow>
          <h1 className="rl-title">Ein Stamm, zwei Initialen</h1>
        </div>
        <div className="rl-index">GR / 1C</div>
      </header>

      <div className="rl-main">
        <section className="rl-left" aria-label="GR-Monogramm und Wortmarke">
          <Eyebrow>Monogramm · gezeichnete Verbindung</Eyebrow>
          <div className="rl-markstage"><EditorialMark size={156} /></div>
          <Eyebrow>Pixelprobe · bewusst kein Favicon-Trick</Eyebrow>
          <div className="rl-scale">
            <Tile size={16} />
            <Tile size={32} />
            <Tile size={54} />
          </div>
          <div className="rl-lockup-area">
            <Eyebrow>Masthead · eigenständiges Zeichen</Eyebrow>
            <div style={{ marginTop: 7 }}><Lockup /></div>
          </div>
        </section>

        <section className="rl-right" aria-label="Einfarbige Anwendungen und Begründung">
          <div className="rl-panel">
            <div className="rl-panelhead">
              <Eyebrow>Einfarbig · Positiv / Negativ</Eyebrow>
              <span className="rl-oneink">1C</span>
            </div>
            <div className="rl-reverse">
              <Lockup reverse compact />
              <div className="rl-scale">
                <Tile size={16} reverse />
                <Tile size={32} reverse />
              </div>
            </div>
          </div>
          <p className="rl-copy">
            <strong>Gedanke.</strong> Der G-Bogen öffnet sich nach rechts. Sein Schlussstrich wird zum Stamm des R; dessen Schulter und schräges Bein bleiben eigenständig gezeichnet. So teilen die Buchstaben eine echte typografische Struktur statt nur einen Rahmen.
          </p>
          <p className="rl-note">
            <strong>Trade-off:</strong> Der gemeinsame Stamm macht die Ligatur kompakt und merkfähig. In 16 px verschmelzen die Binnenformen; als kleines Browser-Favicon funktioniert sie eher als Zeichen denn als sicher lesbares „GR“.
          </p>
        </section>
      </div>

      <footer className="rl-footer">
        <span className="rl-footer-label">GERMRING.DE · LOKAL BERICHTET</span>
        <span className="rl-footer-copy">Ruhige Zeitungstypografie, ohne Energie-Klischees.</span>
      </footer>
    </main>
  );
}