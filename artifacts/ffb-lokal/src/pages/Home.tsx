import { useState } from "react";
import { useListArticles, useGetSiteSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { PartnerTeaserSlot } from "@/components/ui/SponsorBox";
import { HomeHero } from "@/components/home/HomeHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScrollReveal } from "@/hooks/useParallax";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  trackNewsletterResendOutcome,
  trackNewsletterSignupOutcome,
} from "@/lib/analytics";

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  accentColor = "#059669",
  label,
  title,
  linkHref,
  linkLabel = "Alle Artikel →",
}: {
  accentColor?: string;
  label: string;
  title: string;
  linkHref: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="block w-7 h-0.5 rounded" style={{ background: accentColor }} />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline justify-between pb-4 border-b-2 border-foreground/8">
        <h2 className="text-3xl font-serif font-bold">{title}</h2>
        <Link href={linkHref} className="text-sm font-medium text-primary hover:underline">
          {linkLabel}
        </Link>
      </div>
    </div>
  );
}

export function HomeNewsletterBox() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "notice" | "error">("idle");
  const [resending, setResending] = useState(false);

  async function requestConfirmation(path: "/api/newsletter/subscribe" | "/api/newsletter/resend-confirmation") {
    const isResend = path.endsWith("/resend-confirmation");
    if (!email || state === "loading" || resending) return;
    if (isResend) setResending(true);
    else setState("loading");
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...(isResend ? {} : { location: "home" }) }),
      });
      const outcome = res.status === 202 ? "accepted" : "failed";
      if (isResend) {
        trackNewsletterResendOutcome("home", outcome);
      } else {
        trackNewsletterSignupOutcome("home", outcome);
      }
      setState(res.status === 202 ? "notice" : "error");
    } catch {
      if (isResend) {
        trackNewsletterResendOutcome("home", "failed");
      } else {
        trackNewsletterSignupOutcome("home", "failed");
      }
      setState("error");
    } finally {
      if (isResend) setResending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await requestConfirmation("/api/newsletter/subscribe");
  }

  if (state === "notice") {
    return (
      <div className="rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto border"
        style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(160 22% 96%) 100%)" }}>
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-2xl font-serif font-bold mb-2">Bitte Postfach prüfen</h2>
        <p className="text-muted-foreground">
          Wenn eine Anmeldung möglich ist, erhältst du in Kürze eine E-Mail mit weiteren Informationen.
          Bitte prüfe auch deinen Spam-Ordner.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => void requestConfirmation("/api/newsletter/resend-confirmation")}
          disabled={resending}
        >
          {resending ? "Wird angefordert…" : "Keine E-Mail erhalten? Erneut anfordern"}
        </Button>
      </div>
    );
  }

  return (
    <div className="card-hover rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto border"
      style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(160 22% 96%) 100%)" }}>
      <h2 className="text-3xl font-serif font-bold mb-4">Fakten vor Meinung. Jede Woche.</h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
        1× pro Woche die wichtigsten Zahlen und Beschlüsse aus dem Landkreis FFB direkt in dein Postfach.
      </p>
      <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Deine E-Mail-Adresse"
          className="h-12"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading" || resending}
        />
        <Button size="lg" className="h-12 px-8 relative overflow-hidden group/btn" disabled={state === "loading" || resending}>
          <span className="relative z-10">{state === "loading" || resending ? "Wird gesendet…" : "Abonnieren"}</span>
          <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
            style={{ background: "radial-gradient(circle at 60% 50%, rgba(52,211,153,0.25) 0%, transparent 70%)" }} />
        </Button>
      </form>
      {state === "error" && (
        <p className="text-sm text-destructive mt-3">Etwas ist schiefgelaufen — bitte versuch es erneut.</p>
      )}
      <p className="text-xs text-muted-foreground mt-4">Jederzeit kündbar. Keine Werbung. DSGVO-konform.</p>
    </div>
  );
}

