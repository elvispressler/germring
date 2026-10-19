import { Router } from "express";
import { requireAdminPin } from "../middleware/adminAuth.js";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { GenerateArtikelBody } from "@workspace/api-zod";

const router = Router();

const CATEGORY_NAMES: Record<number, string> = {
  1: "Energie & Erneuerbare",
  2: "Kommunalpolitik",
  3: "Zahlen & Daten",
  4: "Praxis & Zukunft",
};

function buildPrompt(categoryId: number, title: string, fields: Record<string, string>): string {
  const cat = CATEGORY_NAMES[categoryId] || "Allgemein";

  const fieldLines = Object.entries(fields)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const templateHints: Record<number, string> = {
    1: `Struktur: Kurze Einleitung (1 Satz), dann Ort/Status/Daten als strukturierte Zeilen, dann 2–3 Absätze Fließtext (sachlich, lokal, faktenbezogen), abschließend eine klar formulierte Einordnung für Bürger. Kein Clickbait, kein Empörungsframing. Tone of Voice: ruhig, präzise, wie ein seriöses Lokalmedium.`,
    2: `Struktur: Datum/Institution/Beschluss als strukturierte Zeilen, dann 2 Absätze Fließtext (was wurde entschieden, wie lief die Abstimmung), abschließend Einordnung (was bedeutet das für Bürger, Energie, Infrastruktur). Sachlich, keine Wertung jenseits der Fakten.`,
    3: `Struktur: 3 Kennzahlen als formatierte Zeilen, dann kurze Einordnung in Prosaform (2–3 Absätze), abschließend Bedeutung für die Energiewende im Landkreis. Zahlen immer mit Quelle oder Zeitraum.`,
    4: `Struktur: Einleitung (Thema und warum es relevant ist), dann 3 Szenarien oder Optionen (nummeriert), abschließend ein konkreter Handlungsschritt und ein Zukunftsaspekt. Praxisorientiert, für Hauseigentümer und Bürger verständlich.`,
  };

  return `Du schreibst für germring.de — ein faktenbasiertes Lokalmedium für Erneuerbare Energien und Kommunalpolitik im Landkreis Fürstenfeldbruck (Bayern). Ton: sachlich, ruhig, kein Clickbait, kein Empörungsframing. Anrede in Artikeln: neutral (keine direkte Lesereranrede außer in Praxis-Artikeln). Sprache: Deutsch (de_DE).

Rubrik: ${cat}
Titel: ${title}

Template-Felder (ausgefüllt vom Redakteur):
${fieldLines}

${templateHints[categoryId] || ""}

Aufgabe: Schreibe den vollständigen Artikeltext auf Basis der Template-Felder. Der Text soll:
- Die Template-Felder inhaltlich aufnehmen und zu einem kohärenten, lesbaren Artikel ausbauen
- Zwischen 250 und 450 Wörter lang sein
- Mit strukturierten Zeilen beginnen (Ort/Status/Daten oder Datum/Institution/Beschluss, je nach Rubrik), dann in Fließtext übergehen
- Keine Überschriften oder Markdown-Formatierung enthalten — nur Klartext mit Absätzen (Leerzeile zwischen Absätzen)
- Keine Quellenangaben erfinden, nur was in den Template-Feldern steht verwenden

Gib nur den Artikeltext aus — keine Erläuterungen, keine Metadaten, kein "Hier ist der Artikel:".`;
}

router.post("/generate/artikel", requireAdminPin, async (req, res) => {
  const parse = GenerateArtikelBody.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.message });
  }

  const { categoryId, title, fields } = parse.data;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: buildPrompt(categoryId, title, fields),
        },
      ],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  } catch (err) {
    req.log.error({ err }, "AI generation failed");
    res.write(`data: ${JSON.stringify({ error: "Generierung fehlgeschlagen" })}\n\n`);
    return res.end();
  }
});

export default router;
