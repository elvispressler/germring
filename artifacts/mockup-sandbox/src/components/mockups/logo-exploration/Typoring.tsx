const ink = "#203b39";
const paper = "#f4f0e7";
const muted = "#71817a";
const rule = "#d8d9ce";
const rust = "#bd684f";

function TyporingMark({ size = 100, color = ink }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="G und R als offener Ring"
      shapeRendering="geometricPrecision"
    >
      {/* The G is the ring: a single, deliberate opening at the upper right. */}
      <path
        d="M72.6 25.1A34 34 0 1 0 82 49.5H57.4"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      {/* The shared right-hand stem and bowl let the R grow from the G. */}
      <path
        d="M72.6 25.1V49.4C72.6 57.8 66.7 63 57.2 63H48.5"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      {/* A quiet, decisive leg; the one accent is removed in the mono test. */}
      <path
        d="M62.1 61.7 81 80.5"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="square"
      />
    </svg>
  );
}

function ScaleSample({ size, dark = false }: { size: number; dark?: boolean }) {
  return (
    <div className="tr-scale-sample">
      <div
        className="tr-icon-tile"
        style={{
          width: size,
          height: size,
          background: dark ? ink : "#e6e9df",
          borderRadius: size < 20 ? 3 : 7,
        }}
      >
        <TyporingMark size={size} color={dark ? paper : ink} />
      </div>
      <span className="tr-scale-label">{size}px</span>
    </div>
  );
}

function Lockup({ mono = false }: { mono?: boolean }) {
  const foreground = mono ? paper : ink;
  return (
    <div className="tr-lockup">
      <TyporingMark size={42} color={foreground} />
      <div className="tr-lockup-type">
        <div className="tr-wordmark" style={{ color: foreground }}>
          germring<span style={{ color: mono ? paper : rust }}>.de</span>
        </div>
        <div className="tr-descriptor" style={{ color: mono ? "#b8c5bb" : muted }}>
          LANDKREIS FÜRSTENFELDBRUCK
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: string }) {
  return <div className="tr-label">{children}</div>;
}

