export function RingWortmarke() {
  const ink = "#472d29";
  const muted = "#82746a";
  const paper = "#f3ecdf";
  const rule = "#d8cdbd";
  const rust = "#a44d38";

  function Word({ reversed = false, size = 48 }: { reversed?: boolean; size?: number }) {
    const foreground = reversed ? paper : ink;
    return (
      <svg
        width="100%"
        height={size}
        viewBox="0 0 420 74"
        role="img"
        aria-label="germring.de Wortmarke"
        preserveAspectRatio="xMinYMid meet"
        style={{ display: "block", overflow: "visible" }}
      >
        <text
          x="1"
          y="56"
          fill={foreground}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="60"
          fontWeight="600"
          letterSpacing="-3.8"
          textLength="410"
          lengthAdjust="spacingAndGlyphs"
        >
          germring.de
        </text>
        {/* A fine return stroke turns the first g counter into a word-level loop,
            then settles into the baseline: typography, not a detached badge. */}
        <path
          d="M31 37c2-9 17-10 21 0 3 8-2 16-11 16-7 0-12-5-11-12 1-4 4-7 8-8m12 10c9 2 16 1 23-2"
          fill="none"
          stroke={reversed ? paper : rust}
          strokeWidth="1.65"
          strokeLinecap="round"
          opacity=".92"
        />
      </svg>
    );
  }

  function Crop({ size, reversed = false }: { size: number; reversed?: boolean }) {
    const foreground = reversed ? paper : ink;
    const background = reversed ? ink : "#e7ddcd";
    return (
      <div className="rw-crop" style={{ width: size, height: size, background }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 58 58"
          role="img"
          aria-label={`Wortmarken-Ausschnitt, ${size} Pixel`}
          style={{ display: "block" }}
        >
          <text
            x="-1"
            y="43"
            fill={foreground}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="39"
            fontWeight="600"
            letterSpacing="-3.1"
          >
            ger
          </text>
          <path
            d="M16 24c1-5 9-6 11 0 2 5-1 9-6 9-4 0-7-3-6-7 .5-2 2-4 5-4m7 5c5 1 8 0 12-2"
            fill="none"
            stroke={reversed ? paper : rust}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <main className="rw-board">
      <style>{`
        .rw-board {
          --rw-ink:${ink}; --rw-muted:${muted}; --rw-paper:${paper}; --rw-rule:${rule}; --rw-rust:${rust};
          box-sizing:border-box; width:100%; height:540px; overflow:hidden; padding:22px 24px 18px;
          color:var(--rw-ink); background:var(--rw-paper); font-family:"DM Sans", "Avenir Next", sans-serif;
          -webkit-font-smoothing:antialiased; position:relative;
        }
        .rw-board * { box-sizing:border-box; }
        .rw-top { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--rw-rule); padding-bottom:12px; }
        .rw-kicker,.rw-meta,.rw-label,.rw-size,.rw-foot { font-family:"IBM Plex Mono", "SFMono-Regular", monospace; text-transform:uppercase; letter-spacing:.13em; }
        .rw-kicker { font-size:8px; line-height:1; color:var(--rw-muted); }
        .rw-title { margin:6px 0 0; font:500 20px/1 "Newsreader", Georgia, serif; letter-spacing:-.035em; }
        .rw-meta { color:#75594e; border:1px solid #c9b4a2; padding:5px 8px 4px; font-size:7px; white-space:nowrap; }
        .rw-hero { padding:19px 0 16px; border-bottom:1px solid var(--rw-rule); }
        .rw-hero-label { display:flex; justify-content:space-between; align-items:center; }
        .rw-label { color:var(--rw-muted); font-size:7px; line-height:1.2; }
        .rw-overline { color:#a89581; font:italic 12px/1 "Newsreader", Georgia, serif; }
        .rw-wordstage { margin-top:7px; width:100%; }
        .rw-wordstage svg { height:90px; }
        .rw-hero-note { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-top:1px; }
        .rw-note { margin:0; max-width:286px; color:#6c5b51; font:italic 12px/1.35 "Newsreader", Georgia, serif; }
        .rw-note strong { color:var(--rw-ink); font-style:normal; font-weight:600; }
        .rw-index { padding-top:2px; color:#a89581; font:7px "IBM Plex Mono", monospace; letter-spacing:.08em; white-space:nowrap; }
        .rw-grid { display:grid; grid-template-columns:1.05fr .95fr; gap:15px; padding-top:14px; }
        .rw-lockcard { min-height:100px; margin-top:8px; padding:12px 10px; display:flex; flex-direction:column; justify-content:center; background:#e9dfd0; border-left:2px solid var(--rw-rust); }
        .rw-lockcard svg { width:100%; max-width:245px; }
        .rw-caption { margin-top:7px; color:var(--rw-muted); font:7px "IBM Plex Mono",monospace; letter-spacing:.1em; text-transform:uppercase; }
        .rw-samples { display:flex; align-items:flex-end; gap:12px; margin-top:12px; }
        .rw-sample { display:flex; flex-direction:column; align-items:center; gap:5px; }
        .rw-crop { display:grid; place-items:center; overflow:hidden; border-radius:2px; }
        .rw-size { color:var(--rw-muted); font-size:7px; letter-spacing:.06em; }
        .rw-mono { min-height:170px; padding:11px; background:#e8dfd1; border:1px solid var(--rw-rule); }
        .rw-mono-top { display:flex; justify-content:space-between; align-items:center; }
        .rw-code { color:var(--rw-muted); font:7px "IBM Plex Mono",monospace; }
        .rw-reverse { margin-top:8px; padding:12px 10px 10px; background:var(--rw-ink); }
        .rw-reverse svg { height:35px; }
        .rw-reverse .rw-samples { border-top:1px solid #775f53; padding-top:8px; margin-top:8px; }
        .rw-reverse .rw-size { color:#c5b4a4; }
        .rw-trade { margin:10px 1px 0; color:#625249; font:10px/1.35 "Newsreader", Georgia, serif; }
        .rw-trade b { color:var(--rw-ink); font-family:"DM Sans",sans-serif; font-size:8px; letter-spacing:.08em; text-transform:uppercase; }
        .rw-foot { display:flex; justify-content:space-between; border-top:1px solid var(--rw-rule); margin-top:12px; padding-top:8px; color:var(--rw-muted); font-size:7px; letter-spacing:.07em; }
        @media(max-width:480px) {
          .rw-board { padding:17px 16px 14px; }
          .rw-grid { gap:10px; }
          .rw-wordstage svg { height:78px; }
          .rw-lockcard { padding:10px 8px; }
          .rw-mono { padding:9px; }
        }
      `}</style>

      <header className="rw-top">
        <div>
          <div className="rw-kicker">Germring · Zeichenstudie / 04</div>
          <h1 className="rw-title">Der Name macht den Ring</h1>
        </div>
        <div className="rw-meta">A · Wortmarke</div>
      </header>

      <section className="rw-hero" aria-label="Integrierte Wortmarke">
        <div className="rw-hero-label">
          <span className="rw-label">Wort zuerst · integrierte Schleife</span>
          <span className="rw-overline">Lokal lesen. Weiterdenken.</span>
        </div>
        <div className="rw-wordstage"><Word size={90} /></div>
        <div className="rw-hero-note">
          <p className="rw-note"><strong>Ein Wortbild statt Wappen:</strong> die Schleife sitzt im g und läuft als feiner Zug in den Schriftzug zurück.</p>
          <span className="rw-index">LANDKREIS<br />FÜRSTENFELDBRUCK</span>
        </div>
      </section>

      <div className="rw-grid">
        <section aria-label="Lockup und Favicon">
          <div className="rw-label">Masthead · realistische Anwendung</div>
          <div className="rw-lockcard">
            <Word size={50} />
            <div className="rw-caption">Energie &amp; Zukunft im Landkreis Fürstenfeldbruck</div>
          </div>
          <div className="rw-samples">
            <div className="rw-sample"><Crop size={16} /><span className="rw-size">16 px</span></div>
            <div className="rw-sample"><Crop size={32} /><span className="rw-size">32 px</span></div>
            <p className="rw-trade" style={{ margin: "0 0 1px", maxWidth: 130 }}>Kompakter Ausschnitt aus derselben „ger“-Zeichnung.</p>
          </div>
        </section>

        <section className="rw-mono" aria-label="Einfarbige Verwendung">
          <div className="rw-mono-top"><span className="rw-label">Einfarbig · Umkehrung</span><span className="rw-code">1C</span></div>
          <div className="rw-reverse">
            <Word reversed size={37} />
            <div className="rw-samples">
              <div className="rw-sample"><Crop size={16} reversed /><span className="rw-size">16 px</span></div>
              <div className="rw-sample"><Crop size={32} reversed /><span className="rw-size">32 px</span></div>
              <span className="rw-code" style={{ color: "#c5b4a4", alignSelf: "center" }}>PAPIER AUF TINTE</span>
            </div>
          </div>
          <p className="rw-trade"><b>Abwägung.</b> Warm und eigenständig im Masthead; bei 16 px bleibt es ein typografischer Ausschnitt, kein lesbares Kürzel.</p>
        </section>
      </div>

      <footer className="rw-foot">
        <span>GERMRING.DE&nbsp; / &nbsp;LOKAL · SACHLICH · NAH</span>
        <span>SCHLEIFE IM NAMEN, NICHT DANEBEN</span>
      </footer>
    </main>
  );
}