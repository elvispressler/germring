import { useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";

const FORMATS = [
  {
    name: "Native Partner-Box",
    desc: "Am Ende jedes Artikels — kontextuell passend zur Rubrik. Dein Name, Tagline und Link. Klar als Partner gekennzeichnet, nie als redaktioneller Inhalt getarnt.",
    ideal: "Energieberater, Installateure, lokale Dienstleister",
    placement: "Artikelende, rubrikspezifisch buchbar",
  },
  {
    name: "Rubrik-Partnerschaft",
    desc: "Dein Unternehmen ist exklusiver Partner einer ganzen Rubrik — z. B. »Praxis & Zukunft« oder »Energie & Erneuerbare«. Höchste thematische Relevanz.",
    ideal: "Hersteller, regionale Energieversorger, Verbände",
    placement: "Alle Artikel einer Rubrik",
  },
];

const WHYFITS = [
  {
    icon: "🎯",
    title: "Hochrelevante Zielgruppe",
    text: "Leserinnen und Leser, die sich aktiv mit Energiewende, Förderungen und kommunaler Politik beschäftigen — und Entscheidungen treffen.",
  },
  {
    icon: "📰",
    title: "Redaktioneller Kontext",
    text: "Deine Präsenz steht neben sachlichem, vertrauenswürdigem Journalismus — kein Banner-Lärm, kein Clickbait-Umfeld.",
  },
  {
    icon: "🏘️",
    title: "Lokal & relevant",
    text: "Wir berichten ausschließlich über den Landkreis Fürstenfeldbruck. Kein Streuverlust — nur Menschen aus der Region.",
  },
  {
    icon: "🔍",
    title: "Volle Transparenz",
    text: "Jede Partnerschaft ist klar als solche gekennzeichnet. Keine versteckten Advertorials. Das stärkt das Vertrauen in dich genauso wie in uns.",
  },
  {
    icon: "📵",
    title: "Kein Tracking, kein Retargeting",
    text: "Wir verwenden keine Werbenetzwerke, keine Cookies für Werbezwecke. Was du siehst, ist was du buchst.",
  },
  {
    icon: "🤝",
    title: "Direkte Zusammenarbeit",
    text: "Kein Mittelsmann, keine Agentur. Du sprichst direkt mit der Redaktion — kurze Wege, schnelle Umsetzung.",
  },
];

const FITS = [
  "Solarinstallateure und Photovoltaik-Betriebe im Landkreis FFB",
  "Energieberater und Sanierungsplaner",
  "Wärmepumpen- und Heizungsbauer",
  "Lokale Banken und Sparkassen (BEG-Förderberatung)",
  "Stadtwerke und regionale Energieversorger",
  "Architektur- und Ingenieurbüros",
  "E-Mobilitätsanbieter und Ladeinfrastruktur",
  "Gemeinden und kommunale Einrichtungen",
];

const RUBRIKEN = [
  "Energie & Erneuerbare",
  "Kommunalpolitik",
  "Zahlen & Daten",
  "Praxis & Zukunft",
  "Alle Rubriken (Gesamtpartnerschaft)",
];

function KontaktFormular() {
  const [form, setForm] = useState({ firma: "", name: "", email: "", rubrik: "", nachricht: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
        setErrorMsg(data.error ?? "Unbekannter Fehler.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Verbindungsfehler. Bitte versuche es erneut.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-serif font-bold mb-2">Nachricht eingegangen!</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Danke für deine Anfrage. Wir melden uns innerhalb von 48 Stunden mit einem konkreten Angebot.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-8 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Firma <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.firma}
            onChange={(e) => update("firma", e.target.value)}
            placeholder="Muster GmbH"
            className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Ansprechpartner <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Vorname Nachname"
            className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            E-Mail-Adresse <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="max@beispiel.de"
            className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Gewünschte Rubrik <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <select
            value={form.rubrik}
            onChange={(e) => update("rubrik", e.target.value)}
            className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-foreground"
          >
            <option value="">Bitte wählen …</option>
            {RUBRIKEN.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Nachricht <span className="text-destructive">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={form.nachricht}
          onChange={(e) => update("nachricht", e.target.value)}
          placeholder="Kurze Beschreibung deines Unternehmens und was du dir von einer Partnerschaft erhoffst …"
          className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}

      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Deine Daten werden ausschließlich zur Bearbeitung dieser Anfrage verwendet — kein Newsletter, kein CRM.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {status === "sending" ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              Senden …
            </>
          ) : (
            <>
              Anfrage senden
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function PartnerPage() {
  usePageMeta({
    title: "Partner werden — germring.de",
    description: "Erreiche die Menschen, die Energiewende im Landkreis FFB gestalten. Native Sponsoring ohne Tracking, ohne Clickbait-Umfeld.",
    path: "/partner",
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-background via-muted/20 to-background py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-5">
            Partnerschaft & Sponsoring
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
            Erreiche die Menschen,<br />
            die Energiewende gestalten
          </h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-10">
            germring.de ist das faktenbasierte Lokalmedium für Erneuerbare Energien, Kommunalpolitik und die Zukunft des Landkreises Fürstenfeldbruck. Unsere Leserschaft trifft Entscheidungen — und sucht Orientierung.
          </p>
          <a
            href="#kontakt"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Gespräch anfragen
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          <p className="text-xs text-muted-foreground mt-4">
            Formular unten · Antwort innerhalb von 48 Stunden
          </p>
        </div>
      </section>

      {/* Warum es passt */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-serif font-bold mb-2 text-center">Warum es passt</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Native Sponsoring auf germring.de ist das Gegenteil von klassischer Online-Werbung.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHYFITS.map((w) => (
              <div key={w.title} className="rounded-xl border bg-card p-6">
                <div className="text-2xl mb-3">{w.icon}</div>
                <h3 className="font-semibold mb-2">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formate */}
      <section className="py-20 px-4 bg-muted/20 border-y">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-serif font-bold mb-2 text-center">Buchbare Formate</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Kein Banner, kein Pop-up. Nur kontextuell sinnvolle Präsenz.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FORMATS.map((f) => (
              <div key={f.name} className="rounded-xl border bg-card p-8">
                <h3 className="font-serif font-bold text-xl mb-3">{f.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{f.desc}</p>
                <div className="space-y-2">
                  <div className="flex gap-2 text-xs">
                    <span className="font-semibold text-foreground/70 shrink-0">Ideal für:</span>
                    <span className="text-muted-foreground">{f.ideal}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="font-semibold text-foreground/70 shrink-0">Platzierung:</span>
                    <span className="text-muted-foreground">{f.placement}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live-Vorschau der Sponsor-Box */}
          <div className="mt-12">
            <p className="text-sm font-semibold text-center text-muted-foreground mb-6 uppercase tracking-wider text-xs">
              So sieht eine Native Partner-Box aus
            </p>
            <div className="max-w-2xl mx-auto border rounded-xl p-6 bg-card flex flex-col sm:flex-row gap-5 items-start">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-lg">S</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Anzeige / Partner
                </p>
                <p className="font-semibold text-sm mb-1">Mustermann Solar GmbH</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ihre PV-Anlage im Landkreis FFB — von der Beratung bis zur Inbetriebnahme. Über 500 Anlagen installiert.
                </p>
              </div>
              <a className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-primary whitespace-nowrap mt-1">
                Mehr erfahren
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Wer passt */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-serif font-bold mb-2 text-center">Wer gut passt</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Wir arbeiten ausschließlich mit Unternehmen und Organisationen zusammen, die thematisch zu unserer Berichterstattung passen.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FITS.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Kontaktformular */}
      <section className="py-20 px-4 border-t bg-muted/20" id="kontakt">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-serif font-bold mb-3">Interesse? Meld dich.</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kurze Anfrage genügt — wir melden uns innerhalb von 48 Stunden mit einem konkreten Angebot.
            </p>
          </div>
          <KontaktFormular />
          <p className="text-xs text-muted-foreground text-center mt-6">
            Redaktionelle Unabhängigkeit ist nicht verhandelbar — das gilt für alle Partnerschaften. &nbsp;·&nbsp;
            <a href="mailto:partner@germring.de" className="hover:underline">partner@germring.de</a>
          </p>
        </div>
      </section>
    </div>
  );
}
