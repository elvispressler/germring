const colors = {
  paper: "#f2efe5",
  stage: "#e4e7dd",
  ink: "#1d3938",
  accent: "#bd634a",
  muted: "#687771",
  rule: "#d4d6ca",
  inverse: "#f4f0e6",
};

function NestedMark({
  size = 110,
  color = colors.ink,
  accent = colors.accent,
}: {
  size?: number;
  color?: string;
  accent?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 1.18}
      viewBox="0 0 100 118"
      fill="none"
      role="img"
      aria-label="Verschachteltes GR-Monogramm"
      style={{ display: "block", flex: "none" }}
    >
      {/* One uninterrupted stem binds the upper G and lower R. */}
      <path
        d="M33 18V101"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="square"
      />
      {/* Upper G: a broad editorial bowl, deliberately open at the right. */}
      <path
        d="M72 26C65 17 54 13 43 14C25 15 14 29 14 47C14 65 27 78 45 78C56 78 65 74 72 67V51H49"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      {/* The single rust cut makes the G's inward bar feel like a printed cue. */}
      <path d="M51 51H72" stroke={accent} strokeWidth="4" strokeLinecap="square" />
      {/* Lower R: its bowl shares the G's upright; the leg exits cleanly. */}
      <path
        d="M34 68H51C64 68 72 76 72 88C72 100 64 107 51 107H34M55 105L75 117"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path d="M59 108L72 116" stroke={accent} strokeWidth="4" strokeLinecap="square" />
    </svg>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <div className="vg-eyebrow">{children}</div>;
}

function Lockup({ reversed = false }: { reversed?: boolean }) {
  const fg = reversed ? colors.inverse : colors.ink;
  const secondary = reversed ? "#c2cec5" : colors.muted;
  return (
    <div className="vg-lockup">
      <NestedMark size={37} color={fg} accent={fg} />
      <div>
        <div className="vg-word" style={{ color: fg }}>germring.de</div>
        <div className="vg-descriptor" style={{ color: secondary }}>FÜRSTENFELDBRUCK · ENERGIE &amp; ZUKUNFT</div>
      </div>
    </div>
  );
}

function PixelSample({ size, reversed = false }: { size: number; reversed?: boolean }) {
  return (
    <div className="vg-sample">
      <div
        className="vg-pixel"
        style={{
          width: size,
          height: size,
          background: reversed ? colors.ink : colors.paper,
          borderColor: reversed ? colors.ink : colors.rule,
        }}
      >
        <NestedMark
          size={size * 0.82}
          color={reversed ? colors.inverse : colors.ink}
          accent={reversed ? colors.inverse : colors.ink}
        />
      </div>
      <span>{size}px</span>
    </div>
  );
}

