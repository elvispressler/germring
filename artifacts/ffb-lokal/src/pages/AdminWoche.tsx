import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  adminFetch,
  AdminAuthError,
  readApiError,
} from "@/lib/adminFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function imageKey(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "");
    const commonsThumbnail = ["upload.wikimedia.org", "thumb.wikimedia.org"].includes(parsed.hostname.toLowerCase())
      ? path.match(/^\/wikipedia\/commons\/thumb\/(.+)\/\d+px-[^/]+$/)
      : null;
    return `${commonsThumbnail ? "upload.wikimedia.org" : parsed.hostname.toLowerCase()}${commonsThumbnail
      ? `/wikipedia/commons/${commonsThumbnail[1]}`
      : path}`;
  } catch {
    return url.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  }
}

type ImageSearchCandidate = {
  title: string;
  imageUrl: string;
  previewUrl: string;
  sourceUrl: string;
  license: string;
  credit: string;
};

type ImageSearchState = {
  status: "loading" | "ready" | "error";
  candidates: ImageSearchCandidate[];
  error?: string;
};

function articleImageReviewKey(article: GeneratedArticle): string {
  return `${article.rubrikId}:${article.slug}`;
}

async function loadUsedImageKeys(): Promise<Set<string>> {
  const used = new Set<string>();
  const pageSize = 100;
  let offset = 0;

  while (true) {
    const response = await fetch(`${BASE}/api/articles?limit=${pageSize}&offset=${offset}`);
    if (!response.ok) {
      throw new Error("Verwendete Artikelbilder konnten nicht geprüft werden.");
    }
    const page = await response.json() as Array<{ imageUrl: string | null; imageSourceUrl?: string | null }>;
    for (const article of page) {
      if (article.imageSourceUrl) used.add(imageKey(article.imageSourceUrl));
      if (article.imageUrl) used.add(imageKey(article.imageUrl));
    }
    if (page.length < pageSize) return used;
    offset += pageSize;
  }
}

type RecentArticle = {
  id: number;
  title: string;
  excerpt: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  publishedAt: string;
};

type SiteStatus = {
  recentArticles: RecentArticle[];
  subscriberCount: number;
  lastPublishedAt: string | null;
};

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

type PublishedItem = {
  id: number;
  title: string;
  rubrik: string;
  forNewsletter: boolean;
  imageUrl: string | null;
  imageSourceUrl: string | null;
  imageSourcePageUrl: string | null;
  imageLicense: string | null;
  imageCredit: string | null;
};

type NewsletterDraft = {
  betreff: string;
  text: string;
};

class StreamRequestError extends Error {
  readonly failedCategoryIds: number[];
  readonly retryable: boolean;

  constructor(message: string, failedCategoryIds: number[] = [], retryable = false) {
    super(message);
    this.name = "StreamRequestError";
    this.failedCategoryIds = failedCategoryIds;
    this.retryable = retryable;
  }
}

type StreamHandlers = {
  onArticle?: (article: GeneratedArticle) => void;
  onProgress?: (message: string) => void;
};

async function streamSSE(
  url: string,
  body: object,
  onChunk: (text: string) => void,
  signal: AbortSignal,
  handlers: StreamHandlers = {},
): Promise<string> {
  const res = await adminFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, `Anfrage fehlgeschlagen (HTTP ${res.status})`));
  }
  if (!res.body) throw new Error("Der Server hat keinen Antwort-Stream geöffnet.");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let full = "";
  let completed = false;
  let serverError: StreamRequestError | null = null;
  outer: while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const p = JSON.parse(line.slice(6)) as Record<string, unknown>;
        if (p.done === true) completed = true;
        if (typeof p.content === "string") { full += p.content; onChunk(full); }
        if (typeof p.progress === "string") handlers.onProgress?.(p.progress);
        if (p.article && typeof p.article === "object") {
          handlers.onArticle?.(p.article as GeneratedArticle);
        }
        if (typeof p.error === "string") {
          const failedCategoryIds = Array.isArray(p.failedCategoryIds)
            ? p.failedCategoryIds.filter((id): id is number => typeof id === "number")
            : [];
          serverError = new StreamRequestError(p.error, failedCategoryIds, p.retryable === true);
          break outer;
        }
      } catch { /* malformed SSE line — skip */ }
    }
  }
  if (serverError) throw serverError;
  if (!completed) {
    throw new StreamRequestError(
      "Die Verbindung endete vor der Abschlussbestätigung. Fertige Artikel bleiben erhalten.",
      [],
      true,
    );
  }
  return full;
}

function extractJson<T>(raw: string): T {
  // Try full match first
  const m = raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (m) {
    try { return JSON.parse(m[0]) as T; } catch { /* try repair below */ }
  }
  // Try to repair a truncated JSON array by closing it
  const arrayStart = raw.indexOf("[");
  if (arrayStart !== -1) {
    const partial = raw.slice(arrayStart);
    // Find the last complete object (ends with "}")
    const lastComplete = partial.lastIndexOf("}");
    if (lastComplete !== -1) {
      try {
        const repaired = partial.slice(0, lastComplete + 1) + "]";
        return JSON.parse(repaired) as T;
      } catch { /* fall through */ }
    }
  }
  throw new Error("Antwort konnte nicht verarbeitet werden. Bitte erneut versuchen.");
}

