import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db, articlesTable, categoriesTable, newsletterIssuesTable, newsletterSubscribersTable } from "@workspace/db";
import { and, desc, eq, gte, inArray, like, count, sql } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { sendNewsletterEmail } from "../lib/resend.js";
import { requireAdminPin } from "../middleware/adminAuth.js";
import { logger } from "../lib/logger.js";

const router = Router();
const NEWSLETTER_DOMAIN = "germring.de";
const NEWSLETTER_TIME_ZONE = "Europe/Berlin";
const AUTO_DRAFT_HOUR = 9;

function berlinDateParts(date = new Date()) {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: NEWSLETTER_TIME_ZONE,
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date).map(part => [part.type, part.value]),
  );
  return {
    weekday: values.weekday ?? "",
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

async function getLocalWeatherContext(): Promise<string> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude: "48.18",
      longitude: "11.25",
      daily: "weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max",
      forecast_days: "5",
      timezone: NEWSLETTER_TIME_ZONE,
    }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`Weather API returned HTTP ${response.status}`);
    const data = await response.json() as {
      daily?: {
        time?: string[];
        weather_code?: number[];
        temperature_2m_min?: number[];
        temperature_2m_max?: number[];
        precipitation_probability_max?: number[];
      };
    };
    const days = data.daily?.time ?? [];
    if (days.length === 0) throw new Error("Weather forecast is empty");
    return days.slice(0, 5).map((day, index) => {
      const min = data.daily?.temperature_2m_min?.[index];
      const max = data.daily?.temperature_2m_max?.[index];
      const rain = data.daily?.precipitation_probability_max?.[index];
      const weather = data.daily?.weather_code?.[index];
      const description = weather === 0 ? "klar"
        : weather === 1 ? "überwiegend klar"
        : weather === 2 ? "leicht bewölkt"
        : weather === 3 ? "bedeckt"
        : weather === 45 || weather === 48 ? "Nebel"
        : weather !== undefined && weather >= 51 && weather <= 67 ? "Niesel- oder Regen"
        : weather !== undefined && weather >= 71 && weather <= 77 ? "Schnee"
        : weather !== undefined && weather >= 80 && weather <= 82 ? "Regenschauer"
        : weather !== undefined && weather >= 95 ? "Gewitter"
        : "wechselhaft";
      return `${day}: ${description}, ${min ?? "?"}–${max ?? "?"} °C, Regenwahrscheinlichkeit ${rain ?? "?"} %`;
    }).join("\n");
  } catch {
    return "Keine verlässliche lokale Wetterprognose verfügbar; keine konkreten Wetterereignisse behaupten.";
  }
}