export function VerschachteltesGR() {
  return (
    <main className="vg-board">
      <style>{`
        .vg-board {
          --paper:${colors.paper}; --ink:${colors.ink}; --muted:${colors.muted};
          box-sizing:border-box; width:100%; height:550px; overflow:hidden;
          padding:22px 25px 18px; color:var(--ink); background:var(--paper);
          font-family:"DM Sans","Avenir Next",sans-serif; -webkit-font-smoothing:antialiased;
        }
        .vg-board * { box-sizing:border-box; }
        .vg-head { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid ${colors.rule}; padding-bottom:13px; }
        .vg-eyebrow,.vg-tag,.vg-sample span,.vg-descriptor,.vg-footer,.vg-index {
          font-family:"IBM Plex Mono","SFMono-Regular",monospace; text-transform:uppercase; letter-spacing:.12em;
        }
        .vg-eyebrow { color:var(--muted); font-size:9px; line-height:1.25; }
        .vg-title { margin:5px 0 0; font-family:"Newsreader",Georgia,serif; font-weight:500; font-size:23px; letter-spacing:-.035em; line-height:1; }
        .vg-tag { border:1px solid #bdc9bd; padding:6px 8px; color:#526a61; font-size:8px; white-space:nowrap; }
        .vg-body { display:grid; grid-template-columns:1fr .94fr; gap:17px; padding-top:17px; }
        .vg-left,.vg-right { min-width:0; }
        .vg-stage { height:194px; margin-top:8px; position:relative; display:grid; place-items:center; background:${colors.stage}; }
        .vg-stage:before { content:""; position:absolute; height:146px; width:1px; left:50%; top:24px; background:rgba(29,57,56,.12); }
        .vg-stage svg { position:relative; z-index:1; width:131px; height:155px; }
        .vg-scale { display:flex; align-items:flex-end; gap:13px; margin-top:9px; }
        .vg-sample { display:flex; flex-direction:column; align-items:center; gap:5px; }
        .vg-pixel { display:grid; place-items:center; border:1px solid; overflow:hidden; border-radius:3px; }
        .vg-pixel svg { display:block; }
        .vg-sample span { font-size:7px; color:var(--muted); letter-spacing:.04em; }
        .vg-lockup-area { margin-top:16px; padding-top:11px; border-top:1px solid ${colors.rule}; }
        .vg-lockup { display:flex; align-items:center; gap:9px; min-width:0; }
        .vg-word { font-size:22px; font-weight:700; letter-spacing:-.07em; line-height:1; white-space:nowrap; }
        .vg-descriptor { margin-top:5px; font-size:6.5px; letter-spacing:.105em; white-space:nowrap; }
        .vg-right { padding:13px; background:#e9ece4; border:1px solid ${colors.rule}; }
        .vg-right-head { display:flex; justify-content:space-between; align-items:center; }
        .vg-onec { font:8px "IBM Plex Mono",monospace; color:var(--muted); }
        .vg-inverse { margin-top:10px; padding:14px 12px 12px; background:var(--ink); }
        .vg-inverse .vg-word { font-size:19px; }
        .vg-inverse .vg-descriptor { font-size:6px; }
        .vg-inverse .vg-scale { gap:12px; padding-top:10px; border-top:1px solid #49615a; }
        .vg-inverse .vg-sample span { color:#c2cec5; }
        .vg-thought { margin:15px 0 0; color:#425851; font-family:"Newsreader",Georgia,serif; font-size:13px; line-height:1.36; }
        .vg-thought strong { color:var(--ink); font-family:"DM Sans",sans-serif; font-size:10px; }
        .vg-footer { display:flex; gap:12px; align-items:flex-start; margin-top:15px; padding-top:10px; border-top:1px solid ${colors.rule}; color:var(--muted); font-size:8px; letter-spacing:.08em; }
        .vg-index { flex:none; color:#a7533e; font-size:8px; }
        .vg-footer-copy { font-family:"DM Sans",sans-serif; text-transform:none; letter-spacing:0; font-size:10px; line-height:1.35; color:#475b54; }
        @media(max-width:480px) {
          .vg-board { padding:18px 16px; }
          .vg-body { gap:11px; grid-template-columns:1fr .92fr; }
          .vg-right { padding:10px; }
          .vg-stage { height:180px; }
          .vg-stage svg { width:120px; height:142px; }
          .vg-lockup { gap:7px; }
          .vg-word { font-size:19px; }
          .vg-descriptor { font-size:5.5px; }
        }
      `}</style>

      <header className="vg-head">
        <div>
          <Eyebrow>Zeichenstudie · Hypothese C</Eyebrow>
          <h1 className="vg-title">Verschachteltes GR</h1>
        </div>
        <div className="vg-tag">GETEILTER RÜCKGRAT</div>
      </header>

      <div className="vg-body">
        <section className="vg-left" aria-label="Monogramm und Größenprüfung">
          <Eyebrow>Monogramm · gemeinsame Mittelachse</Eyebrow>
          <div className="vg-stage"><NestedMark size={131} /></div>
          <div style={{ marginTop: 10 }}><Eyebrow>Pixelprobe · Positiv</Eyebrow></div>
          <div className="vg-scale">
            <PixelSample size={16} />
            <PixelSample size={32} />
            <PixelSample size={54} />
          </div>
          <div className="vg-lockup-area">
            <Eyebrow>Wort-Bild-Marke · Masthead</Eyebrow>
            <div style={{ marginTop: 8 }}><Lockup /></div>
          </div>
        </section>

        <section className="vg-right" aria-label="Einfarbige Anwendung">
          <div className="vg-right-head">
            <Eyebrow>1C · Umkehrung</Eyebrow>
            <span className="vg-onec">DRUCKTEST</span>
          </div>
          <div className="vg-inverse">
            <Lockup reversed />
            <div className="vg-scale">
              <PixelSample size={16} reversed />
              <PixelSample size={32} reversed />
            </div>
          </div>
          <p className="vg-thought">
            <strong>Gedanke.</strong> Das G sitzt über dem R; beide teilen sich einen durchgehenden Mittelsteg. So wird aus zwei Initialen ein kompakter, fast gesetzter Redaktionsstempel.
          </p>
          <p className="vg-thought" style={{ marginTop: 10 }}>
            <strong>Charakter.</strong> Architektonisch und ruhig – eine lokale Publikation, kein Technik-Abzeichen.
          </p>
        </section>
      </div>

      <footer className="vg-footer">
        <span className="vg-index">ABWÄGUNG</span>
        <span className="vg-footer-copy">Die gemeinsame Achse hält das Zeichen prägnant. In 16 px wird es zur Initialen-Silhouette; die genaue G/R-Lesart braucht die Wortmarke.</span>
      </footer>
    </main>
  );
}