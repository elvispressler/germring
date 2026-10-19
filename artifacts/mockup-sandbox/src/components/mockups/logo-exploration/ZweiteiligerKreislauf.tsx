const palette = {
  paper: "#f5f0e4",
  stage: "#e5e7d8",
  ink: "#183c3b",
  accent: "#c45d40",
  muted: "#687a72",
  rule: "#d3d2c3",
  panel: "#e9ece2",
};

function LoopMark({
  size = 100,
  mono = false,
  reverse = false,
}: {
  size?: number;
  mono?: boolean;
  reverse?: boolean;
}) {
  const base = reverse ? palette.paper : palette.ink;
  const handoff = mono ? base : reverse ? palette.paper : palette.accent;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      aria-label="Zweiteiliges G- und R-Zeichen mit Übergang"
      shapeRendering="geometricPrecision"
      style={{ display: "block", flex: "none" }}
    >
      {/* Two separate rounded ribbons orbit diagonally; neither forms a letter. */}
      <path
        d="M67 57C72 42 65 25 50 18C34 10 17 22 14 39C11 57 25 71 41 72C47 72 52 70 56 68"
        stroke={base}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M67 70C75 61 90 66 98 79C107 93 100 108 86 113C70 118 54 108 51 93C49 84 50 79 54 76"
        stroke={base}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M57 67L65 70"
        stroke={handoff}
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <div className="zk-eyebrow">{children}</div>;
}

function Sample({ size, reverse = false }: { size: number; reverse?: boolean }) {
  return (
    <div className="zk-sample">
      <div
        className="zk-tile"
        style={{
          width: size,
          height: size,
          background: reverse ? palette.ink : palette.stage,
          borderRadius: size <= 16 ? 2 : 5,
        }}
      >
        <LoopMark size={size} mono reverse={reverse} />
      </div>
      <span>{size}px</span>
    </div>
  );
}

function Lockup({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <div className={`zk-lockup${compact ? " zk-lockup-compact" : ""}`}>
      <LoopMark size={compact ? 38 : 44} mono={inverse} reverse={inverse} />
      <div>
        <div className="zk-word" style={{ color: inverse ? palette.paper : palette.ink }}>
          germring.de
        </div>
        <div className="zk-descriptor" style={{ color: inverse ? "#bdc9bd" : palette.muted }}>
          LANDKREIS FÜRSTENFELDBRUCK
        </div>
      </div>
    </div>
  );
}

