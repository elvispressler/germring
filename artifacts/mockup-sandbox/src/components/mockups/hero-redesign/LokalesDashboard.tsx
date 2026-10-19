import "./_group.css";

const signals = [
  {
    value: "2.019",
    unit: "Std/Jahr",
    label: "Sonnenstunden 2025",
    accent: "#d48b2c",
    mark: "01",
  },
  {
    value: "12,8",
    unit: "°C",
    label: "Jahresdurchschnitt",
    accent: "#277f73",
    mark: "02",
  },
  {
    value: "70",
    unit: "%",
    label: "BEG-Förderung",
    prefix: "bis ",
    accent: "#467ca3",
    mark: "03",
  },
];

export function LokalesDashboard() {
  return (
    <main className="germring-hero-preview min-h-screen bg-[#f3f1eb] text-[#18332e]">
      <section className="relative min-h-screen overflow-hidden border-b border-[#d8ddd6]">
        <div className="pointer-events-none absolute right-0 top-0 h-[460px] w-[52%] bg-[#e5eee8] [clip-path:polygon(23%_0,100%_0,100%_76%,0_100%)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-full bg-[#e9e4d8] [clip-path:polygon(0_35%,100%_0,100%_100%,0_100%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-[1240px] flex-col px-5 py-6 sm:px-8 lg:px-12">
          <header className="flex items-center justify-between border-b border-[#ccd6ce] pb-5">
            <div className="flex items-center gap-3 text-[#18332e]" aria-label="germring.de">
              <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#277f73] text-sm font-bold tracking-[-.08em]">
                gr
              </span>
              <span className="text-[15px] font-semibold tracking-[-.02em]">
                germring<span className="text-[#277f73]">.</span>de
              </span>
            </div>
            <p className="hidden text-[11px] font-semibold uppercase tracking-[.2em] text-[#668078] sm:block">
              Lokales Wissen, klar eingeordnet
            </p>
            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[#668078]">
              <span className="h-2 w-2 rounded-full bg-[#277f73]" />
              FFB / 2025
            </span>
          </header>

          <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,.9fr)] lg:gap-20 lg:py-16">
            <div className="max-w-[620px]">
              <div className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.2em] text-[#277f73]">
                <span className="h-px w-8 bg-[#277f73]" />
                Landkreis Fürstenfeldbruck
              </div>

              <h1 className="max-w-[610px] text-[clamp(2.45rem,5.4vw,5.25rem)] font-bold leading-[1.04] tracking-[-.055em] text-[#18332e]">
                Was im Landkreis{" "}
                <em className="font-normal not-italic text-[#277f73]">zählt.</em>
              </h1>
              <p className="mt-7 max-w-[510px] text-base leading-7 text-[#557069] sm:text-lg">
                Ein faktenbasiertes Lokalmedium für Erneuerbare,
                Kommunalpolitik und die Zukunft des Landkreises FFB.
              </p>

              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
                <a
                  href="/newsletter"
                  className="inline-flex min-h-12 items-center justify-center rounded-[3px] bg-[#277f73] px-6 text-sm font-semibold text-[#f7f4ec] shadow-[0_8px_20px_rgba(39,127,115,.16)] hover:-translate-y-0.5 hover:bg-[#1d665d]"
                >
                  Newsletter abonnieren
                  <span className="ml-3 text-lg leading-none" aria-hidden="true">→</span>
                </a>
                <a
                  href="/klima"
                  className="border-b border-[#8ba59d] pb-1 text-sm font-semibold text-[#277f73] hover:border-[#277f73] hover:text-[#18332e]"
                >
                  Klimadaten erkunden
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#668078]">
                    Drei Signale
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-.04em] text-[#18332e] sm:text-3xl">
                    Der Landkreis in Zahlen
                  </h2>
                </div>
                <span className="mb-1 font-mono text-[10px] text-[#789087]">VERIFIZIERT / 2025</span>
              </div>

              <div className="overflow-hidden rounded-[4px] border border-[#cbd8d0] bg-[#f8f7f1]/90 shadow-[0_18px_50px_rgba(46,74,63,.08)]">
                {signals.map((signal, index) => (
                  <div
                    key={signal.label}
                    className={`group relative flex items-center gap-4 px-5 py-5 sm:px-7 sm:py-6 ${
                      index < signals.length - 1 ? "border-b border-[#dfe5dc]" : ""
                    }`}
                  >
                    <span
                      className="absolute bottom-0 left-0 top-0 w-1"
                      style={{ backgroundColor: signal.accent }}
                      aria-hidden="true"
                    />
                    <span className="w-7 font-mono text-[10px] text-[#9aa9a1]">{signal.mark}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        {signal.prefix && (
                          <span className="text-sm font-medium text-[#668078]">{signal.prefix}</span>
                        )}
                        <span className="font-mono text-[clamp(1.7rem,3vw,2.35rem)] font-semibold tracking-[-.08em]" style={{ color: signal.accent }}>
                          {signal.value}
                        </span>
                        <span className="font-mono text-sm font-semibold text-[#668078]">{signal.unit}</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-[#557069]">{signal.label}</p>
                    </div>
                    <span className="hidden h-8 w-16 items-end gap-1 sm:flex" aria-hidden="true">
                      {[35, 54, 42, 68, 58, 83].map((height, barIndex) => (
                        <span
                          key={barIndex}
                          className="w-1 rounded-t-sm opacity-70"
                          style={{ height: `${height}%`, backgroundColor: signal.accent }}
                        />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-right text-[11px] leading-5 text-[#789087]">
                Zahlen statt Lautstärke. Einordnung statt Parolen.
              </p>
            </div>
          </div>

          <footer className="flex items-center justify-between border-t border-[#ccd6ce] pt-4 text-[10px] font-semibold uppercase tracking-[.16em] text-[#789087]">
            <span>Erneuerbare · Kommunalpolitik · Zukunft</span>
            <span className="hidden sm:block">Fakten vor Meinung</span>
          </footer>
        </div>
      </section>
    </main>
  );
}