export function Typoring() {
  return (
    <main className="tr-board">
      <style>{`
        .tr-board {
          box-sizing: border-box;
          width: 100%;
          min-height: 480px;
          height: 480px;
          overflow: hidden;
          padding: 20px 22px 18px;
          color: ${ink};
          background: ${paper};
          font-family: "DM Sans", "Avenir Next", sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .tr-board * { box-sizing: border-box; }
        .tr-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid ${rule};
          padding-bottom: 11px;
        }
        .tr-kicker, .tr-label, .tr-scale-label, .tr-descriptor, .tr-index {
          font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
          text-transform: uppercase;
          letter-spacing: .12em;
        }
        .tr-kicker { color: ${muted}; font-size: 9px; line-height: 1; }
        .tr-title {
          margin: 7px 0 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -.035em;
          line-height: 1;
        }
        .tr-index { color: ${muted}; font-size: 8px; padding-top: 2px; }
        .tr-main {
          display: grid;
          grid-template-columns: 1fr 1.03fr;
          gap: 17px;
          padding-top: 17px;
        }
        .tr-left { min-width: 0; }
        .tr-hero {
          display: flex;
          align-items: center;
          gap: 15px;
          min-height: 113px;
        }
        .tr-mark-stage {
          width: 116px;
          height: 116px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 18px;
          background: #e6e9df;
        }
        .tr-scale-column { min-width: 0; }
        .tr-label { color: ${muted}; font-size: 8px; line-height: 1; }
        .tr-scale-row { display: flex; align-items: flex-end; gap: 9px; margin-top: 12px; }
        .tr-scale-sample { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .tr-icon-tile { display: grid; place-items: center; overflow: hidden; }
        .tr-scale-label { color: ${muted}; font-size: 8px; letter-spacing: .04em; }
        .tr-lockup {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }
        .tr-lockup-type { min-width: 0; }
        .tr-wordmark {
          font-family: "DM Sans", "Avenir Next", sans-serif;
          font-size: 21px;
          font-weight: 700;
          line-height: .98;
          letter-spacing: -.075em;
          white-space: nowrap;
        }
        .tr-descriptor { margin-top: 6px; font-size: 7px; letter-spacing: .14em; white-space: nowrap; }
        .tr-lockup-area { margin-top: 18px; border-top: 1px solid ${rule}; padding-top: 12px; }
        .tr-mono {
          min-height: 230px;
          padding: 13px;
          border: 1px solid ${rule};
          border-radius: 12px;
          background: #e9ece4;
        }
        .tr-mono-top { display: flex; justify-content: space-between; align-items: center; }
        .tr-onec { color: ${muted}; font: 8px "IBM Plex Mono", monospace; }
        .tr-dark-panel {
          margin-top: 10px;
          padding: 14px 12px 11px;
          border-radius: 9px;
          background: ${ink};
        }
        .tr-dark-panel .tr-wordmark { font-size: 19px; }
        .tr-mono-scales {
          display: flex;
          align-items: flex-end;
          gap: 13px;
          margin-top: 11px;
          padding-top: 10px;
          border-top: 1px solid #45605a;
        }
        .tr-mono-scales .tr-scale-label { color: #b8c5bb; }
        .tr-rationale {
          margin: 12px 1px 0;
          color: #405651;
          font-family: "DM Sans", "Avenir Next", sans-serif;
          font-size: 10px;
          line-height: 1.42;
        }
        .tr-rationale strong { color: ${ink}; font-weight: 700; }
        .tr-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          border-top: 1px solid ${rule};
          padding-top: 8px;
          color: ${muted};
          font: 8px "IBM Plex Mono", monospace;
          letter-spacing: .055em;
        }
        @media (max-width: 480px) {
          .tr-board { padding: 16px; }
          .tr-main { grid-template-columns: 1fr 1fr; gap: 10px; }
          .tr-hero { gap: 8px; }
          .tr-mark-stage { width: 96px; height: 96px; }
          .tr-mark-stage svg { width: 80px; height: 80px; }
          .tr-scale-row { gap: 5px; }
          .tr-mono { padding: 10px; }
          .tr-wordmark { font-size: 18px; }
        }
      `}</style>
      <header className="tr-top">
        <div>
          <div className="tr-kicker">G/R-Energiering · Weitergedacht</div>
          <h1 className="tr-title">Typografischer Ring</h1>
        </div>
        <div className="tr-index">02 / 03&nbsp;&nbsp; · &nbsp;&nbsp;Wortmarke</div>
      </header>

      <div className="tr-main">
        <section className="tr-left" aria-label="Zeichen und Größenprüfung">
          <div className="tr-hero">
            <div className="tr-mark-stage">
              <TyporingMark size={102} />
            </div>
            <div className="tr-scale-column">
              <Label>Größentest</Label>
              <div className="tr-scale-row">
                <ScaleSample size={16} />
                <ScaleSample size={32} />
                <ScaleSample size={58} />
              </div>
            </div>
          </div>
          <div className="tr-lockup-area">
            <Label>Navigation · 42 px Zeichen</Label>
            <div style={{ marginTop: 10 }}>
              <Lockup />
            </div>
          </div>
        </section>

        <section className="tr-mono" aria-label="Einfarbiger Anwendungstest">
          <div className="tr-mono-top">
            <Label>Einfarbig · 1C</Label>
            <span className="tr-onec">Schwarz / Weiß</span>
          </div>
          <div className="tr-dark-panel">
            <Lockup mono />
            <div className="tr-mono-scales">
              <ScaleSample size={16} dark />
              <ScaleSample size={32} dark />
              <ScaleSample size={58} dark />
            </div>
          </div>
          <p className="tr-rationale">
            <strong>Gedanke.</strong> Das G bildet den offenen Ring; sein rechter
            Bogen wird zugleich Stamm und Rundung des R. Keine zweite Kreislinie,
            kein zusätzliches Signal: die Buchstaben sind die Form.
          </p>
          <p className="tr-rationale" style={{ marginTop: 6 }}>
            <strong>Trade-off.</strong> Bei 16 px bleibt die G-Schleife klar, das
            R wird zur subtilen Binnenform. Im großen Maßstab gewinnt die
            Ligatur an Charakter — zugunsten einer ehrlichen, nicht überladenen
            Favicon-Lesbarkeit.
          </p>
        </section>
      </div>

      <footer className="tr-bottom">
        <span>GERMRING.DE&nbsp; / &nbsp;LOKAL. SACHLICH. ZUKUNFTSNAH.</span>
        <span>FÜRSTENFELDBRUCK</span>
      </footer>
    </main>
  );
}