function buildNewsletterPrompt(
  articles: Array<{
    id: number;
    title: string;
    excerpt: string;
    content: string;
    categoryName: string;
    sources: Array<{ label: string; url?: string | null }>;
  }>,
  date = new Date(),
  weatherContext = "Keine Wetterprognose verfügbar.",
): string {
  const berlin = berlinDateParts(date);
  const localDate = new Date(Date.UTC(berlin.year, berlin.month - 1, berlin.day));
  const kw = getCalendarWeek(localDate);
  const month = new Intl.DateTimeFormat("de-DE", {
    month: "long",
    timeZone: NEWSLETTER_TIME_ZONE,
  }).format(date);
  const year = berlin.year;
  const articleBlocks = articles.length === 0
    ? "Keine neuen Artikel in den letzten sieben Tagen. Keine älteren Meldungen als aktuelle Nachrichten ausgeben; die Ausgabe auf eine kurze transparente Einordnung und den Tipp der Woche konzentrieren."
    : articles.map(article =>
    `Artikel-ID: ${article.id}\nRubrik: ${article.categoryName}\nTitel: ${article.title}\nTeaser: ${article.excerpt}\nInhalt (Anfang): ${article.content.slice(0, 400)}\nOriginalquellen: ${
      article.sources.length > 0
        ? article.sources.map(source => `${source.label}${source.url ? ` — ${source.url}` : ""}`).join("; ")
        : "(keine Originalquelle hinterlegt)"
    }`,
  ).join("\n\n---\n\n");

  return `Du schreibst den wöchentlichen germring.de Newsletter. Sprache: Deutsch (de_DE). Ton: sachlich, direkt, ohne Clickbait. KW ${kw}/${year}, ${month}.

Newsletter-Struktur:
1. Begrüßung (1–2 Sätze, informell und ohne Floskel)
2. Editorial (2–3 Sätze: Was war für den Landkreis FFB wichtig? Wenn keine neuen Artikel vorliegen, sage das knapp und leite zum Tipp über.)
3. Pro Artikel: Überschrift in GROSSBUCHSTABEN, 2–3 Sätze Zusammenfassung und danach die passende Marke [[ARTIKEL:ID]]. Wenn keine Artikel vorliegen, diesen Block weglassen.
4. ZAHL DER WOCHE: eine Kennzahl aus den Artikeln, mit kurzer Einordnung. Nie eine Zahl erfinden; wenn keine Kennzahl belegt ist, nenne stattdessen die Zahl der behandelten Artikel.
5. TIPP DER WOCHE: immer enthalten, deutlich mit dieser Überschrift. Ein konkreter, sicherer und sofort umsetzbarer Schritt für energiebewusste Hausbesitzer (2–3 Sätze). Passe ihn an Jahreszeit und, wenn sinnvoll, die Wetterprognose für Fürstenfeldbruck an. Bei Photovoltaik/Wind/Energieverbrauch gern praktische Erkenntnisse aus den Artikeln oder deren Quellen aufgreifen. Erfinde keine Community-Neuigkeiten, Förderregeln, Preise oder Wetterdetails. Wenn die Wetterprognose fehlt, nutze nur allgemeine saisonale Hinweise.
6. Abschluss (2 Sätze, sachlich und warm)
7. Signatur: germring.de Redaktion
- Direkte Zitate nur, wenn sie im Artikeltext oder den Originalquellen ausdrücklich belegt sind; direkt danach Quelle mit vollständiger URL angeben.
- Keine unbelegten Behauptungen. Links nur als [[ARTIKEL:ID]] aus der Artikelliste.

Lokale Wetterprognose für die nächsten Tage:
${weatherContext}

Artikel dieser Ausgabe:
${articleBlocks}

Antworte exakt in diesem Format, ohne Erklärungen, Markdown oder JSON:
===BETREFF===
germring.de | KW ${kw}: [Hauptthema max. 40 Zeichen]
===TEXT===
[Vollständiger Newsletter-Text, Absätze durch Leerzeile getrennt, kein HTML]`;
}

function getCalendarWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// GET /api/woche/status
router.get("/woche/status", async (req, res) => {
  try {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const recentArticles = await db
      .select({
        id: articlesTable.id,
        title: articlesTable.title,
        excerpt: articlesTable.excerpt,
        categoryId: articlesTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        publishedAt: articlesTable.publishedAt,
      })
      .from(articlesTable)
      .innerJoin(categoriesTable, eq(articlesTable.categoryId, categoriesTable.id))
      .where(gte(articlesTable.publishedAt, fourWeeksAgo))
      .orderBy(desc(articlesTable.publishedAt))
      .limit(20);

    const [subRow] = await db
      .select({ count: count() })
      .from(newsletterSubscribersTable)
      .where(eq(newsletterSubscribersTable.confirmed, true));

    const [latest] = await db
      .select({ publishedAt: articlesTable.publishedAt })
      .from(articlesTable)
      .orderBy(desc(articlesTable.publishedAt))
      .limit(1);

    res.json({
      recentArticles,
      subscriberCount: Number(subRow?.count ?? 0),
      lastPublishedAt: latest?.publishedAt ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Wochenstatus failed");
    res.status(500).json({ error: "Status konnte nicht geladen werden" });
  }
});

type GeneratedArticle = {
  rubrik: string;
  rubrikId: number;
  titel: string;
  slug: string;
  teaser: string;
  inhalt: string;
  tags: string[];
  sources: Array<{ label: string; url?: string }>;
  readingMinutes: number;
};

type ArticleCategory = {
  id: number;
  name: string;
};

const ARTICLE_CATEGORIES: ArticleCategory[] = [
  { id: 1, name: "Energie & Erneuerbare" },
  { id: 2, name: "Kommunalpolitik" },
  { id: 3, name: "Zahlen & Daten" },
  { id: 4, name: "Praxis & Zukunft" },
];

const ARTICLE_GENERATION_ATTEMPTS = 3;

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Ungültiges Feld "${field}"`);
  }
  return value.trim();
}

function parseSources(value: unknown): Array<{ label: string; url?: string }> {
  if (!Array.isArray(value)) return [];

  const sources: Array<{ label: string; url?: string }> = [];
  for (const source of value) {
    if (!isRecord(source)) continue;
    const label = typeof source.label === "string" ? source.label.trim().slice(0, 180) : "";
    if (!label) continue;
    const rawUrl = typeof source.url === "string" ? source.url.trim() : "";
    const url = /^https?:\/\/\S+$/i.test(rawUrl) ? rawUrl.slice(0, 500) : undefined;
    sources.push(url ? { label, url } : { label });
    if (sources.length === 8) break;
  }
  return sources;
}

function parseGeneratedArticle(
  raw: string,
  category: ArticleCategory,
  enforceWordCount = true,
): GeneratedArticle {
  const withoutFences = raw
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  const firstBrace = withoutFences.indexOf("{");
  const lastBrace = withoutFences.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) {
    throw new Error("Keine JSON-Antwort erhalten");
  }

  const parsed: unknown = JSON.parse(withoutFences.slice(firstBrace, lastBrace + 1));
  if (!isRecord(parsed)) throw new Error("Antwort ist kein JSON-Objekt");

  const titel = requiredString(parsed.titel, "titel").slice(0, 120);
  const teaser = requiredString(parsed.teaser, "teaser");
  const inhalt = requiredString(parsed.inhalt, "inhalt");
  const wordCount = inhalt.split(/\s+/).filter(Boolean).length;
  if (enforceWordCount && (wordCount < 180 || wordCount > 220)) {
    throw new Error(`Artikel hat ${wordCount} statt der geforderten 180–220 Wörter`);
  }

  const tags = Array.isArray(parsed.tags)
    ? parsed.tags.filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim())).map(tag => tag.trim()).slice(0, 6)
    : [];
  const sources = parseSources(parsed.quellen ?? parsed.sources);

  const proposedSlug = typeof parsed.slug === "string" ? slugify(parsed.slug) : "";
  return {
    rubrik: category.name,
    rubrikId: category.id,
    titel,
    slug: proposedSlug || slugify(titel),
    teaser,
    inhalt,
    tags,
    sources,
    readingMinutes: Math.max(1, Math.ceil(wordCount / 200)),
  };
}

function buildWeeklyArticlePrompt(params: {
  category: ArticleCategory;
  coveredList: string;
  weeklyNews?: string;
  today: string;
  month: string;
  kw: number;
}): string {
  const { category, coveredList, weeklyNews, today, month, kw } = params;
  return `Du bist Redakteur bei germring.de — faktenbasiertes Lokalmedium für Erneuerbare Energien und Kommunalpolitik im Landkreis Fürstenfeldbruck (Bayern). Heute: ${today}, KW ${kw}.

Rubrik: ${category.name} (Rubrik-ID ${category.id})

Bereits veröffentlichte Artikel der letzten vier Wochen — diese Themen nicht wiederholen:
${coveredList}

${weeklyNews?.trim() ? `Aktuelle Ereignisse im Landkreis (vom Herausgeber):\n${weeklyNews.trim()}` : `Keine spezifischen Ereignisse angegeben — wähle ein saisonal passendes Thema für ${month}.`}

Schreibe genau einen vollständigen Artikel:
- 200–210 Wörter im Feld "inhalt" (zähle die Wörter vor der Antwort; keinesfalls unter 180 oder über 220)
- sachlich, seriös und ohne Clickbait
- lokaler Bezug zu Germering, Puchheim, Fürstenfeldbruck, Olching, Gröbenzell, Moorenweis oder dem Landkreis FFB
- keine Quellen, Beschlüsse, Zahlen oder Projekte erfinden
- direkte Zitate nur verwenden, wenn sie im bereitgestellten Material wörtlich enthalten und einer Originalquelle zugeordnet sind
- wenn kein belegbares Originalmaterial vorliegt: keine direkten Zitate schreiben und "quellen" als leeres Array ausgeben
- erster Absatz: Wichtigstes zuerst
- letzter Satz: knapper Ausblick

Antworte ausschließlich mit einem JSON-Objekt, ohne Markdown oder Begleittext:
{
  "titel": "Artikeltitel (maximal 75 Zeichen)",
  "slug": "artikeltitel-ohne-umlaute",
  "teaser": "Zwei kurze Sätze als Teaser.",
  "inhalt": "Vollständiger Artikeltext mit \\n\\n zwischen Absätzen.",
  "tags": ["tag1", "tag2", "tag3"],
  "quellen": [
    {"label": "Originalquelle", "url": "https://beispiel.de/dokument"}
  ]
}`;
}

function buildArticleRepairPrompt(
  article: GeneratedArticle,
  wordCount: number,
): string {
  const instruction = wordCount < 180
    ? "Erweitere ausschließlich das Feld inhalt um sinnvolle, faktenbasierte Einordnung, bis es 180–220 Wörter enthält."
    : "Kürze ausschließlich das Feld inhalt auf 180–220 Wörter, ohne wichtige Fakten zu verlieren.";
  return `Du bist Schlussredakteur bei germring.de. Korrigiere dieses JSON-Objekt.

${instruction}
- Zielbereich: 200–210 Wörter im Feld "inhalt"
- Behalte Titel, Rubrik, lokale Fakten und sachlichen Ton bei
- Keine neuen unbelegten Zahlen, Beschlüsse oder Projekte erfinden
- Entferne direkte Zitate, wenn sie nicht durch eine vorhandene Originalquelle in "sources" belegbar sind
- Verändere die vorhandenen Quellen nicht und erfinde keine neuen Quellen
- Antworte ausschließlich mit einem JSON-Objekt, ohne Markdown oder Begleittext

Aktuelles Objekt:
${JSON.stringify(article)}`;
}

function extractAnthropicText(response: {
  content: Array<{ type: string; text?: string }>;
}): string {
  return response.content
    .filter(block => block.type === "text" && typeof block.text === "string")
    .map(block => block.text ?? "")
    .join("");
}

function normalizeNewsletterArticleLinks(text: string, articleIds: number[]): string {
  let nextIndex = 0;
  const validIds = new Set(articleIds);
  const withLinks = text.replace(
    /\[\[ARTIKEL:(\d+)\]\]|Mehr dazu auf germring\.de/g,
    (match, explicitId?: string) => {
      const explicit = explicitId ? Number(explicitId) : undefined;
      const articleId = explicit && validIds.has(explicit) ? explicit : articleIds[nextIndex];
      nextIndex++;
      return articleId ? `[[ARTIKEL:${articleId}]]` : match;
    },
  );

  const presentIds = new Set(
    Array.from(withLinks.matchAll(/\[\[ARTIKEL:(\d+)\]\]/g), match => Number(match[1])),
  );
  const missingLinks = articleIds
    .filter(id => !presentIds.has(id))
    .map(id => `[[ARTIKEL:${id}]]`);

  return missingLinks.length > 0
    ? `${withLinks.trim()}\n\n${missingLinks.join("\n\n")}`
    : withLinks;
}

async function generateWeeklyArticle(
  params: Parameters<typeof buildWeeklyArticlePrompt>[0],
  onAttemptFailed: (attempt: number, err: unknown) => void,
  signal: AbortSignal,
): Promise<GeneratedArticle> {
  let lastError: unknown = new Error("Generierung fehlgeschlagen");

  for (let attempt = 1; attempt <= ARTICLE_GENERATION_ATTEMPTS; attempt++) {
    if (signal.aborted) {
      throw signal.reason instanceof Error ? signal.reason : new Error("Generierung abgebrochen");
    }

    const attemptController = new AbortController();
    const abortAttempt = () => attemptController.abort(signal.reason);
    signal.addEventListener("abort", abortAttempt, { once: true });
    const timeout = setTimeout(
      () => attemptController.abort(new Error("Zeitlimit der KI-Anfrage überschritten")),
      75_000,
    );

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2200,
        messages: [{ role: "user", content: buildWeeklyArticlePrompt(params) }],
      }, {
        signal: attemptController.signal,
        maxRetries: 0,
      });
      const initial = parseGeneratedArticle(
        extractAnthropicText(response),
        params.category,
        false,
      );
      const wordCount = initial.inhalt.split(/\s+/).filter(Boolean).length;
      if (wordCount >= 180 && wordCount <= 220) return initial;

      const repairResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2400,
        messages: [{
          role: "user",
          content: buildArticleRepairPrompt(initial, wordCount),
        }],
      }, {
        signal: attemptController.signal,
        maxRetries: 0,
      });
      return parseGeneratedArticle(
        extractAnthropicText(repairResponse),
        params.category,
        true,
      );
    } catch (err) {
      if (signal.aborted) {
        throw signal.reason instanceof Error ? signal.reason : new Error("Generierung abgebrochen");
      }
      lastError = err;
      onAttemptFailed(attempt, err);
      if (attempt < ARTICLE_GENERATION_ATTEMPTS) {
        await new Promise<void>((resolve, reject) => {
          const delay = setTimeout(resolve, attempt * 1200);
          const abortDelay = () => {
            clearTimeout(delay);
            reject(signal.reason instanceof Error ? signal.reason : new Error("Generierung abgebrochen"));
          };
          signal.addEventListener("abort", abortDelay, { once: true });
        });
      }
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener("abort", abortAttempt);
    }
  }

  throw lastError;
}

// POST /api/woche/artikel-generieren  (SSE)
router.post("/woche/artikel-generieren", requireAdminPin, async (req, res) => {
  const { recentArticles, weeklyNews, categoryIds } = req.body as {
    recentArticles?: Array<{ title: string; categoryName: string; publishedAt: string }>;
    weeklyNews?: string;
    categoryIds?: number[];
  };

  if (!Array.isArray(recentArticles)) {
    res.status(400).json({ error: "Die Liste der zuletzt veröffentlichten Artikel fehlt." });
    return;
  }
  if (weeklyNews != null && typeof weeklyNews !== "string") {
    res.status(400).json({ error: "Die Wochennotizen sind ungültig." });
    return;
  }
  const requestedIds = categoryIds ?? ARTICLE_CATEGORIES.map(category => category.id);
  if (
    !Array.isArray(requestedIds) ||
    requestedIds.length === 0 ||
    requestedIds.some(id => !Number.isInteger(id) || !ARTICLE_CATEGORIES.some(category => category.id === id))
  ) {
    res.status(400).json({ error: "Die angeforderten Rubriken sind ungültig." });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  const month = new Date().toLocaleDateString("de-DE", { month: "long" });
  const kw = getCalendarWeek(new Date());
  const operationId = randomUUID();
  const categories = ARTICLE_CATEGORIES.filter(category => requestedIds.includes(category.id));
  const completedCategoryIds = new Set<number>();
  const generationController = new AbortController();
  let clientClosed = false;
  res.on("close", () => {
    clientClosed = true;
    generationController.abort(new Error("Client-Verbindung geschlossen"));
  });

  const sendEvent = (payload: Record<string, unknown>) => {
    if (!clientClosed && !res.writableEnded) {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  };
  const heartbeat = setInterval(() => {
    if (!clientClosed && !res.writableEnded) res.write(": keep-alive\n\n");
  }, 10_000);

  const coveredList = recentArticles.length > 0
    ? recentArticles.map(a =>
        `- ${a.categoryName}: "${a.title}" (${new Date(a.publishedAt).toLocaleDateString("de-DE")})`
      ).join("\n")
    : "(noch keine Artikel veröffentlicht)";

  try {
    const failedCategoryIds: number[] = [];
    let nextCategoryIndex = 0;
    const worker = async () => {
      while (!clientClosed) {
        const index = nextCategoryIndex++;
        const category = categories[index];
        if (!category) return;
        sendEvent({
          progress: `Schreibe ${category.name} (${index + 1}/${categories.length}) …`,
          categoryId: category.id,
        });

        try {
          const article = await generateWeeklyArticle(
            { category, coveredList, weeklyNews: weeklyNews?.slice(0, 5000), today, month, kw },
            (attempt, err) => {
              req.log.warn(
                {
                  err,
                  operationId,
                  stage: "article-generation",
                  categoryId: category.id,
                  attempt,
                },
                "Weekly article generation attempt failed",
              );
              if (attempt < ARTICLE_GENERATION_ATTEMPTS) {
                sendEvent({
                  progress: `${category.name}: Antwort wird erneut versucht (${attempt + 1}/${ARTICLE_GENERATION_ATTEMPTS}) …`,
                  categoryId: category.id,
                });
              }
            },
            generationController.signal,
          );
          completedCategoryIds.add(category.id);
          sendEvent({ article, categoryId: category.id });
          sendEvent({ progress: `Erstellt ${completedCategoryIds.size} von ${categories.length} Artikeln.` });
        } catch (err) {
          if (generationController.signal.aborted) return;
          failedCategoryIds.push(category.id);
          req.log.error(
            { err, operationId, stage: "article-generation", categoryId: category.id },
            "Weekly article generation exhausted retries",
          );
        }
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(2, categories.length) }, () => worker()),
    );

    if (failedCategoryIds.length > 0) {
      const failedNames = ARTICLE_CATEGORIES
        .filter(category => failedCategoryIds.includes(category.id))
        .map(category => category.name)
        .join(", ");
      sendEvent({
        error: `Nicht alle Artikel konnten erstellt werden. Fehlend: ${failedNames}. Die fertigen Artikel bleiben erhalten.`,
        retryable: true,
        failedCategoryIds,
        operationId,
      });
    } else {
      sendEvent({ done: true, operationId });
    }
  } catch (err) {
    req.log.error({ err, operationId, stage: "weekly-generation" }, "Weekly article generation failed");
    if (!clientClosed) {
      sendEvent({
        error: "Die Artikelgenerierung wurde unerwartet unterbrochen. Bereits fertige Artikel bleiben erhalten.",
        retryable: true,
        failedCategoryIds: categories
          .filter(category => !completedCategoryIds.has(category.id))
          .map(category => category.id),
        operationId,
      });
    }
  } finally {
    clearInterval(heartbeat);
    if (!clientClosed && !res.writableEnded) res.end();
  }
});

// POST /api/woche/redaktionsplan  (SSE — legacy, kept for compatibility)
router.post("/woche/redaktionsplan", requireAdminPin, async (req, res) => {
  const { recentArticles, weeklyNews } = req.body as {
    recentArticles: Array<{ title: string; categoryName: string; publishedAt: string }>;
    weeklyNews?: string;
  };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  const month = new Date().toLocaleDateString("de-DE", { month: "long" });
  const kw = getCalendarWeek(new Date());

  const coveredList = recentArticles.length > 0
    ? recentArticles.map(a =>
        `- ${a.categoryName}: "${a.title}" (${new Date(a.publishedAt).toLocaleDateString("de-DE")})`
      ).join("\n")
    : "(noch keine Artikel veröffentlicht)";

  const prompt = `Du bist Redaktionsassistent von germring.de — faktenbasiertes Lokalmedium für Erneuerbare Energien und Kommunalpolitik im Landkreis Fürstenfeldbruck (Bayern). Heute: ${today}, KW ${kw}.

Bereits veröffentlichte Artikel (letzte 4 Wochen):
${coveredList}

${weeklyNews?.trim() ? `Aktuelles aus dem Landkreis diese Woche (Notizen des Herausgebers):\n${weeklyNews.trim()}` : `Keine aktuellen Ereignisse notiert — wähle zeitlos relevante Themen für ${month}.`}

Aufgabe: Erstelle einen Redaktionsplan mit 3–4 Themenvorschlägen für die nächste Ausgabe.

Kriterien:
- Themen, die noch NICHT (oder nicht kürzlich) abgedeckt wurden
- Lokaler Bezug zu Landkreis FFB (Germering, Puchheim, Fürstenfeldbruck, Olching, Gröbenzell etc.)
- Faktenbezogen, nicht spekulativ
- Verteilung auf verschiedene Rubriken
- Saisonal passend (${month})

Rubriken: 1=Energie & Erneuerbare, 2=Kommunalpolitik, 3=Zahlen & Daten, 4=Praxis & Zukunft

Antworte NUR als JSON-Array:
[
  {
    "rubrik": "Energie & Erneuerbare",
    "rubrikId": 1,
    "titel": "Vorgeschlagener Artikeltitel (prägnant, max 80 Zeichen)",
    "brief": "Was wäre der Inhalt? Welche Fakten, welcher lokale Bezug, welche Einordnung? (3–5 Sätze als Briefing für die KI)",
    "warum": "Warum ist das jetzt relevant? (1 Satz)"
  }
]`;

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Redaktionsplan failed");
    res.write(`data: ${JSON.stringify({ error: "Generierung fehlgeschlagen" })}\n\n`);
    res.end();
  }
});

// POST /api/woche/newsletter-entwurf  (SSE)
router.post("/woche/newsletter-entwurf", requireAdminPin, async (req, res) => {
  const { articleIds } = req.body as { articleIds: number[] };
  if (
    !Array.isArray(articleIds) ||
    articleIds.length === 0 ||
    articleIds.some(id => !Number.isInteger(id) || id <= 0)
  ) {
    res.status(400).json({ error: "Mindestens eine gültige Artikel-ID ist erforderlich" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const articles = await db
      .select({
        id: articlesTable.id,
        title: articlesTable.title,
        excerpt: articlesTable.excerpt,
        content: articlesTable.content,
        categoryName: categoriesTable.name,
        sources: articlesTable.sources,
      })
      .from(articlesTable)
      .innerJoin(categoriesTable, eq(articlesTable.categoryId, categoriesTable.id))
      .where(inArray(articlesTable.id, articleIds));
    const articlesById = new Map(articles.map(article => [article.id, article]));
    const orderedArticles = articleIds
      .map(id => articlesById.get(id))
      .filter((article): article is (typeof articles)[number] => Boolean(article));

    const prompt = buildNewsletterPrompt(
      orderedArticles,
      new Date(),
      await getLocalWeatherContext(),
    );

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    let rawNewsletter = "";
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        rawNewsletter += event.delta.text;
      }
    }
    const normalizedNewsletter = normalizeNewsletterArticleLinks(
      rawNewsletter,
      orderedArticles.map(article => article.id),
    );
    res.write(`data: ${JSON.stringify({ content: normalizedNewsletter })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Newsletter draft failed");
    res.write(`data: ${JSON.stringify({ error: "Newsletter-Entwurf fehlgeschlagen" })}\n\n`);
    res.end();
  }
});

