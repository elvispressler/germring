const c = {
  paper: "#f3efe5",
  paperDeep: "#e8e3d6",
  ink: "#263e38",
  muted: "#66746b",
  rule: "#d2cdbf",
  panel: "#e9e9df",
  inverse: "#2b453e",
  inverseMuted: "#cbd3ca",
};

function MainMark({ width = 208, color = c.ink }: { width?: number; color?: string }) {
  return (
    <svg
      width={width}
      height={width * 0.69}
      viewBox="0 0 180 124"
      role="img"
      aria-label="Zusammenhängendes GR-Zeichen"
      style={{ display: "block", flex: "none" }}
    >
      <path
        d="M91 22
          C80 13 67 10 53 13
          C31 17 16 35 16 56
          C16 78 32 95 53 97
          C72 99 87 87 91 72
          C92 69 92 66 91 63
          L63 63
          L103 63
          L103 27
          C116 25 132 26 142 34
          C154 44 153 59 143 68
          C134 76 119 76 103 73
          L103 101
          M103 74
          L148 101"
        fill="none"
        stroke={color}
        strokeWidth="8.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicroMark({ size, color }: { size: 16 | 32; color: string }) {
  const is16 = size === 16;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 140"
      role="img"
      aria-label={`GR-Kompaktschnitt, ${size} Pixel`}
      style={{ display: "block", flex: "none" }}
    >
      <path
        d="M95 24
          C84 16 70 15 57 19
          C37 24 24 41 24 61
          C24 82 39 98 59 99
          C76 100 89 89 93 76
          L67 76
          L105 76
          L105 34
          C117 32 131 35 138 43
          C147 53 144 66 135 73
          C127 79 116 79 105 77
          L105 111
          M105 77
          L139 111"
        fill="none"
        stroke={color}
        strokeWidth={is16 ? 20 : 13}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <div className="lkf-eyebrow">{children}</div>;
}

function Lockup({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  const fg = inverse ? c.paper : c.ink;
  const secondary = inverse ? c.inverseMuted : c.muted;
  return (
    <div className={`lkf-lockup${compact ? " lkf-lockup-compact" : ""}`}>
      <MainMark width={compact ? 39 : 47} color={fg} />
      <div className="lkf-lockup-copy">
        <div className="lkf-word" style={{ color: fg }}>germring.de</div>
        {!compact && <div className="lkf-sub" style={{ color: secondary }}>Fürstenfeldbruck · Energie &amp; Zukunft</div>}
      </div>
    </div>
  );
}

export function LinieKompaktFeinschliff() {
  return (
    <main className="lkf-board">
      <style>{`
        .lkf-board {
          box-sizing:border-box; width:100%; height:550px; overflow:hidden;
          padding:20px 23px 15px; color:${c.ink}; background:${c.paper};
          font-family:"Avenir Next","Segoe UI",system-ui,sans-serif;
          -webkit-font-smoothing:antialiased;
        }
        .lkf-board * { box-sizing:border-box; }
        .lkf-eyebrow,.lkf-kicker,.lkf-footer,.lkf-sample-caption,.lkf-size {
          font-family:"IBM Plex Mono","SFMono-Regular",monospace;
          text-transform:uppercase; letter-spacing:.09em;
        }
        .lkf-header { display:flex; align-items:flex-start; justify-content:space-between; border-bottom:1px solid ${c.rule}; padding-bottom:10px; }
        .lkf-eyebrow { color:${c.muted}; font-size:8px; line-height:1.35; }
        .lkf-title { margin:4px 0 0; font:500 21px/1 Georgia,"Times New Roman",serif; letter-spacing:-.035em; }
        .lkf-tag { border:1px solid #bdc7ba; color:#52695d; padding:6px 8px; font:7px/1 "IBM Plex Mono",monospace; letter-spacing:.1em; white-space:nowrap; }
        .lkf-stage { height:174px; margin-top:13px; display:grid; place-items:center; background:${c.panel}; position:relative; }
        .lkf-stage svg { max-width:76%; height:auto; }
        .lkf-stage-note { position:absolute; left:11px; bottom:9px; color:${c.muted}; font:7px "IBM Plex Mono",monospace; letter-spacing:.06em; text-transform:uppercase; }
        .lkf-stage-side { position:absolute; right:11px; top:11px; color:#77847a; font:7px "IBM Plex Mono",monospace; letter-spacing:.07em; text-transform:uppercase; }
        .lkf-lockup-band { display:flex; justify-content:space-between; align-items:center; min-height:68px; margin-top:11px; padding:9px 3px 9px 1px; border-top:1px solid ${c.rule}; border-bottom:1px solid ${c.rule}; }
        .lkf-lockup { display:flex; align-items:center; gap:8px; min-width:0; }
        .lkf-lockup-copy { min-width:0; }
        .lkf-word { white-space:nowrap; font-size:20px; line-height:1; font-weight:700; letter-spacing:-.055em; }
        .lkf-sub { margin-top:5px; white-space:nowrap; font:7px/1.25 "IBM Plex Mono",monospace; letter-spacing:.055em; text-transform:uppercase; }
        .lkf-kicker { color:${c.muted}; font-size:7px; line-height:1.4; text-align:right; max-width:93px; }
        .lkf-lower { display:grid; grid-template-columns:1fr 1fr; gap:13px; margin-top:13px; }
        .lkf-proof { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-top:7px; }
        .lkf-proof-card { height:55px; display:grid; place-items:center; padding:7px; }
        .lkf-positive { background:${c.paperDeep}; }
        .lkf-negative { background:${c.inverse}; }
        .lkf-proof-card .lkf-lockup { gap:6px; }
        .lkf-proof-card .lkf-word { font-size:12px; letter-spacing:-.045em; }
        .lkf-proof-card .lkf-sub { display:none; }
        .lkf-proof-card svg { width:30px; height:auto; }
        .lkf-size-row { display:flex; align-items:flex-end; gap:13px; margin-top:9px; }
        .lkf-size-sample { display:flex; flex-direction:column; align-items:center; gap:4px; }
        .lkf-size-box { display:grid; place-items:center; background:${c.paperDeep}; border:1px solid #d8d2c4; }
        .lkf-size { color:${c.muted}; font-size:6px; letter-spacing:.025em; }
        .lkf-micro-note { margin-left:auto; max-width:116px; color:${c.muted}; font:8px/1.38 Georgia,"Times New Roman",serif; text-align:right; }
        .lkf-note { align-self:end; padding-top:8px; border-top:1px solid ${c.rule}; color:#4e6257; font:10px/1.32 Georgia,"Times New Roman",serif; }
        .lkf-note strong { color:${c.ink}; font:700 7px "IBM Plex Mono",monospace; letter-spacing:.1em; text-transform:uppercase; }
        .lkf-trade { margin-top:7px; padding-top:6px; border-top:1px solid ${c.rule}; color:${c.muted}; font-size:8px; line-height:1.35; }
        .lkf-trade strong { display:block; margin-bottom:2px; color:${c.muted}; font:7px "IBM Plex Mono",monospace; letter-spacing:.1em; text-transform:uppercase; }
        .lkf-footer { display:flex; justify-content:space-between; gap:10px; margin-top:11px; padding-top:7px; border-top:1px solid ${c.rule}; color:${c.muted}; font-size:7px; }
        @media(max-width:480px) {
          .lkf-board { padding:16px 15px 12px; }
          .lkf-stage { height:165px; }
          .lkf-lower { gap:9px; }
          .lkf-proof { gap:5px; }
          .lkf-proof-card { padding:5px; }
          .lkf-lockup-band { min-height:64px; }
          .lkf-word { font-size:18px; }
          .lkf-kicker { max-width:77px; }
        }
      `}</style>

      <header className="lkf-header">
        <div>
          <Eyebrow>Zeichenstudie · optische Verfeinerung</Eyebrow>
          <h1 className="lkf-title">Ein Zug. Klarer gefasst.</h1>
        </div>
        <div className="lkf-tag">3B.3 · FEINSCHLIFF</div>
      </header>

      <section className="lkf-stage" aria-label="Verfeinertes GR-Zeichen">
        <span className="lkf-stage-side">Hauptzeichen · 1C</span>
        <MainMark width={220} />
        <span className="lkf-stage-note">G-Öffnung bleibt offen · R aus derselben Linie</span>
      </section>

      <section className="lkf-lockup-band" aria-label="Wort-Bild-Marke">
        <div>
          <Eyebrow>Wort-Bild-Marke · Masthead</Eyebrow>
          <div style={{ marginTop: 7 }}><Lockup /></div>
        </div>
        <div className="lkf-kicker">Lokal berichtet.<br />Zukunft vor Ort.</div>
      </section>

      <div className="lkf-lower">
        <section aria-label="Einfarbige Anwendungen">
          <Eyebrow>Strenger Einfarbtest · positiv / invers</Eyebrow>
          <div className="lkf-proof">
            <div className="lkf-proof-card lkf-positive"><Lockup compact /></div>
            <div className="lkf-proof-card lkf-negative"><Lockup inverse compact /></div>
          </div>
          <div className="lkf-size-row" aria-label="Favicon-Symbole in Originalgröße">
            {[16, 32].map((size) => (
              <div className="lkf-size-sample" key={size}>
                <div className="lkf-size-box" style={{ width: size, height: size }}>
                  <MicroMark size={size as 16 | 32} color={c.ink} />
                </div>
                <span className="lkf-size">{size}px · 1:1</span>
              </div>
            ))}
            <div className="lkf-micro-note">Kompaktschnitt:<br />kräftiger Stamm,<br />mehr offene Innenfläche.</div>
          </div>
        </section>

        <section aria-label="Gestalterische Begründung">
          <Eyebrow>Was sich verändert</Eyebrow>
          <p className="lkf-note">
            <strong>Saubere Übergabe.</strong><br />
            Das G erhält mehr Atem im offenen rechten Feld. Die Querlinie trifft den R-Stamm als klare T-Verbindung; der R-Bogen öffnet sich, die Diagonale setzt getrennt lesbar an.
          </p>
          <div className="lkf-trade">
            <strong>Trade-off</strong>
            Bei 16 px zählt der GR-Zug als Zeichenrhythmus, nicht als perfekte Buchstabenlesung. Der Mikroschnitt priorisiert Kontrast und Gegenform.
          </div>
        </section>
      </div>

      <footer className="lkf-footer">
        <span>GERMRING.DE / FFB</span>
        <span>Landkreis Fürstenfeldbruck</span>
      </footer>
    </main>
  );
}