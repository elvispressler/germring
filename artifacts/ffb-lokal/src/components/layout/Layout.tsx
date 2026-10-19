import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 420);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Nach oben scrollen"
      title="Nach oben"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/85 text-muted-foreground shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m5 15 7-7 7 7" />
      </svg>
    </button>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);

  return (
    <div key={location} className="page-enter">
      {children}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