router.get("/woche/newsletter-entwurf/latest", requireAdminPin, async (req, res): Promise<void> => {
  try {
    const [draft] = await db
      .select({
        subject: newsletterIssuesTable.subject,
        content: newsletterIssuesTable.content,
        createdAt: newsletterIssuesTable.createdAt,
      })
      .from(newsletterIssuesTable)
      .where(and(
        eq(newsletterIssuesTable.status, "draft"),
        like(newsletterIssuesTable.subject, "[Sonntagsentwurf %"),
      ))
      .orderBy(desc(newsletterIssuesTable.createdAt))
      .limit(1);
    if (!draft) {
      res.json({ draft: null });
      return;
    }
    const subject = draft.subject.replace(/^\[Sonntagsentwurf [^\]]+\]\s*/, "");
    res.json({
      draft: {
        subject,
        content: draft.content,
        generatedAt: draft.createdAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Latest automatic newsletter draft could not be loaded");
    res.status(500).json({ error: "Der Sonntagsentwurf konnte nicht geladen werden." });
  }
});

let newsletterDraftSchedulerStarted = false;
let lastNewsletterDraftAttemptDate: string | null = null;
let newsletterDraftAttemptsToday = 0;
let lastNewsletterDraftAttemptAt = 0;

async function generateSundayNewsletterDraft(): Promise<void> {
  const now = new Date();
  const local = berlinDateParts(now);
  if (local.weekday !== "Sun" || local.hour < AUTO_DRAFT_HOUR) return;
  const dateKey = `${local.year}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;
  if (lastNewsletterDraftAttemptDate !== dateKey) {
    lastNewsletterDraftAttemptDate = dateKey;
    newsletterDraftAttemptsToday = 0;
    lastNewsletterDraftAttemptAt = 0;
  }
  if (
    newsletterDraftAttemptsToday >= 3 ||
    Date.now() - lastNewsletterDraftAttemptAt < 15 * 60 * 1000
  ) return;
  newsletterDraftAttemptsToday += 1;
  lastNewsletterDraftAttemptAt = Date.now();

  const prefix = `[Sonntagsentwurf ${dateKey}]`;
  const existing = await db
    .select({ id: newsletterIssuesTable.id })
    .from(newsletterIssuesTable)
    .where(and(
      eq(newsletterIssuesTable.status, "draft"),
      like(newsletterIssuesTable.subject, `${prefix}%`),
    ))
    .limit(1);
  if (existing.length > 0) return;

  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const articles = await db
    .select({
      id: articlesTable.id,
      title: articlesTable.title,
      excerpt: articlesTable.excerpt,
      content: articlesTable.content,
      categoryName: categoriesTable.name,
      sources: articlesTable.sources,
    })
    .from(articlesTable)
    .innerJoin(categoriesTable, eq(articlesTable.categoryId, categoriesTable.id))
    .where(gte(articlesTable.publishedAt, since))
    .orderBy(desc(articlesTable.publishedAt))
    .limit(12);
  const prompt = buildNewsletterPrompt(articles, now, await getLocalWeatherContext());
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  }, { signal: AbortSignal.timeout(90_000) });
  const raw = response.content
    .filter((block): block is typeof block & { type: "text"; text: string } => block.type === "text")
    .map(block => block.text)
    .join("");
  const subjectMatch = raw.match(/===BETREFF===\s*([\s\S]*?)\s*===TEXT===/);
  const contentMatch = raw.match(/===TEXT===\s*([\s\S]+)$/);
  if (!subjectMatch || !contentMatch) throw new Error("Newsletter response did not match the expected format");
  const normalized = normalizeNewsletterArticleLinks(contentMatch[1].trim(), articles.map(article => article.id));
  const storedSubject = `${prefix} ${subjectMatch[1].trim()}`;

  await db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(173351097, 42)`);
    const duplicate = await tx
      .select({ id: newsletterIssuesTable.id })
      .from(newsletterIssuesTable)
      .where(and(
        eq(newsletterIssuesTable.status, "draft"),
        like(newsletterIssuesTable.subject, `${prefix}%`),
      ))
      .limit(1);
    if (duplicate.length > 0) return;
    await tx.insert(newsletterIssuesTable).values({
      subject: storedSubject,
      content: normalized,
      status: "draft",
    });
  });
}

