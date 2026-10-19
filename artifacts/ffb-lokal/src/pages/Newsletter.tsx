import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewsletterArchive } from "@/components/newsletter/NewsletterArchive";
import {
  trackNewsletterResendOutcome,
  trackNewsletterSignupOutcome,
} from "@/lib/analytics";

const blocks = [
  {
    num: "01",
    icon: "✉️",
    title: "Intro",
    desc: "2–3 Sätze mit den wichtigsten Themen der Woche aus dem Landkreis FFB.",
  },
  {
    num: "02",
    icon: "⚡",
    title: "Energie & Erneuerbare",
    desc: "1–2 Beiträge zu aktuellen Projekten, Ausbau-Zahlen und Förderprogrammen.",
  },
  {
    num: "03",
    icon: "🏛️",
    title: "Beschlüsse & Einordnung",
    desc: "1–2 Kommunalpolitische Beschlüsse — kurz zusammengefasst, klar eingeordnet.",
  },
  {
    num: "04",
    icon: "📊",
    title: "Zahlen & Daten",
    desc: "Eine Zahl oder Grafik, die diese Woche die wichtigste regionale Entwicklung zeigt.",
  },
  {
    num: "05",
    icon: "🌱",
    title: "Praxis & Zukunft",
    desc: "1 Praxis-Tipp oder Zukunftsperspektive — mit konkretem Handlungsschritt.",
  },
  {
    num: "06",
    icon: "🔭",
    title: "Ausblick",
    desc: "2–3 Sätze: Was kommt nächste Woche? Worauf sollte man achten?",
  },
  {
    num: "07",
    icon: "📬",
    title: "Abonnement-Box",
    desc: "Nur Fakten, ohne Parolen. Für alle, die den Newsletter noch nicht kennen.",
  },
];

type State = "idle" | "loading" | "success" | "error";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    let outcomeTracked = false;
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, location: "newsletter" }),
      });
      const accepted = res.status === 202;
      trackNewsletterSignupOutcome("newsletter", accepted ? "accepted" : "failed");
      outcomeTracked = true;
      if (accepted) {
        setState("success");
      } else {
        const data = await res.json() as { error?: string };
        setErrorMsg(data.error ?? "Unbekannter Fehler.");
        setState("error");
      }
    } catch {
      if (!outcomeTracked) {
        trackNewsletterSignupOutcome("newsletter", "failed");
      }
      setErrorMsg("Netzwerkfehler — bitte versuch es erneut.");
      setState("error");
    }
  }

  async function handleResend() {
    if (!email || resending) return;
    setResending(true);
    setResendError("");
    try {
      const res = await fetch("/api/newsletter/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      trackNewsletterResendOutcome(
        "newsletter",
        res.status === 202 ? "accepted" : "failed",
      );
      if (res.status !== 202) {
        setResendError("Die Anfrage konnte nicht abgeschlossen werden. Bitte versuch es später erneut.");
      }
    } catch {
      trackNewsletterResendOutcome("newsletter", "failed");
      setResendError("Netzwerkfehler — bitte versuch es später erneut.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-primary text-primary-foreground py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 0%, transparent 60%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)",
          }}
        />
        <div className="relative container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Jeden Mittwoch
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-5">
            Fakten vor Meinung,<br /><span className="whitespace-nowrap">ohne Parolen.</span>
          </h1>
          <p className="text-xl text-primary-foreground/80 font-light max-w-xl mx-auto">
            Die wichtigsten FFB-Energie-Zahlen und Beschlüsse — sachlich eingeordnet, direkt in dein Postfach.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-3xl py-14">

        {/* Anmelde-Box */}
        {state !== "success" ? (
          <div className="bg-card border shadow-sm rounded-2xl p-8 md:p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 text-2xl">
              📬
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">Jetzt abonnieren</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
              Sachliche Einordnung, regionale Zahlen, keine Empörung.<br />
              Jederzeit kündbar. DSGVO-konform.
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              data-testid="form-newsletter"
            >
              <Input
                type="email"
                placeholder="Deine E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={state === "loading"}
                className="h-12"
                data-testid="input-email"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 shrink-0"
                disabled={state === "loading"}
                data-testid="button-subscribe"
              >
                {state === "loading" ? "Wird gesendet…" : "Abonnieren"}
              </Button>
            </form>
            {state === "error" && (
              <p className="text-sm text-destructive mt-4">{errorMsg}</p>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Du erhältst eine Bestätigungs-E-Mail. Kein Abo ohne Klick.
            </p>
          </div>
        ) : (
          <div
            className="bg-card border shadow-sm rounded-2xl p-12 text-center"
            data-testid="success-newsletter"
            aria-live="polite"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ✉️
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3">Bitte Postfach prüfen</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Wenn eine Anmeldung möglich ist, erhältst du in Kürze eine E-Mail mit weiteren Informationen.
              Bitte prüfe auch deinen Spam-Ordner.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => void handleResend()}
              disabled={resending}
              data-testid="button-resend-confirmation"
            >
              {resending ? "Wird angefordert…" : "Keine E-Mail erhalten? Erneut anfordern"}
            </Button>
            {resendError && (
              <p className="text-sm text-destructive mt-4" role="alert">{resendError}</p>
            )}
          </div>
        )}

        {/* 7-Block-Format */}
        <div className="mt-16">
          <h2 className="text-2xl font-serif font-bold mb-2">Was dich erwartet</h2>
          <p className="text-muted-foreground mb-8 text-sm">
            Jede Ausgabe folgt demselben 7-Block-Format — damit du sofort weißt, was dich erwartet.
          </p>
          <div className="grid gap-3">
            {blocks.map((block, i) => (
              <div
                key={block.num}
                className="flex gap-4 items-start bg-card border rounded-xl px-5 py-4 hover:shadow-sm transition-shadow"
                data-testid={`block-newsletter-${block.num}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="text-2xl mt-0.5 shrink-0">{block.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-mono text-xs text-muted-foreground/50">{block.num}</span>
                    <h3 className="font-semibold text-sm">{block.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{block.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <NewsletterArchive />

        {/* Trust-Signale */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: "🔒", label: "DSGVO-konform", sub: "Daten nur in DE" },
            { icon: "📅", label: "1× pro Woche", sub: "Jeden Mittwoch" },
            { icon: "🚫", label: "Kein Spam", sub: "Jederzeit kündbar" },
          ].map((t) => (
            <div key={t.label} className="bg-card border rounded-xl p-4">
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="font-semibold text-sm">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
