# germring.de — GR „Ruhiger Rhythmus“

Produktionsdateien auf Basis der Zeichenstudie 3B.1. Die bisherige Website-Grafik bleibt unverändert; dieses Paket ist für die spätere Verwendung vorbereitet.

## Dateien im Ordner `export`

- `zeichen-dunkel.svg`, `zeichen-weiss.svg`, `zeichen-schwarz.svg`: freigestelltes GR-Zeichen als reine Vektorpfade, einfarbig.
- `wort-bild-dunkel.svg`, `wort-bild-weiss.svg`: GR mit „germring.de“ und Unterzeile. Die Schrift ist in Vektorpfade umgewandelt; es ist keine Schriftinstallation nötig.
- `favicon.svg` / `favicon.ico` / `favicon-{16,32,48,180,512}.png`: quadratisches Icon mit dem G aus der 3B.1-Zeichnung. Das G statt der kompletten breiten GR-Form schützt die Lesbarkeit bei 16 Pixeln.
- `zeichen-dunkel-{512,1024}.png`, `wort-bild-dunkel-{660,1320}.png`: freigestellte PNGs, die Zahl bezeichnet die Breite in Pixeln.

## Anwendung

- **Farbe:** Waldgrün `#263E38` auf hellem Hintergrund; Weiß `#FFFFFF` auf dunklem Hintergrund. Die SVGs haben keinen Hintergrund.
- **Schutzraum:** rundum mindestens die halbe Höhe des G-Bogens freilassen.
- **Mindestgrößen:** vollständiges GR-Zeichen ab 48 px Breite; Wort-Bild-Marke mit Unterzeile ab 330 px Breite. Darunter das Zeichen ohne Unterzeile nutzen; für 16–32 px das quadratische G-Icon.
- **Nicht** strecken, die Kontur nachzeichnen oder die SVGs in einen anderen Farbton umfärben, ohne den Kontrast erneut zu prüfen.
- Die Unterzeile lautet „FÜRSTENFELDBRUCK · ENERGIE & ZUKUNFT“. Sie ist Teil der großen Wort-Bild-Marke, nicht des Favicons.

Das Zeichen ist visuell von der vorhandenen Studie übernommen; die überflüssigen, deckungsgleich zurücklaufenden Pfadabschnitte wurden entfernt. Alle ausgelieferten SVGs funktionieren ohne externe Ressourcen. Schriftquelle: DM Sans, SIL Open Font License 1.1 (siehe `source/OFL.txt`). Erneuter Export: `node build.mjs` (benötigt Chromium, `pdftocairo` und ImageMagick).