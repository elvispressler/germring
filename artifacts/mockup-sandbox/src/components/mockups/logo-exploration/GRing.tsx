import type { ReactNode } from "react";

const ink = "#17353a";
const teal = "#17766f";
const coral = "#d8654d";
const paper = "#f6f0e4";

function GRMark({ mono = false, size = 112 }: { mono?: boolean; size?: number }) {
  const main = mono ? ink : teal;
  const accent = mono ? ink : coral;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-label="G R Energiering">
      <circle cx="60" cy="60" r="47" stroke={main} strokeWidth="10" strokeDasharray="236 64" strokeLinecap="round" transform="rotate(-42 60 60)" />
      <path d="M70 15c24 5 40 25 40 48 0 14-5 27-14 37" stroke={accent} strokeWidth="10" strokeLinecap="round" />
      <path d="M37 49c0-11 9-20 20-20s20 9 20 20-9 20-20 20H39v22" stroke={main} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M58 69l22 22" stroke={accent} strokeWidth="7" strokeLinecap="round" />
      <circle cx="60" cy="60" r="4" fill={main} />
    </svg>
  );
}

function MicroScale({ mono = false }: { mono?: boolean }) {
  return (
    <div className="flex items-end gap-3">
      {[16, 32, 62].map((size) => (
        <div className="flex flex-col items-center gap-1.5" key={size}>
          <div className="grid place-items-center rounded-[5px]" style={{ width: size, height: size, background: mono ? "#17353a" : "#e5e8dd" }}>
            <GRMark mono={mono} size={Math.max(11, size - 5)} />
          </div>
          <span className="font-mono text-[9px] tracking-[0.08em]" style={{ color: mono ? "#a4b8b2" : "#6f817c" }}>{size}px</span>
        </div>
      ))}
    </div>
  );
}

function Lockup({ mono = false }: { mono?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <GRMark mono={mono} size={42} />
      <div>
        <div className="whitespace-nowrap font-sans text-[19px] font-bold leading-none tracking-[-0.06em]" style={{ color: mono ? "#f6f0e4" : ink }}>
          germring<span style={{ color: mono ? "#f6f0e4" : coral }}>.de</span>
        </div>
        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em]" style={{ color: mono ? "#a4b8b2" : "#6f817c" }}>FFB · Energie & Zukunft</div>
      </div>
    </div>
  );
}

function MiniLabel({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#6f817c]">{children}</span>;
}

export function GRing() {
  return (
    <main className="min-h-[360px] w-full overflow-hidden p-4" style={{ background: paper, color: ink }}>
      <div className="mb-3 flex items-start justify-between border-b border-[#d6d6c9] pb-2">
        <div>
          <MiniLabel>Hypothese 01 / 03</MiniLabel>
          <h1 className="mt-1 font-serif text-[19px] font-semibold leading-none">G/R-Energiering</h1>
        </div>
        <div className="rounded-full border border-[#b7c7bf] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.13em] text-[#17766f]">Loop mark</div>
      </div>

      <div className="grid min-w-0 grid-cols-[1.05fr_1fr] gap-4">
        <section className="flex h-[190px] min-w-0 flex-col justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-[108px] w-[108px] place-items-center rounded-[19px] bg-[#e5e8dd]">
              <GRMark size={98} />
            </div>
            <div className="space-y-3">
              <MiniLabel>Erkennbar in</MiniLabel>
              <MicroScale />
            </div>
          </div>
          <div className="pt-4">
            <Lockup />
          </div>
        </section>

        <section className="rounded-[15px] border border-[#d6d6c9] bg-[#edf0e8] p-4">
          <div className="flex items-center justify-between">
            <MiniLabel>Monochrom / dark</MiniLabel>
            <span className="font-mono text-[9px] text-[#6f817c]">1C</span>
          </div>
          <div className="mt-3 rounded-xl bg-[#17353a] p-4">
            <Lockup mono />
            <div className="mt-3 border-t border-[#3d5b5d] pt-2.5"><MicroScale mono /></div>
          </div>
          <div className="mt-4 text-[12px] leading-[1.35] text-[#345055]">
            <span className="font-semibold text-[#17353a]">Warum:</span> G und R greifen ineinander und machen den Namen selbst zum Gedächtnisanker. Der offene Kreis bleibt als Energiefluss lesbar, ohne Sonne- oder Blattsymbolik.
          </div>
        </section>
      </div>
    </main>
  );
}