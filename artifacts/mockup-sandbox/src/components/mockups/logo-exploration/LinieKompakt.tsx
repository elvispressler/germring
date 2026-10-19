const palette = {
  paper: "#f3efe5",
  paperShade: "#e8e3d6",
  ink: "#263e38",
  quiet: "#68776e",
  rule: "#d1ccbd",
  panel: "#e9e9df",
  inverse: "#2b453e",
  inverseQuiet: "#c3cec3",
};

function CompactMark({
  width = 214,
  color = palette.ink,
}: {
  width?: number;
  color?: string;
}) {
  return (
    <svg
      width={width}
      height={width * 0.69}
      viewBox="0 0 180 124"
      fill="none"
      role="img"
      aria-label="Kompaktes, zusammenhängendes GR-Monogramm"
      style={{ display: "block", overflow: "visible", flex: "none" }}
    >
      <path
        d="M81 24
          C72 16 62 13 51 15
          C31 18 17 34 16 54
          C15 76 31 93 51 95
          C68 97 82 86 86 71
          C88 65 88 60 86 55
          L66 55
          L103 55
          L103 23
          C118 22 136 22 145 31
          C157 44 153 61 141 68
          C133 73 120 73 103 72
          L103 101
          L103 72
          L145 101"
        stroke={color}
        strokeWidth="9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicroMark({
  size,
  color,
}: {
  size: 16 | 32;
  color: string;
}) {
  const small = size === 16;
  return (
    <svg
      width={small ? 14 : 27}
      height={small ? 12 : 23}
      viewBox="0 0 160 132"
      fill="none"
      role="img"
      aria-label={`Optisch korrigiertes GR-Zeichen für ${size} Pixel`}
      style={{ display: "block", flex: "none" }}
    >
      <path
        d="M75 25
          C67 18 57 16 48 18
          C29 21 18 36 18 53
          C18 73 32 88 49 89
          C64 90 77 81 80 67
          C81 63 81 58 79 54
          L63 54
          L94 54
          L94 25
          C108 24 124 24 132 33
          C142 44 139 59 129 65
          C122 69 109 69 94 68
          L94 95
          L94 68
          L129 94"
        stroke={color}
        strokeWidth={small ? 15 : 11}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Label({ children }: { children: string }) {
  return <div className="lkc-label">{children}</div>;
}

function Lockup({ inverse = false }: { inverse?: boolean }) {
  const foreground = inverse ? palette.paper : palette.ink;
  const secondary = inverse ? palette.inverseQuiet : palette.quiet;
  return (
    <div className="lkc-lockup">
      <CompactMark width={48} color={foreground} />
      <div className="lkc-lockup-copy">
        <div className="lkc-word" style={{ color: foreground }}>
          germring.de
        </div>
        <div className="lkc-sub" style={{ color: secondary }}>
          FÜRSTENFELDBRUCK · ENERGIE &amp; ZUKUNFT
        </div>
      </div>
    </div>
  );
}

function FaviconSample({
  size,
  inverse = false,
}: {
  size: 16 | 32;
  inverse?: boolean;
}) {
  return (
    <div className="lkc-fav-sample">
      <div
        className="lkc-fav"
        style={{
          width: size,
          height: size,
          background: inverse ? palette.ink : palette.paperShade,
        }}
      >
        <MicroMark size={size} color={inverse ? palette.paper : palette.ink} />
      </div>
      <span>{size}px</span>
    </div>
  );
}

export function LinieKompakt() {
  return (
    <main className="lkc-board">
      <style>{`
        .lkc-board {
          box-sizing:border-box; width:100%; height:550px; overflow:hidden;
          padding:21px 23px 16px; color:${palette.ink}; background:${palette.paper};
          font-family:"DM Sans","Avenir Next",sans-serif; -webkit-font-smoothing:antialiased;
        }
        .lkc-board * { box-sizing:border-box; }
        .lkc-header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:11px; border-bottom:1px solid ${palette.rule}; }
        .lkc-label,.lkc-tag,.lkc-sub,.lkc-foot,.lkc-micro-caption,.lkc-fav-sample span {
          font-family:"IBM Plex Mono","SFMono-Regular",monospace;
          text-transform:uppercase; letter-spacing:.105em;
        }
        .lkc-label { color:${palette.quiet}; font-size:8px; line-height:1.3; }
        .lkc-title { margin:5px 0 0; font-family:"Newsreader",Georgia,serif; font-size:22px; font-weight:500; line-height:1; letter-spacing:-.035em; }
        .lkc-tag { padding:6px 8px; border:1px solid #bdc9bd; color:#566c62; font-size:7px; white-space:nowrap; }
        .lkc-main { display:grid; grid-template-columns:1.04fr .96fr; gap:15px; padding-top:15px; }
        .lkc-left,.lkc-right { min-width:0; }
        .lkc-stage { height:164px; margin-top:7px; display:grid; place-items:center; background:${palette.panel}; }
        .lkc-stage svg { max-width:90%; height:auto; }
        .lkc-ratio { display:flex; justify-content:space-between; margin-top:7px; color:${palette.quiet}; font:7px "IBM Plex Mono",monospace; letter-spacing:.06em; text-transform:uppercase; }
        .lkc-lockup-block { margin-top:13px; padding:11px 2px 12px; border-top:1px solid ${palette.rule}; border-bottom:1px solid ${palette.rule}; }
        .lkc-lockup { display:flex; align-items:center; gap:8px; min-width:0; }
        .lkc-lockup-copy { min-width:0; }
        .lkc-word { font-family:"DM Sans","Avenir Next",sans-serif; font-size:20px; line-height:1; font-weight:700; letter-spacing:-.065em; white-space:nowrap; }
        .lkc-sub { margin-top:5px; font-size:5.4px; line-height:1.25; letter-spacing:.075em; white-space:nowrap; }
        .lkc-proof { padding:12px; background:${palette.panel}; border:1px solid ${palette.rule}; }
        .lkc-proof-head { display:flex; justify-content:space-between; align-items:center; }
        .lkc-one { color:${palette.quiet}; font:8px "IBM Plex Mono",monospace; letter-spacing:.1em; }
        .lkc-dark { margin-top:9px; padding:10px 9px; background:${palette.inverse}; }
        .lkc-light { margin-top:7px; padding:9px; background:${palette.paperShade}; }
        .lkc-proof .lkc-word { font-size:16px; }
        .lkc-proof .lkc-sub { font-size:4.5px; }
        .lkc-proof .lkc-lockup { gap:7px; }
        .lkc-micro { display:flex; align-items:flex-end; gap:15px; margin-top:10px; padding-top:9px; border-top:1px solid ${palette.rule}; }
        .lkc-fav-sample { display:flex; flex-direction:column; align-items:center; gap:4px; }
        .lkc-fav { display:grid; place-items:center; overflow:hidden; border-radius:2px; }
        .lkc-fav-sample span { color:${palette.quiet}; font-size:7px; letter-spacing:.02em; white-space:nowrap; }
        .lkc-micro-caption { margin-left:auto; max-width:104px; color:${palette.quiet}; font-size:6.5px; line-height:1.45; text-align:right; }
        .lkc-thought { margin:12px 1px 0; color:#445b51; font-family:"Newsreader",Georgia,serif; font-size:12px; line-height:1.32; }
        .lkc-thought strong { color:${palette.ink}; font-family:"DM Sans",sans-serif; font-size:9px; }
        .lkc-trade { margin-top:10px; padding-top:8px; border-top:1px solid ${palette.rule}; color:${palette.quiet}; font-size:9px; line-height:1.34; }
        .lkc-trade strong { display:block; margin-bottom:3px; font:7px "IBM Plex Mono",monospace; letter-spacing:.12em; text-transform:uppercase; }
        .lkc-footer { display:flex; justify-content:space-between; gap:10px; margin-top:14px; padding-top:8px; border-top:1px solid ${palette.rule}; color:${palette.quiet}; font:7px "IBM Plex Mono",monospace; letter-spacing:.07em; }
        @media(max-width:480px) {
          .lkc-board { padding:17px 15px; }
          .lkc-main { gap:10px; grid-template-columns:1fr .96fr; }
          .lkc-proof { padding:9px; }
          .lkc-stage { height:148px; }
          .lkc-word { font-size:17px; }
          .lkc-micro { gap:9px; }
        }
      `}</style>

      <header className="lkc-header">
        <div>
          <Label>Zeichenstudie · Verfeinerung 3B</Label>
          <h1 className="lkc-title">Gezeichnete Linie</h1>
        </div>
        <div className="lkc-tag">3B.3 · KOMPAKT</div>
      </header>

      <div className="lkc-main">
        <section className="lkc-left" aria-label="Kompaktes GR-Zeichen und Wortmarke">
          <Label>GR · ein Zug, enger gefasst</Label>
          <div className="lkc-stage">
            <CompactMark width={214} />
          </div>
          <div className="lkc-ratio">
            <span>Breite geteilt</span>
            <span>G → R · Übergabe am Stamm</span>
          </div>
          <div className="lkc-lockup-block">
            <Label>Wort-Bild-Marke · Masthead</Label>
            <div style={{ marginTop: 9 }}><Lockup /></div>
          </div>
        </section>

        <section className="lkc-right" aria-label="Einfarbiger Einsatz und Favicon-Prüfung">
          <div className="lkc-proof">
            <div className="lkc-proof-head">
              <Label>Einfarbtest · positiv / negativ</Label>
              <span className="lkc-one">1C</span>
            </div>
            <div className="lkc-dark"><Lockup inverse /></div>
            <div className="lkc-light"><Lockup /></div>
            <div className="lkc-micro">
              <FaviconSample size={16} />
              <FaviconSample size={32} />
              <div className="lkc-micro-caption">eigenständiger Schnitt<br />gleicher GR-Zug</div>
            </div>
          </div>
          <p className="lkc-thought">
            <strong>Gedanke.</strong> Der R-Stamm rückt in die G-Öffnung: weniger Laufweite, mehr gemeinsame Negativform. Die Übergabe bleibt ein einziger, sichtbarer Strich.
          </p>
          <div className="lkc-trade">
            <strong>Trade-off</strong>
            Auf 16 px bleibt GR als Rhythmus erkennbar, nicht als präzise Buchstabenzeichnung. Der optisch kräftigere Mikroschnitt hält den Zug zusammen.
          </div>
        </section>
      </div>

      <footer className="lkc-footer">
        <span>GERMRING.DE / FFB</span>
        <span>Lokal berichtet · Zukunft vor Ort</span>
      </footer>
    </main>
  );
}