export function Home() {
  const { data: energieArticles,   isLoading: isLoadingEnergie   } = useListArticles({ categorySlug: "energie-erneuerbare",  limit: 20 });
  const { data: kommunalArticles,  isLoading: isLoadingKommunal  } = useListArticles({ categorySlug: "kommunalpolitik",       limit: 20 });
  const { data: praxisArticles,    isLoading: isLoadingPraxis    } = useListArticles({ categorySlug: "praxis-zukunft",        limit: 20 });
  const { data: zahlenArticles,    isLoading: isLoadingZahlen    } = useListArticles({ categorySlug: "zahlen-daten",          limit: 20 });
  const { data: siteSummary } = useGetSiteSummary();

  usePageMeta({
    title: "germring.de",
    path: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "NewsMediaOrganization",
          "@id": "https://germring.de/#organization",
          name: "FFB Energie & Zukunft",
          url: "https://germring.de",
          description: "Faktenbasiertes Lokalmedium für Erneuerbare Energien, Kommunalpolitik und die Zukunft des Landkreises Fürstenfeldbruck.",
          logo: { "@type": "ImageObject", url: "https://germring.de/logo.png" },
          areaServed: { "@type": "AdministrativeArea", name: "Landkreis Fürstenfeldbruck" },
          inLanguage: "de-DE",
        },
        {
          "@type": "WebSite",
          "@id": "https://germring.de/#website",
          name: "germring.de",
          url: "https://germring.de",
          publisher: { "@id": "https://germring.de/#organization" },
          inLanguage: "de-DE",
        },
      ],
    },
  });

  const energieFeature = energieArticles?.find(article => Boolean(article.imageUrl));
  const energieSidebar = energieArticles?.filter(
    article => Boolean(article.imageUrl) && article.id !== energieFeature?.id,
  ) ?? [];
  const kommunalFeature = kommunalArticles?.find(article => Boolean(article.imageUrl));
  const kommunalSecondary = kommunalArticles?.find(
    article => Boolean(article.imageUrl) && article.id !== kommunalFeature?.id,
  );
  const praxisFeature = praxisArticles?.find(article => Boolean(article.imageUrl));
  const zahlenFeature = zahlenArticles?.find(article => Boolean(article.imageUrl))
    ?? praxisFeature;

  return (
    <div className="flex flex-col gap-24 pb-24">

      {/* 1. Hero */}
      <HomeHero
        energie={energieFeature}
        kommunal={kommunalFeature}
        zahlen={zahlenFeature}
      />

      {/* 2. Themenfelder — 4 Kategorie-Kacheln */}
      <RevealSection className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Themenfelder</p>
            <h2 className="text-3xl font-serif font-bold">Was uns bewegt</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            {
              slug: "energie-erneuerbare",
              name: "Energie & Erneuerbare",
              desc: "PV-Ausbau, Windkraft und die Energiewende im Landkreis FFB.",
              count: 8,
              from: "#059669", to: "#064e3b",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              ),
            },
            {
              slug: "kommunalpolitik",
              name: "Kommunalpolitik",
              desc: "Beschlüsse, Sitzungen und Entscheidungen aus dem Landkreis.",
              count: 7,
              from: "#0369a1", to: "#0c2a4a",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v5m4-5v5m4-5v5" />
                </svg>
              ),
            },
            {
              slug: "zahlen-daten",
              name: "Zahlen & Daten",
              desc: "Kennzahlen und Einordnung — was bedeutet das für den Landkreis?",
              count: 6,
              from: "#b45309", to: "#5c2d0a",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-5 4 3 4-6" />
                </svg>
              ),
            },
            {
              slug: "praxis-zukunft",
              name: "Praxis & Zukunft",
              desc: "Förderprogramme, Praxis-Tipps und Zukunftsperspektiven.",
              count: 7,
              from: "#7c3aed", to: "#3b0764",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.4-1.3 4.5-3.2 5.6L15 17H9l.2-2.4C7.3 13.5 6 11.4 6 9a6 6 0 0 1 6-6z" />
                </svg>
              ),
            },
          ] as const).map(cat => (
            <Link key={cat.slug} href={`/kategorie/${cat.slug}`}>
              <div
                className="group relative overflow-hidden rounded-2xl cursor-pointer flex flex-col"
                style={{
                  background: `linear-gradient(145deg, ${cat.from} 0%, ${cat.to} 100%)`,
                  minHeight: "210px",
                }}
              >
                {/* Punkt-Muster */}
                <div className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                {/* Hover-Schimmer */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.06] transition-colors duration-300" />

                <div className="relative p-6 flex flex-col h-full">
                  <div className="w-9 h-9 mb-5 text-white/75 group-hover:text-white transition-colors">
                    {cat.icon}
                  </div>
                  <h3 className="font-serif font-bold text-white text-base md:text-lg leading-snug mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-white/55 text-xs leading-relaxed flex-1">{cat.desc}</p>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                    <span className="text-[11px] font-semibold text-white/45 uppercase tracking-wider">
                      {cat.count} Artikel
                    </span>
                    <span className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 text-sm font-medium">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </RevealSection>

      {/* 3. Magazin-Mosaik — Neueste Beiträge aus allen Rubriken */}
      <RevealSection className="container mx-auto px-4 lg:px-8">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Aktuell</p>
            <h2 className="text-3xl font-serif font-bold">Neueste Beiträge</h2>
          </div>
          <Link href="/kategorie/energie-erneuerbare" className="text-sm font-medium text-primary hover:underline hidden sm:block">
            Alle Artikel →
          </Link>
        </div>

        {(isLoadingEnergie || isLoadingKommunal || isLoadingPraxis || isLoadingZahlen) ? (
          <LogoLoader
            label="Beiträge werden geladen"
            className="min-h-[33rem] md:min-h-[29rem]"
          />
        ) : (
          <>
            {/* Zeile 1: Großes Feature (2/3) + 2 Sidebars (1/3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div className="md:col-span-2">
                {energieFeature && <ArticleCard article={energieFeature} layout="feature" />}
              </div>
              <div className="flex flex-col gap-5">
                {kommunalFeature && (
                  <ArticleCard article={kommunalFeature} layout="sidebar" />
                )}
                {zahlenFeature && (
                  <ArticleCard article={zahlenFeature} layout="sidebar" />
                )}
              </div>
            </div>

            {/* Zeile 2: 3 gleiche Karten quer durch alle Rubriken */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {energieSidebar[0] && (
                <ArticleCard article={energieSidebar[0]} layout="vertical" />
              )}
                {praxisFeature && (
                  <ArticleCard article={praxisFeature} layout="vertical" />
              )}
                {kommunalSecondary && (
                  <ArticleCard article={kommunalSecondary} layout="vertical" />
              )}
            </div>
          </>
        )}
      </RevealSection>

      {/* 4. Partner-Teaser */}
      <RevealSection className="container mx-auto px-4 lg:px-8">
        <PartnerTeaserSlot />
      </RevealSection>

      {/* 5. Klimaschutz-Chronologie — redaktionelle Einheit */}
      <section className="py-20" style={{ background: "linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--muted) / 0.4) 15%, hsl(var(--muted) / 0.4) 85%, hsl(var(--background)) 100%)" }}>
        <RevealSection className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#b45309" }}>Zeitlinie</p>
              <h2 className="text-3xl font-serif font-bold">Klimaschutz-Chronologie</h2>
              <p className="text-muted-foreground mt-2 max-w-xl text-sm">
                Beschlüsse, Gesetze und Ziele im Landkreis FFB — von 2000 bis 2045.
              </p>
            </div>
            <Link href="/kategorie/zahlen-daten" className="text-sm font-medium text-primary hover:underline hidden sm:block shrink-0">
              Zahlen & Daten →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Zeitleiste */}
            <div className="relative">
              <div className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-border" aria-hidden="true" />
              <ol className="space-y-0">
                {[
                  { year: "2000", status: "done",    label: "Energieresolution beschlossen",       desc: "Kreistag FFB: 100 % erneuerbare Energien bis 2030 als politisches Ziel." },
                  { year: "2010", status: "done",    label: "Auszeichnung Kommunaler Klimaschutz", desc: "Bundeswettbewerb würdigt 10 Jahre Energiewende-Engagement im Landkreis." },
                  { year: "2016", status: "done",    label: "KfW-55-Standard für Neubauten",       desc: "Stadt FFB verpflichtet Bauherren zum Energieeffizienzstandard KfW 55." },
                  { year: "2022", status: "done",    label: "10H-Regelung Bayern gelockert",       desc: "Neue Windkraftstandorte im Landkreis FFB werden wieder planbar." },
                  { year: "2023", status: "done",    label: "MwSt. auf PV-Anlagen abgeschafft",   desc: "Bundesgesetz: 0 % Mehrwertsteuer senkt Investitionskosten für Haushalte." },
                  { year: "2025", status: "active",  label: "PV-Ausbau kreiseigene Gebäude",      desc: "Landkreis rüstet eigene Liegenschaften mit Solaranlagen aus." },
                  { year: "2027", status: "planned", label: "Fernwärme-Masterplan Stadt FFB",      desc: "Stadtwerke legen verbindliche Planung für klimaneutrale Wärmeversorgung vor." },
                  { year: "2030", status: "target",  label: "Ziel: 100 % erneuerbare Energien",   desc: "Gesamte Stromversorgung des Landkreises aus erneuerbaren Quellen." },
                  { year: "2045", status: "target",  label: "Ziel: 100 % EE Wärmenetze (Bund)",  desc: "Bundesgesetz: alle Wärmenetze vollständig aus erneuerbaren Energien." },
                ].map((m, i) => (
                  <li key={i} className="flex gap-4 pb-5 last:pb-0">
                    <div className="w-20 shrink-0 text-right pt-0.5">
                      <span className={`text-sm font-mono font-semibold tabular-nums ${
                        m.status === "done"    ? "text-primary" :
                        m.status === "active"  ? "text-amber-600 dark:text-amber-400" :
                        m.status === "planned" ? "text-muted-foreground" :
                                                "text-muted-foreground/50"
                      }`}>{m.year}</span>
                    </div>
                    <div className="relative flex items-start gap-3 pl-6">
                      <span className={`absolute left-0 top-1.5 flex h-4 w-4 -translate-x-[calc(50%+0.5px)] items-center justify-center rounded-full border-2 ${
                        m.status === "done"    ? "border-primary bg-primary" :
                        m.status === "active"  ? "border-amber-500 bg-amber-500" :
                        m.status === "planned" ? "border-border bg-background" :
                                                "border-dashed border-muted-foreground/40 bg-background"
                      }`}>
                        {m.status === "done" && (
                          <svg className="h-2 w-2 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 8 8">
                            <path d="M1 4l2 2 4-4" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        )}
                        {m.status === "active" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      <div>
                        <p className={`text-sm font-semibold leading-snug ${m.status === "target" ? "text-muted-foreground" : "text-foreground"}`}>{m.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground pl-24">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary inline-block" /> Umgesetzt</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> In Umsetzung</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-border inline-block" /> Geplant</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-dashed border-muted-foreground/40 inline-block" /> Politisches Ziel</span>
              </div>
            </div>

            {/* Rechte Spalte: Kontext-Karten */}
            <div className="space-y-4">
              {[
                {
                  icon: "⚡",
                  label: "100 %",
                  sub: "Erneuerbare bis 2030",
                  desc: "Das Ziel des Kreistags FFB — formuliert bereits im Jahr 2000. Der Fortschritt ist messbar.",
                  color: "#059669",
                },
                {
                  icon: "🌡️",
                  label: "12,8 °C",
                  sub: "Jahresdurchschnitt",
                  desc: "Mildes Klima im Landkreis — Wärmepumpen arbeiten hier besonders effizient.",
                  color: "#0369a1",
                },
                {
                  icon: "☀️",
                  label: "2.019 Std",
                  sub: "Sonnenstunden 2025",
                  desc: "+22 % über dem Bundesschnitt. Ideale Voraussetzungen für PV-Anlagen.",
                  color: "#b45309",
                },
              ].map(k => (
                <div key={k.label} className="flex gap-4 p-5 rounded-xl border bg-card">
                  <div className="text-2xl shrink-0">{k.icon}</div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold font-mono" style={{ color: k.color }}>{k.label}</span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{k.sub}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{k.desc}</p>
                  </div>
                </div>
              ))}
              <Link href="/klima">
                <div className="flex items-center justify-between p-5 rounded-xl border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer mt-2">
                  <div>
                    <p className="font-semibold text-sm">Alle Klimadaten erkunden</p>
                    <p className="text-xs text-primary-foreground/70 mt-0.5">Gemeindevergleich, Charts, Zeitreihen</p>
                  </div>
                  <span className="text-xl">→</span>
                </div>
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* 6. Daten & Tools Teaser */}
      <RevealSection className="container mx-auto px-4 lg:px-8">
        <div className="rounded-2xl bg-primary text-primary-foreground p-8 md:p-12 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-10 left-1/4 w-48 h-48 rounded-full bg-white/[0.04]" aria-hidden="true" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-3">Interaktiv</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">Daten & Tools für den Landkreis FFB</h2>
            <p className="text-primary-foreground/75 mb-6 max-w-xl">
              Lokale Klimadaten, Gemeindevergleich, PV-Rechner, Energieatlas und Fördermittel-Übersicht — alles auf Basis echter regionaler Messwerte.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { href: "/klima",        label: "Klimadaten & Vergleich" },
                { href: "/ladesaeulen",  label: "E-Ladesäulen" },
                { href: "/pv-rechner",   label: "PV-Rechner" },
                { href: "/energieatlas", label: "Energieatlas" },
                { href: "/foerderung",   label: "Förderungen" },
              ].map(t => (
                <Link key={t.href} href={t.href}>
                  <span className="inline-block bg-white/15 hover:bg-white/25 border border-white/20 text-sm font-medium px-4 py-2 rounded-full transition-colors cursor-pointer">
                    {t.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* 7. Newsletter-Box */}
      <RevealSection className="container mx-auto px-4 lg:px-8">
        <HomeNewsletterBox />
      </RevealSection>
    </div>
  );
}
