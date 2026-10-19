const palette = {
  paper: "#f3efe4",
  paperShade: "#e9e5d9",
  ink: "#263e38",
  muted: "#68776e",
  rule: "#d4d0c2",
  panel: "#ebece3",
  inverse: "#29443d",
  inverseMuted: "#bdc9bd",
};

function RhythmMark({
  width = 220,
  color = palette.ink,
  micro = false,
}: {
  width?: number;
  color?: string;
  micro?: boolean;
}) {
  return (
    <svg
      width={width}
      height={width * 0.48}
      viewBox="0 0 240 116"
      fill="none"
      role="img"
      aria-label="Einzügiges GR-Zeichen"
      style={{ display: "block", flex: "none", overflow: "visible" }}
    >
      <path
        d="M91 20
          C82 12 70 9 58 11
          C36 14 20 32 19 54
          C17 78 34 96 57 98
          C78 100 94 86 98 69
          C100 63 100 58 98 53
          L75 53
          C91 53 110 53 130 53
          L130 18
          C141 18 154 18 165 18
          C183 18 194 28 194 43
          C194 58 183 68 165 68
          L130 68
          L130 99
          L130 68
          L181 101"
        stroke={color}
        strokeWidth={micro ? 14 : 9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicroMark({ size, inverse = false }: { size: number; inverse?: boolean }) {
  return (
    <div className="lr-micro-sample">
      <div
        className="lr-micro-tile"
        style={{
          width: size,
          height: size,
          background: inverse ? palette.ink : palette.paperShade,
        }}
      >
        <RhythmMark
          width={size * 0.9}
          color={inverse ? palette.paper : palette.ink}
          micro
        />
      </div>
      <span>{size} px</span>
    </div>
  );
}

function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="lr-lockup">
      <RhythmMark width={57} color={inverse ? palette.paper : palette.ink} />
      <div className="lr-word-copy">
        <div className="lr-word" style={{ color: inverse ? palette.paper : palette.ink }}>
          germring.de
        </div>
        <div className="lr-sub" style={{ color: inverse ? palette.inverseMuted : palette.muted }}>
          FÜRSTENFELDBRUCK · ENERGIE &amp; ZUKUNFT
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <div className="lr-eyebrow">{children}</div>;
}

export function LinieRhythmus() {
  return (
    <main className="lr-board">
      <style>{`
        .lr-board {
          box-sizing:border-box; width:100%; height:550px; overflow:hidden;
          padding:22px 24px 17px; color:${palette.ink}; background:${palette.paper};
          font-family:"DM Sans","Avenir Next",sans-serif; -webkit-font-smoothing:antialiased;
        }
        .lr-board * { box-sizing:border-box; }
        .lr-header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:12px; border-bottom:1px solid ${palette.rule}; }
        .lr-eyebrow,.lr-tag,.lr-sub,.lr-micro-sample span,.lr-footer,.lr-micro-note {
          font-family:"IBM Plex Mono","SFMono-Regular",monospace;
          text-transform:uppercase; letter-spacing:.11em;
        }
        .lr-eyebrow { color:${palette.muted}; font-size:8px; line-height:1.35; }
        .lr-heading { margin:5px 0 0; font-family:"Newsreader",Georgia,serif; font-weight:500; font-size:22px; line-height:1; letter-spacing:-.035em; }
        .lr-tag { border:1px solid #bdc9bd; color:#566c62; padding:6px 8px; font-size:7px; white-space:nowrap; }
        .lr-content { display:grid; grid-template-columns:1.08fr .92fr; gap:16px; padding-top:16px; }
        .lr-stage { height:150px; margin-top:7px; display:grid; place-items:center; background:${palette.panel}; }
        .lr-stage svg { width:222px; height:auto; }
        .lr-lockup-panel { margin-top:15px; padding:12px 2px 11px; border-top:1px solid ${palette.rule}; border-bottom:1px solid ${palette.rule}; }
        .lr-lockup { display:flex; align-items:center; gap:10px; min-width:0; }
        .lr-word-copy { min-width:0; }
        .lr-word { font-size:21px; line-height:1; font-weight:700; letter-spacing:-.07em; white-space:nowrap; }
        .lr-sub { margin-top:5px; font-size:5.7px; line-height:1.25; letter-spacing:.085em; white-space:nowrap; }
        .lr-proof { padding:12px 12px 11px; background:${palette.panel}; border:1px solid ${palette.rule}; }
        .lr-proof-head { display:flex; align-items:center; justify-content:space-between; }
        .lr-one { font:8px "IBM Plex Mono",monospace; color:${palette.muted}; letter-spacing:.1em; }
        .lr-inverse { margin-top:10px; padding:13px 10px 10px; background:${palette.inverse}; }
        .lr-inverse .lr-word { font-size:18px; }
        .lr-inverse .lr-sub { font-size:5px; }
        .lr-inverse .lr-lockup { gap:8px; }
        .lr-samples { display:flex; align-items:flex-end; gap:14px; margin-top:12px; padding-top:10px; border-top:1px solid #53675d; }
        .lr-micro-sample { display:flex; flex-direction:column; align-items:center; gap:5px; }
        .lr-micro-tile { display:grid; place-items:center; overflow:hidden; border-radius:3px; }
        .lr-micro-tile svg { max-width:90%; max-height:90%; }
        .lr-micro-sample span { color:${palette.muted}; font-size:7px; letter-spacing:.03em; white-space:nowrap; }
        .lr-inverse .lr-micro-sample span { color:${palette.inverseMuted}; }
        .lr-micro-note { margin:8px 0 0; color:${palette.inverseMuted}; font-size:6px; line-height:1.4; letter-spacing:.055em; text-transform:none; }
        .lr-argument { margin:12px 1px 0; color:#445b51; font-family:"Newsreader",Georgia,serif; font-size:12.5px; line-height:1.34; }
        .lr-argument strong { color:${palette.ink}; font-family:"DM Sans",sans-serif; font-size:10px; }
        .lr-trade { margin-top:10px; padding-top:8px; border-top:1px solid ${palette.rule}; color:${palette.muted}; font-size:9px; line-height:1.36; }
        .lr-trade strong { display:block; margin-bottom:3px; font:7px "IBM Plex Mono",monospace; letter-spacing:.12em; text-transform:uppercase; }
        .lr-footer { display:flex; justify-content:space-between; gap:12px; margin-top:14px; padding-top:9px; border-top:1px solid ${palette.rule}; color:${palette.muted}; font-size:7px; letter-spacing:.08em; }
        @media(max-width:480px) {
          .lr-board { padding:17px 16px; }
          .lr-content { gap:10px; grid-template-columns:1fr .96fr; }
          .lr-proof { padding:10px; }
          .lr-stage { height:140px; }
          .lr-stage svg { width:205px; }
          .lr-samples { gap:9px; }
          .lr-word { font-size:18px; }
        }
      `}</style>

      <header className="lr-header">
        <div>
          <Eyebrow>Zeichenstudie · 3B.1</Eyebrow>
          <h1 className="lr-heading">Ruhiger Rhythmus</h1>
        </div>
        <div className="lr-tag">GR · Einzug</div>
      </header>

      <div className="lr-content">
        <section aria-label="GR-Zeichen und Wortmarke">
          <Eyebrow>Monogramm · optisch verfeinert</Eyebrow>
          <div className="lr-stage">
            <RhythmMark width={222} />
          </div>
          <div className="lr-lockup-panel">
            <Eyebrow>Wort-Bild-Marke · Masthead</Eyebrow>
            <div style={{ marginTop: 10 }}><Wordmark /></div>
          </div>
        </section>

        <section aria-label="Einfarbiger Einsatz und Kleinstgrößen">
          <div className="lr-proof">
            <div className="lr-proof-head">
              <Eyebrow>Einfarbig · Umkehrung</Eyebrow>
              <span className="lr-one">1C</span>
            </div>
            <div className="lr-inverse">
              <Wordmark inverse />
              <div className="lr-samples">
                <MicroMark size={16} inverse />
                <MicroMark size={32} inverse />
              </div>
              <p className="lr-micro-note">Mikrostrich optisch verstärkt · gleiche Kontur</p>
            </div>
            <p className="lr-argument">
              <strong>Gedanke.</strong> Der etwas längere Atem im G führt ohne Knick in den gemeinsamen Querstrich. Ein ruhigerer R-Bogen trägt das Bein sichtbar mit.
            </p>
            <div className="lr-trade">
              <strong>Trade-off</strong>
              Bei 16 px bleibt GR als Signatur lesbar, nicht als präzise Buchstabenzeichnung. Mehr Strichstärke schützt die Form, nimmt aber Innenraum.
            </div>
          </div>
        </section>
      </div>

      <footer className="lr-footer">
        <span>GERMRING.DE / FFB</span>
        <span>Lokal berichtet · Zukunft vor Ort</span>
      </footer>
    </main>
  );
}