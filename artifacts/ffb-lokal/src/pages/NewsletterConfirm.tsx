import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LogoLoader } from "@/components/ui/LogoLoader";
import {
  trackNewsletterConfirmationCompleted,
  type NewsletterConfirmationLocation,
} from "@/lib/analytics";

type State = "loading" | "success" | "error";

export function NewsletterConfirm() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const url = new URL(window.location.href);
    const token =
      window.__newsletterConfirmToken ?? url.searchParams.get("token");
    delete window.__newsletterConfirmToken;

    if (url.searchParams.has("token")) {
      url.searchParams.delete("token");
      const cleanUrl = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(window.history.state, "", cleanUrl);
    }

    if (!token) {
      setState("error");
      return;
    }
    fetch(`/api/newsletter/confirm?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json() as { location?: unknown };
          const location: NewsletterConfirmationLocation =
            data.location === "home" || data.location === "newsletter"
              ? data.location
              : "unknown";
          trackNewsletterConfirmationCompleted(location);
          setState("success");
        } else {
          setState("error");
        }
      })
      .catch(() => setState("error"));
  }, []);

  if (state === "loading") {
    return (
      <LogoLoader
        className="min-h-[60vh]"
        label="Bestätigung wird verarbeitet"
        message="Bestätigung wird verarbeitet …"
      />
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-serif font-bold mb-3">Du bist dabei!</h1>
          <p className="text-muted-foreground mb-8">
            Deine Anmeldung für den germring.de-Newsletter ist bestätigt.<br />
            Jeden Mittwoch: FFB-Energie-Zahlen und Kommunalbeschlüsse, sachlich eingeordnet.
          </p>
          <Link href="/">
            <Button size="lg">Zur Startseite</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">😕</div>
        <h1 className="text-3xl font-serif font-bold mb-3">Link ungültig</h1>
        <p className="text-muted-foreground mb-8">
          Dieser Bestätigungs-Link ist abgelaufen oder ungültig.<br />
          Melde dich einfach neu an — es dauert nur 10 Sekunden.
        </p>
        <Link href="/newsletter">
          <Button size="lg">Neu anmelden</Button>
        </Link>
      </div>
    </div>
  );
}
