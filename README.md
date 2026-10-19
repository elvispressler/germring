# germring.de — FFB Energie & Zukunft

Vollständiger aktueller Quellcode des lokalen Nachrichtenprojekts für den Landkreis Fürstenfeldbruck.

## Projektstruktur

- `artifacts/ffb-lokal/`: öffentliche Website und Redaktionsoberfläche (React, Vite), einschließlich des Produktionsservers.
- `artifacts/api-server/`: Backend, Artikel- und Newslettergenerierung, Newsletterarchiv, Linkprüfung und zeitgesteuerte Abläufe.
- `artifacts/mockup-sandbox/`: Komponenten- und Designvorschauen.
- `lib/`: gemeinsame Datenbankmodelle, API-Verträge, generierter API-Client und weitere gemeinsame Pakete.
- `scripts/`: Hilfsprogramme und Validierungen.
- `deliverables/`: Logoquellen, Schriftlizenz und Logoexporte.
- `.replit` und die jeweiligen `.replit-artifact/`-Verzeichnisse: vorhandene Replit-Projekt- und Servicekonfiguration.

## Installation und Prüfungen

Voraussetzungen: Node.js 24 und pnpm 10.

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm --filter @workspace/api-server run test
pnpm --filter @workspace/ffb-lokal run test
BASE_PATH=/ PORT=23013 pnpm run build
```

## Betrieb und Konfiguration

Die benötigten Umgebungsvariablen und Zugangsdaten müssen in der jeweiligen Laufzeitumgebung sicher eingerichtet werden. Dieses Repository enthält keine tatsächlichen Schlüssel oder Passwörter.

Zu den verwendeten Einstellungen gehören:

- `DATABASE_URL`: PostgreSQL-Datenbank.
- `GERMRING_ADMIN_PASSWORD`: Administratorzugang; `ADMIN_PIN` ist die ältere Alternative.
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` und `AI_INTEGRATIONS_ANTHROPIC_API_KEY`: KI-Anbindung.
- `RESEND_API_KEY`: E-Mail-Versand.
- Die verwendete Object-Storage-Konfiguration, unter anderem `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR` und `DEFAULT_OBJECT_STORAGE_BUCKET_ID`.
- `PORT` pro Dienst und `BASE_PATH` für die Website.

Die vorhandenen Replit-Services verwenden Port 8080 für das Backend und Port 23013 für die Website. Außerhalb von Replit müssen insbesondere die Weiterleitung von `/api` zum Backend, die Speicheranbindung und die KI-Anbindung entsprechend eingerichtet werden. Die mitgelieferten Konfigurationen ersetzen diese Dienste nicht.

Das Datenbankschema liegt in `lib/db/`. Für eine dafür vorgesehene Datenbank kann es mit `pnpm --filter @workspace/db run push` angewendet werden. Schemaänderungen an einer bestehenden Produktionsdatenbank müssen vorher geprüft werden.

## Umfang dieses Imports

Dies ist ein bereinigter Quellcodeimport des aktuellen Projektstands, nicht der Export der internen Replit-Checkpoint-Historie.

Enthalten sind der Anwendungscode, Tests, Konfigurationen, Paketdefinitionen und Lockdatei, öffentliche Web-Assets, Logoquellen sowie die bereits aufbereiteten öffentlichen Newsletter-Ausgaben.

Nicht enthalten sind:

- Passwörter, API-Schlüssel und tatsächliche Umgebungsvariablenwerte.
- Interne Agenten-Arbeitsdateien und ursprüngliche Uploads, insbesondere Originalmails mit möglichen Empfängerdaten.
- `node_modules`, temporäre Dateien und kompilierte Build-Ausgaben.
- Datenbankinhalte, Abonnentendaten sowie im Object Storage abgelegte Dateien.

Für ein vollständiges Betriebsbackup sind Datenbank und Object Storage daher separat und geschützt zu sichern.
