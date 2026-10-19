import { usePageMeta } from "@/hooks/usePageMeta";

export function ImpressumPage() {
  usePageMeta({
    title: "Impressum",
    description: "Impressum und Anbieterkennzeichnung von germring.de — FFB Energie & Zukunft.",
    path: "/impressum",
  });

  return (
    <div className="container mx-auto px-4 lg:px-8 max-w-2xl py-12">
      <h1 className="text-3xl font-serif font-bold text-forest-900 mb-2">Impressum</h1>
      <p className="text-sm text-forest-400 mb-10">Anbieterkennzeichnung gemäß §5 TMG und §18 Abs. 2 MStV</p>

      {/* Herausgeber */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">Herausgeber</h2>
        <p className="text-forest-700 leading-relaxed">
          germring.de — FFB Energie &amp; Zukunft<br />
          Redaktion germring.de<br />
          Landkreis Fürstenfeldbruck, Bayern
        </p>
      </section>

      {/* Kontakt */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">Kontakt</h2>
        <p className="text-forest-700 leading-relaxed">
          E-Mail:{" "}
          <a
            href="mailto:redaktion@germring.de"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            redaktion@germring.de
          </a>
        </p>
      </section>

      {/* V.i.S.d.P. */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Verantwortlich im Sinne des Presserechts
        </h2>
        <p className="text-forest-700 leading-relaxed mb-3">
          Redaktion germring.de<br />
          Landkreis Fürstenfeldbruck, Bayern
        </p>
        <div className="bg-forest-50 border border-forest-100 rounded-xl px-5 py-4 text-sm text-forest-600 leading-relaxed">
          <p className="font-medium text-forest-700 mb-1">Pseudonymvermerk</p>
          <p>
            Die Redaktion betreibt dieses Angebot unter einem Pseudonym gemäß{" "}
            <strong>§ 9 Abs. 1 BayPrG</strong> (Bayerisches Pressegesetz). Der vollständige
            Name der verantwortlichen Person ist der{" "}
            <strong>Bayerischen Landeszentrale für neue Medien (BLM)</strong> bekannt und
            kann auf Verlangen berechtigter Stellen offengelegt werden.
          </p>
        </div>
      </section>

      {/* Redaktionelle Leitlinien */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Redaktionelle Leitlinien
        </h2>
        <p className="text-forest-700 leading-relaxed">
          germring.de ist ein unabhängiges, faktenbasiertes Lokalmedium für Erneuerbare
          Energien, Kommunalpolitik und Zukunftsthemen im Landkreis Fürstenfeldbruck.
          Das Angebot finanziert sich ausschließlich über Native Sponsoring (klar
          gekennzeichnete Partner-Boxen). Redaktionelle Inhalte werden nicht von
          Werbepartnern beeinflusst. Kein Clickbait, keine Parolen — Fakten vor Meinung.
        </p>
      </section>

      {/* Haftungsausschluss */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Haftungsausschluss
        </h2>

        <h3 className="text-sm font-semibold text-forest-700 mb-2">Inhalt</h3>
        <p className="text-forest-600 text-sm leading-relaxed mb-4">
          Die Inhalte dieses Angebots wurden mit größtmöglicher Sorgfalt erstellt. Für
          die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernimmt die
          Redaktion keine Gewähr. Als Diensteanbieter sind wir gemäß §7 Abs. 1 TMG für
          eigene Inhalte nach den allgemeinen Gesetzen verantwortlich.
        </p>

        <h3 className="text-sm font-semibold text-forest-700 mb-2">Externe Links</h3>
        <p className="text-forest-600 text-sm leading-relaxed mb-4">
          Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte
          wir keinen Einfluss haben. Für die Inhalte verlinkter Seiten ist stets der
          jeweilige Anbieter verantwortlich. Bei Bekanntwerden von Rechtsverletzungen
          werden entsprechende Links umgehend entfernt.
        </p>

        <h3 className="text-sm font-semibold text-forest-700 mb-2">Bilder</h3>
        <p className="text-forest-600 text-sm leading-relaxed">
          Bilder werden über das Unsplash-CDN eingebunden (
          <a
            href="https://unsplash.com/license"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            Unsplash-Lizenz
          </a>
          ). Die Urheberrechte liegen bei den jeweiligen Fotografen.
        </p>
      </section>

      {/* Urheberrecht */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Urheberrecht
        </h2>
        <p className="text-forest-600 text-sm leading-relaxed">
          Die durch die Redaktion erstellten Inhalte und Werke auf diesen Seiten
          unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
          Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
          Urheberrechts bedürfen der schriftlichen Zustimmung der Redaktion. Downloads
          und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen
          Gebrauch gestattet.
        </p>
      </section>

      {/* Streitbeilegung */}
      <section className="mb-2">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Streitbeilegung
        </h2>
        <p className="text-forest-600 text-sm leading-relaxed mb-2">
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung
          (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            ec.europa.eu/consumers/odr
          </a>
        </p>
        <p className="text-forest-600 text-sm leading-relaxed">
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor
          einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <p className="text-xs text-forest-300 mt-10 pt-6 border-t border-forest-100">
        Stand: August 2026
      </p>
    </div>
  );
}