export function startNewsletterDraftScheduler(): void {
  if (newsletterDraftSchedulerStarted) return;
  newsletterDraftSchedulerStarted = true;
  const run = () => {
    void generateSundayNewsletterDraft().catch(err => {
      logger.error({ err }, "Sunday newsletter draft generation failed");
    });
  };
  run();
  setInterval(run, 60_000).unref();
}

// GET /api/woche/abonnenten
router.get("/woche/abonnenten", async (req, res) => {
  try {
    const subscribers = await db
      .select({
        email: newsletterSubscribersTable.email,
        confirmed: newsletterSubscribersTable.confirmed,
        subscribedAt: newsletterSubscribersTable.subscribedAt,
      })
      .from(newsletterSubscribersTable)
      .orderBy(desc(newsletterSubscribersTable.subscribedAt));
    res.json(subscribers);
  } catch (err) {
    req.log.error({ err }, "Abonnenten fetch failed");
    res.status(500).json({ error: "Abonnenten konnten nicht geladen werden" });
  }
});

// POST /api/woche/newsletter-test
router.post("/woche/newsletter-test", requireAdminPin, async (req, res) => {
  const { email, betreff, text } = req.body as { email?: string; betreff?: string; text?: string };
  if (!email?.trim() || !betreff?.trim() || !text?.trim()) {
    return res.status(400).json({ error: "E-Mail, Betreff und Text erforderlich" });
  }
  try {
    await sendNewsletterEmail(email.trim(), `[TEST] ${betreff}`, text, NEWSLETTER_DOMAIN);
    return res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Test send failed");
    return res.status(500).json({ error: "Test-Versand fehlgeschlagen" });
  }
});

