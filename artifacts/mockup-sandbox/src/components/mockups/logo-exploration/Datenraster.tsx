import type { ReactNode } from "react";

const ink = "#233047";
const cyan = "#398b9a";
const orange = "#e26b48";
const mist = "#eef1ee";

function GridMark({ mono = false, size = 112 }: { mono?: boolean; size?: number }) {
  const dark = mono ? "#eef1ee" : ink;
  const active = mono ? "#eef1ee" : orange;
  const secondary = mono ? "#eef1ee" : cyan;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-label="Energie Datenraster">
      <rect x="15" y="15" width="90" height="90" rx="17" stroke={dark} strokeWidth="9" />
      <path d="M45 15v90M75 15v90M15 45h90M15 75h90" stroke={dark} strokeWidth="5" />
      <path d="M75 15v30h30" stroke={active} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 75h30v30" stroke={secondary} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="75" cy="75" r="6" fill={active} />
    </svg>
  );
}

function MicroScale({ mono = false }: { mono?: boolean }) {
  return (
    <div className="flex items-end gap-3">
      {[16, 32, 62].map((size) => (
        <div className="flex flex-col items-center gap-1.5" key={size}>
          <div className="grid place-items-center rounded-[5px]" style={{ width: size, height: size, background: mono ? "#34425c" : "#e1e8e6" }}>
            <GridMark mono={mono} size={Math.max(11, size - 5)} />
          </div>
          <span className="font-mono text-[9px] tracking-[0.08em]" style={{ color: mono ? "#bfccd2" : "#65737d" }}>{size}px</span>
        </div>
      ))}
    </div>
  );
}

function Lockup({ mono = false }: { mono?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <GridMark mono={mono} size={42} />
      <div>
        <div className="whitespace-nowrap font-sans text-[19px] font-bold leading-none tracking-[-0.06em]" style={{ color: mono ? "#eef1ee" : ink }}>
          germring<span style={{ color: mono ? "#eef1ee" : orange }}>.de</span>
        </div>
        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em]" style={{ color: mono ? "#bfccd2" : "#65737d" }}>Fakten · Energie · FFB</div>
      </div>
    </div>
  );
}

function MiniLabel({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#65737d]">{children}</span>;
}

export function Datenraster() {
  return (
    <main className="min-h-[360px] w-full overflow-hidden p-4" style={{ background: mist, color: ink }}>
      <div className="mb-3 flex items-start justify-between border-b border-[#cad5d4] pb-2">
        <div>
          <MiniLabel>Hypothese 03 / 03</MiniLabel>
          <h1 className="mt-1 font-serif text-[19px] font-semibold leading-none">Energie-Datenraster</h1>
        </div>
        <div className="rounded-full border border-[#a6c9ca] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.13em] text-[#287380]">Signal mark</div>
      </div>

      <div className="grid min-w-0 grid-cols-[1.05fr_1fr] gap-4">
        <section className="flex h-[190px] min-w-0 flex-col justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-[108px] w-[108px] place-items-center rounded-[19px] bg-[#e1e8e6]">
              <GridMark size={98} />
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

        <section className="rounded-[15px] border border-[#cad5d4] bg-[#e5ecea] p-4">
          <div className="flex items-center justify-between">
            <MiniLabel>Monochrom / dark</MiniLabel>
            <span className="font-mono text-[9px] text-[#65737d]">1C</span>
          </div>
          <div className="mt-3 rounded-xl bg-[#233047] p-4">
            <Lockup mono />
            <div className="mt-3 border-t border-[#495771] pt-2.5"><MicroScale mono /></div>
          </div>
          <div className="mt-4 text-[12px] leading-[1.35] text-[#465766]">
            <span className="font-semibold text-[#233047]">Warum:</span> Das Raster verbindet Solartechnik mit dem redaktionellen Versprechen: messen, einordnen, sichtbar machen. Die versetzte Ecke bleibt auch als kleiner Block unverwechselbar.
          </div>
        </section>
      </div>
    </main>
  );
}