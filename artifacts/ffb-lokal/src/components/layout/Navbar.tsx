import { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

const toolLinks = [
  { href: "/klima",        label: "Klimadaten & Vergleich" },
  { href: "/energieatlas", label: "Energieatlas" },
  { href: "/ladesaeulen",  label: "E-Ladesäulen" },
  { href: "/solarkataster",label: "Solarkataster" },
  { href: "/pv-rechner",   label: "PV-Rechner" },
  { href: "/foerderung",   label: "Förderungen" },
  { href: "/mitmachen",    label: "Mitmachen & Mitgestalten" },
];

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="w-5 h-4 flex flex-col justify-between">
      <span className={`block h-0.5 bg-foreground rounded-full transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
      <span className={`block h-0.5 bg-foreground rounded-full transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`} />
      <span className={`block h-0.5 bg-foreground rounded-full transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-[9px]" : ""}`} />
    </div>
  );
}

export function Navbar() {
  const { data: categories } = useListCategories();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [location] = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function openTools() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setToolsOpen(true);
  }
  function closeTools() {
    closeTimer.current = setTimeout(() => setToolsOpen(false), 180);
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8 flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className="h-10 w-auto shrink-0 object-contain"
            />
            <span className="font-sans font-extrabold text-xl tracking-[-0.04em] text-primary leading-none">
              germring.de
            </span>
            <span className="hidden lg:block text-xs text-muted-foreground font-sans font-normal border-l pl-2 ml-0.5 leading-tight">
              FFB Energie<br />& Zukunft
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategorie/${cat.slug}`}
                className={`transition-colors hover:text-foreground ${
                  location.startsWith(`/kategorie/${cat.slug}`) ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {cat.name}
              </Link>
            ))}

            {/* Tools Dropdown */}
            <div className="relative" onMouseEnter={openTools} onMouseLeave={closeTools}>
              <button
                className={`flex items-center gap-1 transition-colors hover:text-foreground ${
                  toolLinks.some(t => location.startsWith(t.href)) ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                Daten & Tools
                <svg className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {toolsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-52 bg-background border rounded-lg shadow-lg py-1.5 z-50">
                  {toolLinks.map(t => (
                    <Link
                      key={t.href}
                      href={t.href}
                      className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => setToolsOpen(false)}
                    >
                      {t.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link href="/newsletter" className="hidden sm:block">
              <Button variant="default" size="sm">
                Newsletter abonnieren
              </Button>
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 -mr-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            >
              <HamburgerIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden fixed top-16 left-0 right-0 z-40 bg-background border-b shadow-xl transition-all duration-300 ease-out ${
          mobileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 py-6 space-y-6">

          {/* Rubriken */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Rubriken</p>
            <div className="space-y-1">
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategorie/${cat.slug}`}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    location.startsWith(`/kategorie/${cat.slug}`)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Daten & Tools */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Daten & Tools</p>
            <div className="space-y-1">
              {toolLinks.map(t => (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    location.startsWith(t.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="pt-2 border-t">
            <Link href="/newsletter">
              <Button variant="default" className="w-full" size="lg">
                Newsletter abonnieren
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