// POST /api/woche/newsletter-senden
router.post("/woche/newsletter-senden", requireAdminPin, async (req, res) => {
  const { betreff, text } = req.body as { betreff?: string; text?: string };

  if (!betreff?.trim() || !text?.trim()) {
    return res.status(400).json({ error: "Betreff und Text erforderlich" });
  }

  const subject = betreff.trim();
  const content = text.trim();

  try {
    const subscribers = await db
      .select({ email: newsletterSubscribersTable.email })
      .from(newsletterSubscribersTable)
      .where(eq(newsletterSubscribersTable.confirmed, true));

    if (subscribers.length === 0) {
      return res.json({ sent: 0, failed: 0, message: "Keine bestätigten Abonnenten" });
    }

    const [issue] = await db
      .insert(newsletterIssuesTable)
      .values({ subject, content })
      .returning({ id: newsletterIssuesTable.id });

    if (!issue) {
      throw new Error("Newsletter-Ausgabe konnte nicht für das Archiv angelegt werden.");
    }

    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      try {
        await sendNewsletterEmail(sub.email, subject, content, NEWSLETTER_DOMAIN);
        sent++;
        await new Promise(r => setTimeout(r, 120));
      } catch (err) {
        req.log.warn({ err, email: sub.email }, "Failed to send to subscriber");
        failed++;
      }
    }

    try {
      await db
        .update(newsletterIssuesTable)
        .set({
          status: sent > 0 ? "sent" : "failed",
          sentCount: sent,
          failedCount: failed,
          sentAt: sent > 0 ? new Date() : null,
        })
        .where(eq(newsletterIssuesTable.id, issue.id));
    } catch (err) {
      req.log.error({ err, newsletterIssueId: issue.id, sent }, "Newsletter was sent but archive status could not be saved");
      return res.status(500).json({
        error: "Der Newsletter wurde versendet, aber das Archiv konnte nicht aktualisiert werden. Bitte nicht erneut senden.",
      });
    }

    return res.json({ sent, failed, total: subscribers.length, archived: sent > 0 });
  } catch (err) {
    req.log.error({ err }, "Newsletter send failed");
    return res.status(500).json({ error: "Versand fehlgeschlagen" });
  }
});

export default router;
