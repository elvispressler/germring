import { usePageMeta } from "@/hooks/usePageMeta";

export function DatenschutzPage() {
  usePageMeta({
    title: "Datenschutz",
    description: "Datenschutzerklärung von germring.de gemäß DSGVO.",
    path: "/datenschutz",
  });

  return (
    <div className="container mx-auto px-4 lg:px-8 max-w-2xl py-12">
      <h1 className="text-3xl font-serif font-bold text-forest-900 mb-2">Datenschutzerklärung</h1>
      <p className="text-sm text-forest-400 mb-10">Gemäß DSGVO, BDSG und TMG</p>

      {/* Verantwortlicher */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Verantwortliche Stelle
        </h2>
        <p className="text-forest-700 leading-relaxed">
          Redaktion germring.de<br />
          Landkreis Fürstenfeldbruck, Bayern<br />
          E-Mail:{" "}
          <a
            href="mailto:datenschutz@germring.de"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            datenschutz@germring.de
          </a>
        </p>
      </section>

      {/* Grundsätzliches */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Grundsätze der Datenverarbeitung
        </h2>
        <p className="text-forest-600 text-sm leading-relaxed">
          Der Schutz Ihrer persönlichen Daten ist uns wichtig. Wir erheben, verarbeiten
          und nutzen Ihre personenbezogenen Daten ausschließlich auf Basis der
          einschlägigen Datenschutzgesetze (DSGVO, BDSG). Diese Seite verwendet{" "}
          <strong>kein Tracking, kein Analytics, keine Drittanbieter-Werbung und keine
          Cookies</strong> über funktionale Notwendigkeit hinaus.
        </p>
      </section>

      {/* Server-Logs */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Server-Protokolldaten
        </h2>
        <p className="text-forest-600 text-sm leading-relaxed mb-3">
          Beim Abruf dieser Website werden durch den Hosting-Anbieter automatisch
          Protokolldaten erfasst, die Ihr Browser übermittelt. Dies sind:
        </p>
        <ul className="text-forest-600 text-sm leading-relaxed space-y-1 list-disc list-inside mb-3">
          <li>IP-Adresse (anonymisiert nach 24 Stunden)</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>Aufgerufene Seite / Datei</li>
          <li>Übertragene Datenmenge</li>
          <li>Browsertyp und -version (User-Agent)</li>
          <li>Referrer-URL (Seite, von der Sie gekommen sind)</li>
        </ul>
        <p className="text-forest-600 text-sm leading-relaxed">
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an
          Betriebssicherheit). Die Daten werden ausschließlich zur Gewährleistung des
          sicheren und stabilen Betriebs verwendet und nach 7 Tagen gelöscht.
        </p>
      </section>

      {/* Newsletter */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Newsletter (E-Mail-Abonnement)
        </h2>
        <p className="text-forest-600 text-sm leading-relaxed mb-3">
          Wenn Sie unseren Newsletter abonnieren, verarbeiten wir ausschließlich Ihre
          E-Mail-Adresse. Der Versand erfolgt über{" "}
          <a
            href="https://resend.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            Resend
          </a>{" "}
          (Resend Inc., USA). Wir haben einen Auftragsverarbeitungsvertrag gemäß Art. 28
          DSGVO abgeschlossen. Es gilt das sog. Double-Opt-In-Verfahren: Sie erhalten
          nach der Anmeldung eine Bestätigungsmail.
        </p>
        <ul className="text-forest-600 text-sm leading-relaxed space-y-1 list-disc list-inside mb-3">
          <li>Gespeicherte Daten: E-Mail-Adresse, Zeitpunkt der Bestätigung</li>
          <li>Zweck: Versand des wöchentlichen Newsletters</li>
          <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
          <li>Löschung: nach Abmeldung oder auf Anfrage</li>
        </ul>
        <p className="text-forest-600 text-sm leading-relaxed">
          Sie können das Abonnement jederzeit per E-Mail an{" "}
          <a
            href="mailto:datenschutz@germring.de"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            datenschutz@germring.de
          </a>{" "}
          kündigen.
        </p>
      </section>

      {/* Externe Inhalte */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Externe Inhalte
        </h2>

        <h3 className="text-sm font-semibold text-forest-700 mb-1">Unsplash (Bilder)</h3>
        <p className="text-forest-600 text-sm leading-relaxed mb-4">
          Artikelbilder werden über das CDN von Unsplash (Unsplash Inc., Kanada)
          eingebunden. Dabei wird Ihre IP-Adresse an die Unsplash-Server übertragen.
          Wir haben keinen Einfluss auf die Datenverarbeitung durch Unsplash. Weitere
          Informationen:{" "}
          <a
            href="https://unsplash.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            unsplash.com/privacy
          </a>
        </p>

        <h3 className="text-sm font-semibold text-forest-700 mb-1">
          PVGIS / Europäische Kommission (Solarrechner)
        </h3>
        <p className="text-forest-600 text-sm leading-relaxed">
          Der PV-Rechner nutzt die öffentliche API der Europäischen Kommission (PVGIS).
          Dabei werden Standortkoordinaten und technische Parameter übermittelt. Es
          werden keine personenbezogenen Daten gespeichert.
        </p>
      </section>

      {/* Ihre Rechte */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Ihre Rechte (Art. 15–22 DSGVO)
        </h2>
        <p className="text-forest-600 text-sm leading-relaxed mb-3">
          Sie haben jederzeit folgende Rechte:
        </p>
        <ul className="text-forest-600 text-sm leading-relaxed space-y-1 list-disc list-inside mb-3">
          <li><strong>Auskunft</strong> über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
          <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
          <li><strong>Löschung</strong> Ihrer Daten (Art. 17 DSGVO)</li>
          <li><strong>Einschränkung</strong> der Verarbeitung (Art. 18 DSGVO)</li>
          <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
          <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)</li>
          <li><strong>Widerruf</strong> einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
        </ul>
        <p className="text-forest-600 text-sm leading-relaxed">
          Anfragen richten Sie bitte an:{" "}
          <a
            href="mailto:datenschutz@germring.de"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            datenschutz@germring.de
          </a>
          . Sie haben außerdem das Recht, sich bei der zuständigen Aufsichtsbehörde zu
          beschweren: Bayerisches Landesamt für Datenschutzaufsicht (BayLDA),{" "}
          <a
            href="https://www.lda.bayern.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            www.lda.bayern.de
          </a>
        </p>
      </section>

      {/* Keine Cookies */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-forest-800 uppercase tracking-wide mb-3">
          Cookies
        </h2>
        <p className="text-forest-600 text-sm leading-relaxed">
          Diese Website verwendet keine Tracking-Cookies und kein Analytics. Es werden
          ausschließlich technisch notwendige Sitzungsdaten im Browser des Nutzers
          verarbeitet (z. B. Newsletter-Bestätigungsstatus). Es ist kein Cookie-Banner
          erforderlich.
        </p>
      </section>

      <p className="text-xs text-forest-300 mt-10 pt-6 border-t border-forest-100">
        Stand: August 2026
      </p>
    </div>
  );
}
