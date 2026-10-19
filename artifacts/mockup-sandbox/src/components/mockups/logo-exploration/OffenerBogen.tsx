export function OffenerBogen() {
  const ink = "#243d3b";
  const muted = "#687671";
  const rule = "#d9d8ca";
  const paper = "#f4f1e8";

  function Mark({ size = 100, color = ink }: { size?: number; color?: string }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        role="img"
        aria-label="Offener G-Bogen mit R-Bein"
        shapeRendering="geometricPrecision"
      >
        <path
          d="M70.4 17.7A36 36 0 1 0 81.8 72.6H60.5M60.5 72.6 82 94"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  function Scale({ reversed = false }: { reversed?: boolean }) {
    return (
      <div className="ob-scale">
        {[16, 32, 48].map((size) => (
          <div className="ob-sample" key={size}>
            <div
              className="ob-chip"
              style={{ width: size, height: size, background: reversed ? ink : "#e8e9df" }}
            >
              <Mark size={size} color={reversed ? paper : ink} />
            </div>
            <span>{size} px</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="ob-board">
      <style>{`
        .ob-board {
          --ink: ${ink}; --muted: ${muted}; --rule: ${rule}; --paper: ${paper};
          box-sizing: border-box; width: 100%; height: 480px; overflow: hidden;
          padding: 23px 25px 21px; color: var(--ink); background: var(--paper);
          font-family: 'DM Sans', 'Avenir Next', sans-serif;
          position: relative;
        }
        .ob-board * { box-sizing: border-box; }
        .ob-head { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--rule); padding-bottom:12px; }
        .ob-kicker, .ob-meta, .ob-label, .ob-scale span, .ob-index {
          font-family: 'IBM Plex Mono', 'SFMono-Regular', monospace;
          text-transform: uppercase; letter-spacing: .13em;
        }
        .ob-kicker { color:var(--muted); font-size:9px; }
        .ob-title { margin:5px 0 0; font-family:'Newsreader', Georgia, serif; font-size:22px; font-weight:500; line-height:1; letter-spacing:-.035em; }
        .ob-meta { margin-top:2px; color:#52716c; border:1px solid #bfd0c7; border-radius:999px; padding:6px 9px; font-size:8px; white-space:nowrap; }
        .ob-main { display:grid; grid-template-columns: 1.08fr .92fr; gap:20px; padding-top:17px; }
        .ob-feature { display:flex; flex-direction:column; justify-content:space-between; min-width:0; min-height:264px; }
        .ob-showcase { display:flex; align-items:center; gap:19px; }
        .ob-bigmark { width:112px; height:112px; flex:0 0 112px; display:grid; place-items:center; border-radius:20px; background:#e8e9df; }
        .ob-bigmark svg { width:98px; height:98px; }
        .ob-scale-wrap { min-width:0; }
        .ob-label { display:block; color:var(--muted); font-size:8px; }
        .ob-scale { display:flex; align-items:flex-end; gap:10px; margin-top:12px; }
        .ob-sample { display:flex; flex-direction:column; align-items:center; gap:6px; }
        .ob-chip { display:grid; place-items:center; border-radius:5px; }
        .ob-chip svg { display:block; }
        .ob-scale span { color:var(--muted); font-size:7px; letter-spacing:.05em; white-space:nowrap; }
        .ob-lockup { display:flex; align-items:center; gap:10px; border-top:1px solid var(--rule); padding-top:14px; }
        .ob-lockup svg { flex:none; }
        .ob-word { color:var(--ink); font-size:21px; line-height:1; font-weight:650; letter-spacing:-.075em; white-space:nowrap; }
        .ob-subline { margin-top:5px; color:var(--muted); font-family:'IBM Plex Mono', monospace; font-size:7px; letter-spacing:.115em; text-transform:uppercase; }
        .ob-right { padding:13px 13px 12px; border:1px solid var(--rule); border-radius:14px; background:#eeefe7; }
        .ob-right-head { display:flex; justify-content:space-between; align-items:center; }
        .ob-onec { color:var(--muted); font-family:'IBM Plex Mono', monospace; font-size:8px; }
        .ob-inverse { margin-top:11px; padding:12px; border-radius:10px; background:var(--ink); }
        .ob-inverse .ob-word { color:var(--paper); font-size:17px; }
        .ob-inverse .ob-subline { color:#b6c5bd; font-size:6px; }
        .ob-inverse .ob-lockup { border:0; padding:0; gap:8px; }
        .ob-inverse .ob-scale { gap:9px; margin-top:11px; padding-top:10px; border-top:1px solid #49615b; }
        .ob-note { margin:13px 1px 0; color:#405853; font-family:'Newsreader', Georgia, serif; font-size:13px; line-height:1.29; }
        .ob-note strong { color:var(--ink); font-family:'DM Sans', sans-serif; font-size:10px; font-weight:700; }
        .ob-foot { display:flex; align-items:center; gap:9px; border-top:1px solid var(--rule); margin-top:17px; padding-top:10px; color:var(--muted); font-size:9px; line-height:1.3; }
        .ob-index { color:#52716c; font-size:8px; white-space:nowrap; }
        @media (max-width: 460px) {
          .ob-board { padding:17px 16px; }
          .ob-main { gap:12px; grid-template-columns:1fr .94fr; }
          .ob-showcase { gap:10px; }
          .ob-bigmark { width:94px; height:94px; flex-basis:94px; }
          .ob-bigmark svg { width:82px; height:82px; }
          .ob-scale { gap:6px; }
          .ob-right { padding:10px; }
        }
      `}</style>

      <header className="ob-head">
        <div>
          <div className="ob-kicker">Zeichenstudie · 02 / 03</div>
          <h1 className="ob-title">Offener G-Bogen</h1>
        </div>
        <div className="ob-meta">G-Ring · reduziert</div>
      </header>

      <div className="ob-main">
        <section className="ob-feature" aria-label="Marke und Größenprüfung">
          <div className="ob-showcase">
            <div className="ob-bigmark"><Mark size={98} /></div>
            <div className="ob-scale-wrap">
              <span className="ob-label">Favicon / Navigation</span>
              <Scale />
            </div>
          </div>
          <div className="ob-lockup">
            <Mark size={39} />
            <div>
              <div className="ob-word">germring.de</div>
              <div className="ob-subline">Landkreis Fürstenfeldbruck · Energie &amp; Zukunft</div>
            </div>
          </div>
        </section>

        <section className="ob-right" aria-label="Einfarbige Anwendung">
          <div className="ob-right-head">
            <span className="ob-label">Einfarbig · Negativ</span>
            <span className="ob-onec">1C</span>
          </div>
          <div className="ob-inverse">
            <div className="ob-lockup">
              <Mark size={36} color={paper} />
              <div>
                <div className="ob-word">germring.de</div>
                <div className="ob-subline">FFB · Energie &amp; Zukunft</div>
              </div>
            </div>
            <Scale reversed />
          </div>
          <p className="ob-note">
            <strong>Warum:</strong> Ein ruhiger, fast geschlossener Bogen hält die Herkunft aus dem G/R-Energiering sichtbar. Der kurze Innenstrich liest sich als G; das einzige schräge Bein gibt dem R eine klare Richtung.
          </p>
        </section>
      </div>

      <footer className="ob-foot">
        <span className="ob-index">16 px</span>
        <span>Trade-off: In der kleinsten Größe bleibt vor allem der offene Ring mit seiner Kerbe lesbar; das R-Bein ist bewusst nur ein leiser Hinweis.</span>
      </footer>
    </main>
  );
}