function extractNewsletter(raw: string): NewsletterDraft {
  const bm = raw.match(/===BETREFF===\s*\n(.*?)\n/);
  const tm = raw.match(/===TEXT===\s*\n([\s\S]*?)(?:===|$)/);
  if (!bm || !tm) throw new Error("Kein gültiges Newsletter-Format");
  return { betreff: bm[1].trim(), text: tm[1].trim() };
}

function NewsletterPreviewParagraph({ text }: { text: string }) {
  const parts = text.split(/(\[\[ARTIKEL:\d+\]\])/g);

  return (
    <p className="mb-3 leading-relaxed text-forest-800">
      {parts.map((part, index) => {
        const match = part.match(/^\[\[ARTIKEL:(\d+)\]\]$/);
        if (!match) return <span key={index}>{part}</span>;
        return (
          <a
            key={index}
            href={`${BASE}/artikel/${match[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-forest-700 underline decoration-forest-300 underline-offset-4 hover:text-forest-900"
          >
            Mehr dazu auf germring.de →
          </a>
        );
      })}
    </p>
  );
}

function daysAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return "heute";
  if (diff === 1) return "gestern";
  return `vor ${diff} Tagen`;
}

const CAT_COLORS: Record<string, string> = {
  "Energie & Erneuerbare": "bg-green-100 text-green-800",
  "Kommunalpolitik": "bg-blue-100 text-blue-800",
  "Zahlen & Daten": "bg-amber-100 text-amber-800",
  "Praxis & Zukunft": "bg-purple-100 text-purple-800",
};

function CategoryBadge({ name }: { name: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLORS[name] ?? "bg-gray-100 text-gray-700"}`}>
      {name}
    </span>
  );
}

function calendarWeek(): number {
  const d = new Date();
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil((((tmp.getTime() - y0.getTime()) / 86400000) + 1) / 7);
}

const KW = calendarWeek();

export function AdminWochePage() {
  const { toast } = useToast();

  // ── Status ─────────────────────────────────────────
  const [status, setStatus] = useState<SiteStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // ── Step 1: Context ────────────────────────────────
  const [weeklyNews, setWeeklyNews] = useState("");

  // ── Step 2: Generation ────────────────────────────
  const [generating, setGenerating] = useState(false);
  const [generatingRaw, setGeneratingRaw] = useState("");
  const [articles, setArticles] = useState<GeneratedArticle[]>([]);
  const [forWeb, setForWeb] = useState<Set<number>>(new Set());
  const [forNewsletter, setForNewsletter] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [failedCategoryIds, setFailedCategoryIds] = useState<number[]>([]);
  const [generationError, setGenerationError] = useState("");
  const [imageSearches, setImageSearches] = useState<Record<string, ImageSearchState>>({});
  const [imageChoices, setImageChoices] = useState<Record<string, ImageSearchCandidate | null>>({});
  const [imageReviewConfirmed, setImageReviewConfirmed] = useState<Record<string, boolean>>({});

  // ── Step 3: Publishing ────────────────────────────
  const [publishing, setPublishing] = useState(false);
  const [publishedItems, setPublishedItems] = useState<PublishedItem[]>([]);

  // ── Step 4: Newsletter ────────────────────────────
  const [selectedNewsletterIds, setSelectedNewsletterIds] = useState<Set<number>>(new Set());
  const [draftStreaming, setDraftStreaming] = useState(false);
  const [draftRaw, setDraftRaw] = useState("");
  const [draft, setDraft] = useState<NewsletterDraft | null>(null);
  const [autoDraftDate, setAutoDraftDate] = useState<string | null>(null);
  const [editBetreff, setEditBetreff] = useState("");
  const [editText, setEditText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/woche/status`)
      .then(r => r.json())
      .then((d: SiteStatus) => setStatus(d))
      .catch(() => toast({ title: "Status konnte nicht geladen werden", variant: "destructive" }))
      .finally(() => setStatusLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    adminFetch(`${BASE}/api/woche/newsletter-entwurf/latest`)
      .then(async response => {
        if (!response.ok) throw new Error(await readApiError(response, "Sonntagsentwurf konnte nicht geladen werden."));
        return response.json() as Promise<{
          draft: { subject: string; content: string; generatedAt: string } | null;
        }>;
      })
      .then(({ draft: savedDraft }) => {
        if (!active || !savedDraft) return;
        const generatedAt = new Intl.DateTimeFormat("de-DE", {
          dateStyle: "long",
          timeStyle: "short",
        }).format(new Date(savedDraft.generatedAt));
        setDraft({ betreff: savedDraft.subject, text: savedDraft.content });
        setEditBetreff(savedDraft.subject);
        setEditText(savedDraft.content);
        setAutoDraftDate(generatedAt);
      })
      .catch(err => {
        if (active && !(err instanceof AdminAuthError)) {
          toast({ title: "Sonntagsentwurf konnte nicht geladen werden", description: String(err), variant: "destructive" });
        }
      });
    return () => { active = false; };
  }, []);

  // ── Generate articles ─────────────────────────────
  const generateArticles = async (
    categoryIds = [1, 2, 3, 4],
    preserveExisting = false,
  ) => {
    if (!status) return;
    setGenerating(true);
    setGeneratingRaw("");
    setGenerationError("");
    setFailedCategoryIds([]);
    if (!preserveExisting) {
      setArticles([]);
      setForWeb(new Set());
      setForNewsletter(new Set());
      setPublishedItems([]);
      setSendResult(null);
      setImageSearches({});
      setImageChoices({});
      setImageReviewConfirmed({});
    }

    const abort = new AbortController();
    abortRef.current = abort;
    const received = new Map<number, GeneratedArticle>(
      preserveExisting ? articles.map(article => [article.rubrikId, article]) : [],
    );
    const expectedCount = new Set([...received.keys(), ...categoryIds]).size;

    const updateReceivedArticles = (article: GeneratedArticle) => {
      received.set(article.rubrikId, article);
      const next = Array.from(received.values()).sort((a, b) => a.rubrikId - b.rubrikId);
      setArticles(next);
      setGeneratingRaw(`Bisher ${next.length} von ${expectedCount} Artikeln fertig.`);
      setForWeb(new Set(next.map((_, index) => index)));
      setForNewsletter(new Set(next.map((_, index) => index)));
    };

    try {
      const raw = await streamSSE(
        `${BASE}/api/woche/artikel-generieren`,
        { recentArticles: status.recentArticles, weeklyNews, categoryIds },
        setGeneratingRaw,
        abort.signal,
        {
          onArticle: updateReceivedArticles,
          onProgress: setGeneratingRaw,
        },
      );
      // Compatibility fallback for older API responses during rolling restarts.
      if (received.size === 0 && raw.trim()) {
        const parsed = extractJson<GeneratedArticle[]>(raw);
        parsed.forEach(updateReceivedArticles);
      }
      const missing = categoryIds.filter(id => !received.has(id));
      if (missing.length > 0) {
        throw new StreamRequestError("Die Antwort enthält nicht alle angeforderten Rubriken.", missing, true);
      }
      setGeneratingRaw("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        const message = err.name === "AbortError"
          ? "Die Generierung wurde abgebrochen. Fertige Artikel bleiben erhalten."
          : err.message || "Die Generierung wurde unterbrochen.";
        const pendingCategoryIds =
          err instanceof StreamRequestError && err.failedCategoryIds.length > 0
            ? err.failedCategoryIds
            : categoryIds.filter(categoryId => !received.has(categoryId));
        const completedSummary = `Fertig: ${received.size} von ${expectedCount}.`;
        setGenerationError(`${message} ${completedSummary}`);
        setGeneratingRaw("");
        setFailedCategoryIds(pendingCategoryIds);
        toast({ title: "Generierung nicht vollständig", description: message, variant: "destructive" });
      }
    } finally {
      setGenerating(false);
    }
  };

  const toggleExpand = (i: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const toggleForWeb = (i: number) => {
    setForWeb(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  };

  const toggleForNewsletter = (i: number) => {
    setForNewsletter(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  };

  const searchAlternativeImages = async (article: GeneratedArticle) => {
    const key = articleImageReviewKey(article);
    setImageSearches(current => ({ ...current, [key]: { status: "loading", candidates: [] } }));
    try {
      const response = await adminFetch(`${BASE}/api/articles/images/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.titel,
          excerpt: article.teaser,
          categoryId: article.rubrikId,
        }),
      });
      if (!response.ok) {
        throw new Error(await readApiError(response, `Bildsuche fehlgeschlagen (HTTP ${response.status})`));
      }
      const result = await response.json() as { candidates: ImageSearchCandidate[] };
      setImageSearches(current => ({
        ...current,
        [key]: { status: "ready", candidates: result.candidates },
      }));
      return result.candidates;
    } catch (err) {
      const error = err instanceof Error
        ? err.message
        : "Die Bildsuche ist fehlgeschlagen. Bitte versuche es erneut.";
      setImageSearches(current => ({
        ...current,
        [key]: { status: "error", candidates: [], error },
      }));
      return [];
    }
  };

  // ── Publish selected articles ─────────────────────
  const publishArticles = async () => {
    if (forWeb.size === 0) return;
    setPublishing(true);
    const results: PublishedItem[] = [];
    let usedImages: Set<string>;
    try {
      usedImages = await loadUsedImageKeys();
    } catch (err) {
      toast({ title: "Bilder konnten nicht geprüft werden", description: String(err), variant: "destructive" });
      setPublishing(false);
      return;
    }

    const imageUrls = new Map<string, string | undefined>();
    const imageProvenance = new Map<string, ImageSearchCandidate>();
    const articlesNeedingSearch: GeneratedArticle[] = [];
    const articlesAwaitingReview: GeneratedArticle[] = [];
    let duplicateChoiceTitle: string | null = null;

    for (const idx of Array.from(forWeb).sort()) {
      const article = articles[idx];
      if (!article) continue;
      const key = articleImageReviewKey(article);

      if (Object.prototype.hasOwnProperty.call(imageChoices, key)) {
        const choice = imageChoices[key];
        if (!choice) {
          articlesAwaitingReview.push(article);
          continue;
        }
        if (!imageReviewConfirmed[key]) {
          articlesAwaitingReview.push(article);
          continue;
        }
        const identity = imageKey(choice.imageUrl);
        if (usedImages.has(identity)) {
          duplicateChoiceTitle = article.titel;
          break;
        }
        usedImages.add(identity);
        imageUrls.set(key, choice.imageUrl);
        imageProvenance.set(key, choice);
        continue;
      }

      const searchState = imageSearches[key];
      if (!searchState || searchState.status === "error") {
        articlesNeedingSearch.push(article);
      } else {
        articlesAwaitingReview.push(article);
      }
    }

    if (duplicateChoiceTitle) {
      toast({
        title: "Foto inzwischen vergeben",
        description: `Das gewählte Foto für „${duplicateChoiceTitle}“ ist bereits einem anderen Artikel zugeordnet. Bitte wähle ein anderes Motiv.`,
        variant: "destructive",
      });
      setPublishing(false);
      return;
    }

    if (articlesNeedingSearch.length > 0) {
      await Promise.all(articlesNeedingSearch.map(searchAlternativeImages));
      setPublishing(false);
      toast({
        title: "Bitte Bildvorschläge prüfen",
        description: "Die Bildsuche richtet sich nach Überschrift und Teaser, nicht nach der Rubrik. Bitte wähle und prüfe für jeden Artikel ein passendes Motiv.",
      });
      return;
    }

    if (articlesAwaitingReview.length > 0) {
      toast({
        title: "Bildentscheidung erforderlich",
        description: "Bitte bestätige die Sichtprüfung jedes gewählten Fotos und wähle für jeden Artikel ein Motiv.",
      });
      setPublishing(false);
      return;
    }

    for (const idx of Array.from(forWeb).sort()) {
      const a = articles[idx];
      if (!a) continue;
      const key = articleImageReviewKey(a);
      // Make slug unique with timestamp suffix
      const slug = `${a.slug}-${Date.now().toString(36)}`;
      const imageUrl = imageUrls.get(key);
      const provenance = imageProvenance.get(key);
      if (!imageUrl) {
        toast({
          title: "Bildentscheidung erforderlich",
          description: `Für „${a.titel}“ muss vor der Veröffentlichung ein passendes Foto ausgewählt werden.`,
          variant: "destructive",
        });
        setPublishing(false);
        return;
      }
      const body = {
        title: a.titel,
        slug,
        excerpt: a.teaser,
        content: a.inhalt,
        categoryId: a.rubrikId,
        author: "germring.de Redaktion",
        imageUrl,
        ...(provenance ? {
          imageSourcePageUrl: provenance.sourceUrl,
          imageLicense: provenance.license,
          imageCredit: provenance.credit || null,
        } : {}),
        featured: false,
        readingMinutes: a.readingMinutes,
        tags: a.tags,
        sources: a.sources ?? [],
      };
      try {
        const res = await adminFetch(`${BASE}/api/articles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          throw new Error(await readApiError(res, `Veröffentlichung fehlgeschlagen (HTTP ${res.status})`));
        }
        const created = await res.json() as {
          id: number;
          imageUrl: string | null;
          imageSourceUrl: string | null;
          imageSourcePageUrl: string | null;
          imageLicense: string | null;
          imageCredit: string | null;
        };
        results.push({
          id: created.id,
          title: a.titel,
          rubrik: a.rubrik,
          forNewsletter: forNewsletter.has(idx),
          imageUrl: created.imageUrl,
          imageSourceUrl: created.imageSourceUrl,
          imageSourcePageUrl: created.imageSourcePageUrl,
          imageLicense: created.imageLicense,
          imageCredit: created.imageCredit,
        });
      } catch (err) {
        if (err instanceof AdminAuthError) break;
        toast({ title: `Fehler bei "${a.titel}"`, description: String(err), variant: "destructive" });
      }
    }

    setPublishedItems(results);
    // Pre-select newsletter items
    const newsletterIds = results.filter(r => r.forNewsletter).map(r => r.id);
    setSelectedNewsletterIds(new Set(newsletterIds));
    setPublishing(false);

    if (results.length > 0) {
      toast({
        title: `${results.length} Artikel veröffentlicht ✓`,
      });
      // Refresh status
      fetch(`${BASE}/api/woche/status`)
        .then(r => r.json())
        .then((d: SiteStatus) => setStatus(d))
        .catch(() => {});
    }
  };

  // ── Newsletter ────────────────────────────────────
  const toggleNewsletterArticle = (id: number) => {
    setSelectedNewsletterIds(prev => {
      const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n;
    });
  };

  const generateNewsletter = async () => {
    if (selectedNewsletterIds.size === 0) {
      toast({ title: "Bitte mindestens einen Artikel auswählen", variant: "destructive" });
      return;
    }
    setDraftStreaming(true);
    setDraftRaw("");
    setDraft(null);
    setShowPreview(false);
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      const raw = await streamSSE(
        `${BASE}/api/woche/newsletter-entwurf`,
        { articleIds: Array.from(selectedNewsletterIds) },
        setDraftRaw,
        abort.signal,
      );
      const parsed = extractNewsletter(raw);
      setDraft(parsed);
      setAutoDraftDate(null);
      setEditBetreff(parsed.betreff);
      setEditText(parsed.text);
      setDraftRaw("");
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast({ title: "Newsletter-Entwurf fehlgeschlagen", description: String(err), variant: "destructive" });
      }
    } finally {
      setDraftStreaming(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim() || !editBetreff.trim() || !editText.trim()) {
      toast({ title: "E-Mail-Adresse, Betreff und Text erforderlich", variant: "destructive" });
      return;
    }
    setTestSending(true);
    try {
      const res = await adminFetch(`${BASE}/api/woche/newsletter-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, betreff: editBetreff, text: editText }),
      });
      if (!res.ok) throw new Error(await readApiError(res, "Test-Versand fehlgeschlagen"));
      toast({ title: `Test-E-Mail an ${testEmail} gesendet ✓` });
    } catch (err) {
      if (!(err instanceof AdminAuthError)) {
        toast({ title: "Test-Versand fehlgeschlagen", description: String(err), variant: "destructive" });
      }
    } finally {
      setTestSending(false);
    }
  };

  const sendNewsletter = async () => {
    if (!editBetreff.trim() || !editText.trim()) return;
    setSending(true);
    try {
      const res = await adminFetch(`${BASE}/api/woche/newsletter-senden`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betreff: editBetreff, text: editText }),
      });
      if (!res.ok) throw new Error(await readApiError(res, "Versand fehlgeschlagen"));
      const data = await res.json() as { sent: number; failed: number; archived?: boolean; message?: string };
      setSendResult(data);
      if (data.sent > 0) {
        const deliverySummary = `${data.sent} Empfänger erreicht${data.failed > 0 ? `, ${data.failed} fehlgeschlagen` : ""}.`;
        toast({
          title: "Newsletter gesendet!",
          description: `${deliverySummary}${data.archived ? " Die Ausgabe ist jetzt im öffentlichen Archiv." : ""}`,
        });
      } else {
        toast({
          title: "Kein Newsletter zugestellt",
          description: data.message ?? "An keinen Abonnenten konnte die Ausgabe zugestellt werden.",
          variant: "destructive",
        });
      }
    } catch (err) {
      if (!(err instanceof AdminAuthError)) {
        toast({ title: "Versand fehlgeschlagen", description: String(err), variant: "destructive" });
      }
    } finally {
      setSending(false);
    }
  };

  const ALL_CATS = ["Energie & Erneuerbare", "Kommunalpolitik", "Zahlen & Daten", "Praxis & Zukunft"];
  const twoWeeksAgo = Date.now() - 14 * 86400000;
  const recentCats = new Set((status?.recentArticles ?? [])
    .filter(a => new Date(a.publishedAt).getTime() > twoWeeksAgo)
    .map(a => a.categoryName));

  // Newsletter article list: published first, then existing recent (exclude already published IDs)
  const publishedIds = new Set(publishedItems.map(p => p.id));
  const existingForNewsletter = (status?.recentArticles ?? []).filter(a => !publishedIds.has(a.id));

  const webCount = forWeb.size;
  const hasPublished = publishedItems.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">Wochenupdate</h1>
          <p className="text-sm text-forest-500 mt-0.5">KW {KW} · Artikel generieren, auswählen & Newsletter versenden.</p>
        </div>
        <Link href="/admin" className="text-sm text-forest-600 underline underline-offset-2 hover:text-forest-900 mt-1">
          Einzelnen Artikel
        </Link>
      </div>

      {/* ── Status box ──────────────────────────────────── */}
      <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 mb-8 mt-5">
        {statusLoading ? (
          <p className="text-sm text-forest-400">Lade Status…</p>
        ) : status ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-5 text-sm flex-wrap">
              <span className="text-forest-600">
                <strong className="text-forest-900">{status.recentArticles.length}</strong> Artikel (letzte 4 Wochen)
              </span>
              <span className="text-forest-600">
                <strong className="text-forest-900">{status.subscriberCount}</strong> Abonnenten
              </span>
              {status.lastPublishedAt && (
                <span className="text-forest-500 text-xs">Letzter Artikel: {daysAgo(status.lastPublishedAt)}</span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {ALL_CATS.map(cat => (
                <span key={cat} className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  recentCats.has(cat) ? "bg-forest-200 text-forest-800" : "bg-gray-100 text-gray-400 line-through"
                }`}>{cat}</span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-500">Status konnte nicht geladen werden.</p>
        )}
      </div>

      {/* ── Step 1: Context ──────────────────────────────── */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-forest-500 uppercase tracking-wider mb-2">
          1 — Was war diese Woche relevant? <span className="font-normal text-forest-400 normal-case">(optional)</span>
        </p>
        <textarea
          value={weeklyNews}
          onChange={e => setWeeklyNews(e.target.value)}
          rows={3}
          placeholder={"Stichwörter, Beschlüsse und lokale Ereignisse. Originalquellen und wörtliche Zitate bitte mit URL angeben.\n\nBeispiel: Beschluss zur Dachbegrünung · Quelle: https://…"}
          className="w-full border border-forest-200 rounded-xl px-4 py-3 text-sm text-forest-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
        />
      </div>

      {/* ── Generate button ──────────────────────────────── */}
      <div className="mb-8">
        {generating ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-2 h-2 bg-forest-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
              <span className="text-sm text-forest-600 font-medium">Artikel werden geschrieben…</span>
              <button
                onClick={() => abortRef.current?.abort()}
                className="ml-auto text-xs text-forest-400 hover:text-forest-700 underline"
              >Abbrechen</button>
            </div>
            {generatingRaw && (
              <div className="bg-forest-50 rounded-xl p-3 text-xs text-forest-500 font-mono max-h-28 overflow-hidden relative">
                <div className="whitespace-pre-wrap overflow-hidden">{generatingRaw.slice(-600)}</div>
                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-forest-50" />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => generateArticles()}
            disabled={!status}
            className="w-full py-3.5 bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <span>✦</span>
            <span>{articles.length > 0 ? "Neue Artikel generieren" : "Artikel generieren"}</span>
          </button>
        )}
        {!generating && generationError && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">Die Generierung war nicht vollständig.</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800">{generationError}</p>
            {failedCategoryIds.length > 0 && (
              <button
                type="button"
                onClick={() => generateArticles(failedCategoryIds, true)}
                className="mt-3 rounded-lg bg-amber-800 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-900"
              >
                Fehlende Artikel erneut versuchen
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Step 2: Article cards ────────────────────────── */}
      {articles.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-forest-500 uppercase tracking-wider">
              2 — Artikel auswählen &amp; freigeben
            </p>
            <div className="flex gap-3 text-xs text-forest-500">
              <button onClick={() => { setForWeb(new Set(articles.map((_, i) => i))); setForNewsletter(new Set(articles.map((_, i) => i))); }}
                className="underline underline-offset-2 hover:text-forest-800">alle</button>
              <button onClick={() => { setForWeb(new Set()); setForNewsletter(new Set()); }}
                className="underline underline-offset-2 hover:text-forest-800">keine</button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-forest-500 mb-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-forest-600 rounded inline-block" />
              Webseite
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-blue-500 rounded inline-block" />
              Newsletter
            </span>
          </div>

          <div className="space-y-3">
            {articles.map((a, i) => (
              <div
                key={i}
                className={`border rounded-xl overflow-hidden transition-all ${
                  forWeb.has(i) ? "border-forest-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkboxes */}
                    <div className="flex flex-col gap-2 pt-0.5">
                      <label className="flex items-center gap-1.5 cursor-pointer group" title="Auf Webseite veröffentlichen">
                        <input
                          type="checkbox"
                          checked={forWeb.has(i)}
                          onChange={() => toggleForWeb(i)}
                          className="w-4 h-4 accent-forest-700"
                        />
                        <span className="text-[10px] text-forest-500 group-hover:text-forest-800 font-medium">Web</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer group" title="In Newsletter aufnehmen">
                        <input
                          type="checkbox"
                          checked={forNewsletter.has(i)}
                          onChange={() => toggleForNewsletter(i)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="text-[10px] text-forest-500 group-hover:text-forest-800 font-medium">NL</span>
                      </label>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CategoryBadge name={a.rubrik} />
                        <span className="text-[10px] text-forest-400">{a.readingMinutes} min</span>
                      </div>
                      <p className="font-semibold text-forest-900 text-sm leading-snug mb-1">{a.titel}</p>
                      <p className="text-xs text-forest-500 leading-relaxed">{a.teaser}</p>

                      {(() => {
                        const reviewKey = articleImageReviewKey(a);
                        const search = imageSearches[reviewKey];
                        if (!search) return null;
                        const hasChoice = Object.prototype.hasOwnProperty.call(imageChoices, reviewKey);
                        const choice = imageChoices[reviewKey];

                        return (
                          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-xs font-semibold text-amber-900">
                              Artikelmotiv · passend zur Überschrift auswählen
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                              Lizenzierte, noch unbenutzte Vorschläge zum Artikelthema. Bitte Motiv und Überschrift gemeinsam prüfen; ein Symbolfoto darf keinen falschen Ort oder Sachverhalt suggerieren.
                            </p>
                            {search.status === "loading" && (
                              <p className="mt-2 text-xs text-amber-800">Suche nach freien, unbenutzten Motiven…</p>
                            )}
                            {search.status === "error" && (
                              <p className="mt-2 text-xs text-red-700">{search.error}</p>
                            )}
                            {search.status === "ready" && search.candidates.length === 0 && (
                              <p className="mt-2 text-xs text-amber-900">
                                Kein passendes, unbenutztes Motiv gefunden. Es wird kein beliebiges Rubrikfoto eingesetzt und der Artikel bleibt unveröffentlicht.
                              </p>
                            )}
                            {search.status === "ready" && search.candidates.length > 0 && (
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {search.candidates.map(candidate => {
                                  const selected = choice?.imageUrl === candidate.imageUrl;
                                  return (
                                    <div
                                      key={candidate.imageUrl}
                                      className={`overflow-hidden rounded-lg border bg-white ${
                                        selected ? "border-forest-600 ring-2 ring-forest-200" : "border-amber-200"
                                      }`}
                                    >
                                      <img
                                        src={candidate.previewUrl}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                        loading="lazy"
                                        className="h-32 w-full object-cover"
                                      />
                                      <div className="p-2">
                                        <p className="truncate text-xs font-medium text-forest-900" title={candidate.title}>
                                          {candidate.title}
                                        </p>
                                        <p className="mt-0.5 text-[10px] leading-relaxed text-forest-500 [overflow-wrap:anywhere]">
                                          <span className="font-medium">Lizenz:</span> {candidate.license}
                                          <span className="mx-1" aria-hidden="true">·</span>
                                          <span className="font-medium">Bildnachweis:</span>{" "}
                                          {candidate.credit.trim() || "Kein Credit in den Metadaten hinterlegt"}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between gap-2">
                                          <a
                                            href={candidate.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-forest-600 underline"
                                          >
                                            Quelle ansehen
                                          </a>
                                          <button
                                            type="button"
                                            disabled={publishing}
                                            onClick={() => {
                                              setImageChoices(current => ({
                                                ...current,
                                                [reviewKey]: candidate,
                                              }));
                                              setImageReviewConfirmed(current => ({
                                                ...current,
                                                [reviewKey]: false,
                                              }));
                                            }}
                                            className={`rounded px-2 py-1 text-[10px] font-semibold ${
                                              selected
                                                ? "bg-forest-100 text-forest-800"
                                                : "bg-forest-700 text-white hover:bg-forest-800"
                                            }`}
                                          >
                                            {selected ? "Ausgewählt" : "Foto auswählen"}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {choice && (
                              <label className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-amber-950">
                                <input
                                  type="checkbox"
                                  checked={Boolean(imageReviewConfirmed[reviewKey])}
                                  onChange={event => setImageReviewConfirmed(current => ({
                                    ...current,
                                    [reviewKey]: event.target.checked,
                                  }))}
                                  className="mt-0.5 accent-forest-700"
                                />
                                <span>
                                  Ich habe das Motiv geprüft: Es passt zum Artikel, zeigt keine thematisch unpassenden Personen und keine erkennbaren Minderjährigen ohne klaren redaktionellen Grund.
                                </span>
                              </label>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {search.status === "error" && (
                                <button
                                  type="button"
                                  disabled={publishing}
                                  onClick={() => searchAlternativeImages(a)}
                                  className="rounded border border-amber-400 px-2.5 py-1.5 text-[11px] font-medium text-amber-900 hover:bg-amber-100"
                                >
                                  Bildsuche erneut versuchen
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      <button
                        onClick={() => toggleExpand(i)}
                        className="text-xs text-forest-500 hover:text-forest-800 underline underline-offset-2 mt-2"
                      >
                        {expanded.has(i) ? "▲ zuklappen" : "▼ Volltext lesen"}
                      </button>

                      {expanded.has(i) && (
                        <div className="mt-3 pt-3 border-t border-forest-100">
                          <div className="text-xs text-forest-700 leading-relaxed whitespace-pre-wrap">{a.inhalt}</div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {a.tags.map(tag => (
                              <span key={tag} className="text-[10px] bg-forest-50 text-forest-500 px-2 py-0.5 rounded-full border border-forest-100">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 border-t border-forest-100 pt-3">
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-forest-400">
                              Originalquellen
                            </p>
                            {a.sources?.length > 0 ? (
                              <ul className="space-y-1">
                                {a.sources.map((source, sourceIndex) => (
                                  <li key={`${source.label}-${sourceIndex}`} className="text-xs text-forest-600">
                                    {source.url ? (
                                      <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline decoration-forest-300 underline-offset-2 hover:text-forest-900"
                                      >
                                        {source.label}
                                      </a>
                                    ) : source.label}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-amber-700">
                                Keine Originalquelle hinterlegt. Direkte Zitate werden nicht verwendet.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Publish button */}
          {!hasPublished && (
            <div className="mt-5">
              <button
                onClick={publishArticles}
                disabled={publishing || webCount === 0}
                className="w-full py-3 bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {publishing ? (
                  <>
                    <div className="flex gap-1">
                      {[0, 150, 300].map(d => (
                        <span key={d} className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                    <span>Wird veröffentlicht…</span>
                  </>
                ) : (
                  <>
                    <span>↑</span>
                    <span>
                      {webCount === 0 ? "Keinen Artikel ausgewählt" : `${webCount} Artikel veröffentlichen`}
                      {forNewsletter.size > 0 && ` · ${forNewsletter.size} für Newsletter vorgemerkt`}
                    </span>
                  </>
                )}
              </button>
              {webCount === 0 && (
                <p className="text-xs text-forest-400 text-center mt-1">Mindestens einen Artikel für "Web" ankreuzen.</p>
              )}
            </div>
          )}

          {/* Published confirmation */}
          {hasPublished && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800 mb-2">
                {publishedItems.length} Artikel veröffentlicht ✓
              </p>
              <ul className="space-y-1">
                {publishedItems.map(p => (
                  <li key={p.id} className="flex items-center gap-2 text-xs text-green-700">
                    <span>✓</span>
                    <span>{p.title}</span>
                    {p.imageUrl && <span className="text-green-600">· Foto gesichert</span>}
                    {(p.imageSourcePageUrl || p.imageSourceUrl) && (
                      <a
                        href={p.imageSourcePageUrl || p.imageSourceUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-green-900"
                      >
                        Commons-Quelle
                      </a>
                    )}
                    {(p.imageLicense || p.imageCredit) && (
                      <span className="text-green-600">
                        · {[p.imageLicense, p.imageCredit].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    {p.forNewsletter && <span className="bg-blue-100 text-blue-600 px-1.5 rounded-full text-[10px] font-medium">NL</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Newsletter ───────────────────────────── */}
      {hasPublished && (
        <div className="border-t border-forest-100 pt-8">
          <p className="text-xs font-semibold text-forest-500 uppercase tracking-wider mb-4">
            3 — Newsletter KW {KW}
          </p>

          {/* Article selection */}
          <p className="text-xs text-forest-500 mb-3">Welche Artikel kommen in diese Ausgabe?</p>
          <div className="space-y-2 mb-5">

            {/* Newly published */}
            {publishedItems.length > 0 && (
              <>
                <p className="text-[10px] text-forest-400 uppercase tracking-wider mb-1">Neu veröffentlicht</p>
                {publishedItems.map(p => (
                  <label key={p.id} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedNewsletterIds.has(p.id)}
                      onChange={() => toggleNewsletterArticle(p.id)}
                      className="mt-0.5 w-4 h-4 accent-forest-700"
                    />
                    <div>
                      <CategoryBadge name={p.rubrik} />
                      <p className="text-sm text-forest-800 font-medium leading-snug mt-0.5 group-hover:text-forest-600">{p.title}</p>
                    </div>
                  </label>
                ))}
              </>
            )}

            {/* Existing recent articles */}
            {existingForNewsletter.length > 0 && (
              <>
                <p className="text-[10px] text-forest-400 uppercase tracking-wider mb-1 mt-3">Frühere Artikel</p>
                {existingForNewsletter.slice(0, 8).map(a => (
                  <label key={a.id} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedNewsletterIds.has(a.id)}
                      onChange={() => toggleNewsletterArticle(a.id)}
                      className="mt-0.5 w-4 h-4 accent-forest-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <CategoryBadge name={a.categoryName} />
                        <span className="text-xs text-forest-400">{daysAgo(a.publishedAt)}</span>
                      </div>
                      <p className="text-sm text-forest-800 font-medium leading-snug mt-0.5 group-hover:text-forest-600">{a.title}</p>
                    </div>
                  </label>
                ))}
              </>
            )}
          </div>

          {/* Generate newsletter button */}
          {draftStreaming ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-2 h-2 bg-forest-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
              <span className="text-sm text-forest-600">Newsletter wird geschrieben…</span>
            </div>
          ) : (
            <button
              onClick={generateNewsletter}
              disabled={selectedNewsletterIds.size === 0}
              className="w-full py-2.5 border-2 border-forest-700 text-forest-700 hover:bg-forest-700 hover:text-white disabled:opacity-40 font-semibold rounded-xl transition-colors text-sm mb-4 flex items-center justify-center gap-2"
            >
              <span>✦</span>
              <span>{draft ? `Neu generieren (${selectedNewsletterIds.size} Artikel)` : `Newsletter-Entwurf generieren (${selectedNewsletterIds.size} Artikel)`}</span>
            </button>
          )}

          <p className="mb-4 rounded-lg border border-forest-100 bg-forest-50 px-3 py-2 text-xs text-forest-700">
            Sonntags wird ab 9 Uhr (Europe/Berlin) automatisch ein Entwurf mit saisonalem Tipp und lokaler Wetterprognose erstellt. Er wird nicht automatisch versendet.
            {autoDraftDate ? ` Geladen: ${autoDraftDate}.` : ""}
          </p>

          {draftRaw && !draft && (
            <div className="bg-forest-50 rounded-xl p-3 text-xs text-forest-600 font-mono max-h-28 overflow-hidden relative mb-4">
              <div className="whitespace-pre-wrap">{draftRaw.slice(-400)}</div>
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-forest-50" />
            </div>
          )}

          {/* Editor */}
          {(draft || editBetreff || editText) && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-forest-700 mb-1">Betreff</label>
                <input
                  type="text"
                  value={editBetreff}
                  onChange={e => setEditBetreff(e.target.value)}
                  placeholder={`germring.de | KW ${KW}: Hauptthema`}
                  className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-forest-700">Newsletter-Text</label>
                  {editText && (
                    <button onClick={() => setShowPreview(p => !p)} className="text-xs text-forest-500 underline hover:text-forest-800">
                      {showPreview ? "Bearbeiten" : "Vorschau"}
                    </button>
                  )}
                </div>
                {showPreview ? (
                  <div className="border border-forest-200 rounded-lg overflow-hidden text-sm bg-white">
                    <div className="bg-forest-800 text-white px-4 py-3">
                      <p className="font-bold text-sm">germring.de</p>
                      <p className="text-xs text-white/60">FFB Energie &amp; Zukunft</p>
                    </div>
                    <div className="p-4">
                      {editText.split(/\n\n+/).filter(Boolean).map((paragraph, index) => (
                        <NewsletterPreviewParagraph key={index} text={paragraph} />
                      ))}
                      <p className="text-[11px] text-gray-400 border-t pt-3 mt-4">
                        Du erhältst diesen Newsletter, weil du dich auf germring.de angemeldet hast. · DSGVO-konform
                      </p>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={16}
                    placeholder="Newsletter-Text…"
                    className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm text-forest-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest-400 resize-y font-sans"
                  />
                )}
                {!showPreview && (
                  <p className="mt-1 text-[11px] text-forest-400">
                    Linkmarken wie [[ARTIKEL:123]] werden beim Versand automatisch als „Mehr dazu auf germring.de“ verlinkt.
                  </p>
                )}
              </div>

              {/* Test + copy */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="test@email.de"
                  className="flex-1 border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
                <button
                  onClick={sendTestEmail}
                  disabled={testSending || !testEmail.trim() || !editBetreff.trim() || !editText.trim()}
                  className="px-4 py-2 border border-forest-300 text-forest-700 hover:bg-forest-50 disabled:opacity-40 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  {testSending ? "Sende…" : "Test-E-Mail"}
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(`Betreff: ${editBetreff}\n\n${editText}`); toast({ title: "Kopiert" }); }}
                  disabled={!editBetreff && !editText}
                  className="px-4 py-2 border border-forest-200 text-forest-600 hover:bg-forest-50 disabled:opacity-40 rounded-lg text-sm transition-colors"
                >
                  Kopieren
                </button>
              </div>
              <p className="text-xs text-forest-400 -mt-2">Test-E-Mail sendet mit "[TEST]" im Betreff an eine Adresse.</p>

              {/* Send to all */}
              {sendResult ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                  Versendet: <strong>{sendResult.sent}</strong> Empfänger
                  {sendResult.failed > 0 && <span className="text-red-600 ml-2">({sendResult.failed} fehlgeschlagen)</span>}
                </div>
              ) : (
                <button
                  onClick={sendNewsletter}
                  disabled={sending || !editBetreff.trim() || !editText.trim()}
                  className="w-full py-3 bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {sending ? "Wird gesendet…" : `An alle ${status?.subscriberCount ?? 0} Abonnenten senden`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
