import type { ReactNode } from "react";

const navy = "#17324a";
const blue = "#2b6d8c";
const amber = "#e1a13d";
const sand = "#f5efe1";

function HorizonMark({ mono = false, size = 112 }: { mono?: boolean; size?: number }) {
  const dark = mono ? "#f5efe1" : navy;
  const mid = mono ? "#f5efe1" : blue;
  const sun = mono ? "#f5efe1" : amber;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-label="FFB Solarhorizont">
      <path d="M20 68a40 40 0 0 1 80 0" stroke={sun} strokeWidth="11" strokeLinecap="round" />
      <path d="M16 72h88" stroke={dark} strokeWidth="8" strokeLinecap="round" />
      <path d="M21 84h78" stroke={mid} strokeWidth="8" strokeLinecap="round" />
      <path d="M27 96h66" stroke={dark} strokeWidth="8" strokeLinecap="round" />
      <path d="M28 58h12M53 58h14M81 58h11" stroke={dark} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function MicroScale({ mono = false }: { mono?: boolean }) {
  return (
    <div className="flex items-end gap-3">
      {[16, 32, 62].map((size) => (
        <div className="flex flex-col items-center gap-1.5" key={size}>
          <div className="grid place-items-center rounded-[5px]" style={{ width: size, height: size, background: mono ? "#2c5265" : "#e7e0d0" }}>
            <HorizonMark mono={mono} size={Math.max(11, size - 5)} />
          </div>
          <span className="font-mono text-[9px] tracking-[0.08em]" style={{ color: mono ? "#b5c8cf" : "#6e7f83" }}>{size}px</span>
        </div>
      ))}
    </div>
  );
}

function Lockup({ mono = false }: { mono?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <HorizonMark mono={mono} size={42} />
      <div>
        <div className="whitespace-nowrap font-sans text-[19px] font-bold leading-none tracking-[-0.06em]" style={{ color: mono ? "#f5efe1" : navy }}>
          germring<span style={{ color: mono ? "#f5efe1" : amber }}>.de</span>
        </div>
        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em]" style={{ color: mono ? "#b5c8cf" : "#6e7f83" }}>Landkreis Fürstenfeldbruck</div>
      </div>
    </div>
  );
}

function MiniLabel({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#6e7f83]">{children}</span>;
}

export function Solarhorizont() {
  return (
    <main className="min-h-[360px] w-full overflow-hidden p-4" style={{ background: sand, color: navy }}>
      <div className="mb-3 flex items-start justify-between border-b border-[#d9d1c0] pb-2">
        <div>
          <MiniLabel>Hypothese 02 / 03</MiniLabel>
          <h1 className="mt-1 font-serif text-[19px] font-semibold leading-none">FFB-Solarhorizont</h1>
        </div>
        <div className="rounded-full border border-[#c9b77d] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.13em] text-[#9b6a25]">Place signal</div>
      </div>

      <div className="grid min-w-0 grid-cols-[1.05fr_1fr] gap-4">
        <section className="flex h-[190px] min-w-0 flex-col justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-[108px] w-[108px] place-items-center rounded-[19px] bg-[#e7e0d0]">
              <HorizonMark size={98} />
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

        <section className="rounded-[15px] border border-[#d9d1c0] bg-[#ebe4d5] p-4">
          <div className="flex items-center justify-between">
            <MiniLabel>Monochrom / dark</MiniLabel>
            <span className="font-mono text-[9px] text-[#6e7f83]">1C</span>
          </div>
          <div className="mt-3 rounded-xl bg-[#17324a] p-4">
            <Lockup mono />
            <div className="mt-3 border-t border-[#416075] pt-2.5"><MicroScale mono /></div>
          </div>
          <div className="mt-4 text-[12px] leading-[1.35] text-[#3f5964]">
            <span className="font-semibold text-[#17324a]">Warum:</span> Ein klarer Horizont verankert die Marke im Landkreis; der Solar-Arc signalisiert Energie, die Linien darunter lesen sich als Landschaft, Dachkante und Datenzeile zugleich.
          </div>
        </section>
      </div>
    </main>
  );
}