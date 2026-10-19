import { useState } from "react";
import { useGetActiveSponsor } from "@workspace/api-client-react";
import { Link } from "wouter";

interface SponsorBoxProps {
  categorySlug?: string;
}

/* ── Werbeslot-Kachel — intern + als eigenständige Komponente ── */
export function PartnerTeaserSlot({ topMargin = false }: { topMargin?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href="/partner" onClick={e => e.currentTarget}>
      <aside
        className={`${topMargin ? "mt-12" : ""} relative rounded-2xl overflow-hidden cursor-pointer select-none`}
        style={{
          background: hovered
            ? "linear-gradient(135deg, hsl(160 55% 13%) 0%, hsl(160 50% 17%) 100%)"
            : "linear-gradient(135deg, hsl(160 55% 13%) 0%, hsl(160 48% 16%) 60%, hsl(200 50% 15%) 100%)",
          transition: "background 300ms ease",
          minHeight: "220px",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Werbeplatz — Partner werden"
        role="complementary"
      >
        {/* Subtiles Punkt-Muster */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(160 60% 70%) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Schimmernder Lichtkegel on hover */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 15% 50%, rgba(52,211,153,0.12) 0%, transparent 65%)",
            opacity: hovered ? 1 : 0.4,
            transition: "opacity 300ms ease",
          }}
        />

        {/* Inhalt */}
        <div className="relative flex flex-col md:flex-row items-center gap-8 px-10 py-10">

          {/* Links: Pitch-Text */}
          <div className="flex-1 min-w-0">
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-5"
              style={{ background: "rgba(52,211,153,0.15)", color: "rgba(110,231,183,0.9)", border: "1px solid rgba(52,211,153,0.2)" }}
            >
              Werbeplatz verfügbar
            </span>

            <h3 className="font-serif font-bold text-white text-2xl md:text-3xl leading-snug mb-3">
              Hier könnte Ihr Unternehmen stehen.
            </h3>

            <p className="text-base leading-relaxed max-w-lg" style={{ color: "rgba(167,243,208,0.7)" }}>
              Erreichen Sie Hausbesitzer, Gewerbetreibende und Entscheider
              im Landkreis Fürstenfeldbruck — kontextuell platziert, ohne Streuverlust.
            </p>
          </div>

          {/* Mitte: Kennzahlen */}
          <div className="shrink-0 hidden lg:flex flex-col gap-5 px-10 border-l border-r"
            style={{ borderColor: "rgba(52,211,153,0.15)" }}>
            {[
              { value: "1×/Woche", label: "Newsletter-Ausgabe" },
              { value: "6",        label: "Themen-Rubriken" },
              { value: "lokal",    label: "Landkreis FFB" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-serif font-bold text-xl" style={{ color: "rgba(110,231,183,0.95)" }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(167,243,208,0.55)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rechts: CTA */}
          <div className="shrink-0 text-center md:text-right">
            <div
              className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl mb-3"
              style={{
                background: hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.9)",
                color: "hsl(160 55% 13%)",
                transition: "background 200ms ease",
                boxShadow: hovered ? "0 4px 20px rgba(52,211,153,0.3)" : "none",
              }}
            >
              Jetzt Partner werden
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <p className="text-xs" style={{ color: "rgba(167,243,208,0.45)" }}>
              partner@germring.de
            </p>
          </div>
        </div>
      </aside>
    </Link>
  );
}

/* ── Echter Sponsor ────────────────────────────────────────── */
export function SponsorBox({ categorySlug }: SponsorBoxProps) {
  const { data: sponsors, isLoading } = useGetActiveSponsor(
    categorySlug ? { categorySlug } : {},
  );

  if (isLoading) return null;

  const sponsor = sponsors?.[0];

  // Kein Sponsor — Platzhalter im exakt gleichen Layout wie die echte Box,
  // damit Interessierte sofort sehen, was sie buchen würden.
  if (!sponsor) {
    return (
      <Link href="/partner#kontakt">
        <aside
          className="mt-12 rounded-xl p-6 flex flex-col sm:flex-row gap-5 items-start cursor-pointer group transition-colors"
          style={{
            border: "1.5px dashed hsl(var(--border))",
            background: "hsl(var(--muted) / 0.25)",
          }}
          aria-label="Buchbarer Werbeplatz"
        >
          {/* Logo-Platzhalter */}
          <div className="shrink-0">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center"
              style={{ background: "hsl(var(--muted))", border: "1.5px dashed hsl(var(--border))" }}>
              <svg className="w-5 h-5 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
                <path d="M3 9h18M9 21V9" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: "hsl(var(--primary))" }}>
              Werbeplatz · Native Partner-Box
            </p>
            <p className="font-semibold text-sm mb-1 text-foreground/50 italic">
              Hier könnte Ihr Unternehmen stehen.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kontextuell platziert am Ende jedes Artikels — sichtbar für Hausbesitzer,
              Gewerbetreibende und Entscheider im Landkreis FFB.
            </p>
          </div>

          {/* CTA */}
          <div className="shrink-0 mt-1">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline whitespace-nowrap">
              Werbeplatz anfragen
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </aside>
      </Link>
    );
  }

  return (
    <aside
      className="mt-12 border rounded-xl p-6 bg-muted/30 flex flex-col sm:flex-row gap-5 items-start"
      data-testid="sponsor-box"
      aria-label="Partner-Hinweis"
    >
      <div className="shrink-0">
        {sponsor.logoUrl ? (
          <img
            src={sponsor.logoUrl}
            alt={sponsor.name}
            className="h-12 w-auto object-contain rounded"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg leading-none">
              {sponsor.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          Anzeige / Partner
        </p>
        <p className="font-semibold text-sm mb-1">{sponsor.name}</p>
        {sponsor.tagline && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {sponsor.tagline}
          </p>
        )}
      </div>

      {sponsor.website && (
        <a
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline whitespace-nowrap mt-1"
          data-testid="sponsor-cta"
        >
          {sponsor.ctaLabel}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </aside>
  );
}