export function ZweiteiligerKreislauf() {
  return (
    <main className="zk-board">
      <style>{`
        .zk-board {
          --paper:${palette.paper}; --ink:${palette.ink}; --muted:${palette.muted};
          box-sizing:border-box; width:100%; height:540px; overflow:hidden;
          padding:20px 22px 16px; background:var(--paper); color:var(--ink);
          font-family:"DM Sans","Avenir Next",sans-serif;
          -webkit-font-smoothing:antialiased;
        }
        .zk-board * { box-sizing:border-box; }
        .zk-head { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:12px; border-bottom:1px solid ${palette.rule}; }
        .zk-eyebrow,.zk-tag,.zk-sample span,.zk-descriptor,.zk-foot,.zk-micro {
          font-family:"IBM Plex Mono","SFMono-Regular",monospace;
          text-transform:uppercase; letter-spacing:.12em;
        }
        .zk-eyebrow { color:var(--muted); font-size:8px; line-height:1.2; }
        .zk-title { margin:5px 0 0; font-family:"Newsreader",Georgia,serif; font-size:22px; line-height:1; font-weight:500; letter-spacing:-.035em; }
        .zk-tag { margin-top:2px; padding:6px 8px; border:1px solid #b8c9bc; border-radius:2px; color:#536b62; font-size:7px; white-space:nowrap; }
        .zk-body { display:grid; grid-template-columns:1.02fr .98fr; gap:15px; padding-top:15px; }
        .zk-left { min-width:0; }
        .zk-markstage { height:160px; margin-top:7px; display:grid; place-items:center; position:relative; background:${palette.stage}; }
        .zk-markstage:after { content:""; position:absolute; left:50%; top:50%; width:1px; height:92px; transform:translate(-50%,-50%); background:rgba(24,60,59,.1); }
        .zk-markstage svg { width:138px; height:138px; position:relative; z-index:1; }
        .zk-scale { display:flex; align-items:flex-end; gap:14px; margin-top:10px; }
        .zk-sample { display:flex; flex-direction:column; align-items:center; gap:5px; }
        .zk-tile { display:grid; place-items:center; overflow:hidden; }
        .zk-sample span { color:var(--muted); font-size:7px; letter-spacing:.04em; }
        .zk-lockup { display:flex; align-items:center; gap:9px; min-width:0; }
        .zk-lockup-compact { gap:8px; }
        .zk-lockup-area { margin-top:17px; border-top:1px solid ${palette.rule}; padding-top:11px; }
        .zk-word { font-size:21px; line-height:1; font-weight:700; letter-spacing:-.075em; white-space:nowrap; }
        .zk-descriptor { margin-top:5px; font-size:6px; letter-spacing:.12em; white-space:nowrap; }
        .zk-right { min-width:0; padding:12px; background:${palette.panel}; border:1px solid ${palette.rule}; }
        .zk-right-head { display:flex; justify-content:space-between; align-items:center; }
        .zk-onec { color:var(--muted); font:7px "IBM Plex Mono",monospace; letter-spacing:.1em; }
        .zk-dark { margin-top:9px; padding:13px 11px 10px; background:var(--ink); }
        .zk-dark .zk-word { font-size:19px; }
        .zk-dark .zk-descriptor { font-size:6px; }
        .zk-darkscale { display:flex; align-items:flex-end; gap:12px; margin-top:10px; padding-top:9px; border-top:1px solid #49615a; }
        .zk-darkscale .zk-sample span { color:#bdc9bd; }
        .zk-rationale { margin:12px 1px 0; font-family:"Newsreader",Georgia,serif; font-size:12px; line-height:1.35; color:#40574e; }
        .zk-rationale strong { font-family:"DM Sans",sans-serif; font-size:9px; color:var(--ink); }
        .zk-foot { display:flex; justify-content:space-between; gap:12px; margin-top:14px; padding-top:9px; border-top:1px solid ${palette.rule}; color:var(--muted); font-size:7px; line-height:1.4; letter-spacing:.06em; }
        .zk-foot span:last-child { max-width:350px; text-align:right; text-transform:none; letter-spacing:0; font-family:"DM Sans",sans-serif; font-size:9px; }
        @media(max-width:440px) {
          .zk-board { padding:16px 14px; }
          .zk-body { gap:10px; grid-template-columns:1fr .96fr; }
          .zk-right { padding:9px; }
          .zk-markstage { height:146px; }
          .zk-markstage svg { width:120px; height:120px; }
          .zk-word { font-size:18px; }
          .zk-sample span { font-size:6px; }
          .zk-scale { gap:9px; }
        }
      `}</style>

      <header className="zk-head">
        <div>
          <Eyebrow>Zeichenstudie · 04 / 04</Eyebrow>
          <h1 className="zk-title">Zweiteiliger Kreislauf</h1>
        </div>
        <div className="zk-tag">G + R / Übergabe</div>
      </header>

      <div className="zk-body">
        <section className="zk-left" aria-label="Zeichen und Größenprüfung">
          <Eyebrow>Marke · zwei gleichwertige Teile</Eyebrow>
          <div className="zk-markstage">
            <LoopMark size={138} />
          </div>
          <Eyebrow>Favicon · Originalpixel</Eyebrow>
          <div className="zk-scale" aria-label="Favicon in realen Pixelgrößen">
            <Sample size={16} />
            <Sample size={32} />
            <Sample size={54} />
          </div>
          <div className="zk-lockup-area">
            <Eyebrow>Wort-Bild-Marke · Masthead</Eyebrow>
            <div style={{ marginTop: 9 }}><Lockup /></div>
          </div>
        </section>

        <section className="zk-right" aria-label="Einfarbiger Anwendungstest">
          <div className="zk-right-head">
            <Eyebrow>Einfarbig · Umkehrung</Eyebrow>
            <span className="zk-onec">1C / 0C</span>
          </div>
          <div className="zk-dark">
            <Lockup inverse compact />
            <div className="zk-darkscale">
              <Sample size={16} reverse />
              <Sample size={32} reverse />
            </div>
          </div>
          <p className="zk-rationale">
            <strong>Gedanke.</strong> Zwei gleich starke, offene Rundschleifen laufen versetzt umeinander. Der kleine Steg ist ihr einziger Übergabepunkt: erst Kreislauf und Verbindung, dann eine leise Erinnerung an G/R — keine ausbuchstabierten Initialen.
          </p>
          <p className="zk-rationale" style={{ marginTop: 8 }}>
            <strong>Prüfung.</strong> Bei 16 px bleibt die Doppel-Schleife das Signal; G/R lassen sich dort nicht sicher lesen.
          </p>
        </section>
      </div>

      <footer className="zk-foot">
        <span>TRADE-OFF</span>
        <span>Die weiche Orbit-Silhouette hebt sich klar vom kantigen Monogramm ab; ohne Wortmarke kann das Paar dennoch an verbundene Ringe erinnern.</span>
      </footer>
    </main>
  );
}