import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { adminFetch, readApiError } from "@/lib/adminFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Article = {
  id: number;
  title: string;
  excerpt: string;
  categoryId: number;
  categoryName: string;
  imageUrl: string | null;
};

type Candidate = {
  title: string;
  imageUrl: string;
  previewUrl: string;
  sourceUrl: string;
  license: string;
  credit: string;
};

type SearchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; candidates: Candidate[] };

export function AdminBilderPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searches, setSearches] = useState<Record<number, SearchState>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BASE}/api/articles?limit=100`);
      if (!response.ok) throw new Error(await readApiError(response, "Artikel konnten nicht geladen werden."));
      setArticles(await response.json() as Article[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Artikel konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadArticles(); }, [loadArticles]);

  const search = async (article: Article) => {
    setMessage("");
    setSearches(current => ({ ...current, [article.id]: { status: "loading" } }));
    try {
      const response = await adminFetch(`${BASE}/api/articles/images/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          excerpt: article.excerpt,
          categoryId: article.categoryId,
        }),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Bildsuche fehlgeschlagen."));
      const result = await response.json() as { candidates: Candidate[] };
      setSearches(current => ({ ...current, [article.id]: { status: "ready", candidates: result.candidates } }));
    } catch (err) {
      setSearches(current => ({
        ...current,
        [article.id]: {
          status: "error",
          message: err instanceof Error ? err.message : "Bildsuche fehlgeschlagen.",
        },
      }));
    }
  };

  const assign = async (article: Article, candidate: Candidate) => {
    setSavingId(article.id);
    setError("");
    setMessage("");
    try {
      const response = await adminFetch(`${BASE}/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: candidate.imageUrl,
          imageSourcePageUrl: candidate.sourceUrl,
          imageLicense: candidate.license,
          imageCredit: candidate.credit,
        }),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Bild konnte nicht gespeichert werden."));
      setMessage(`Passendes Bild für „${article.title}“ gespeichert.`);
      setSearches(current => {
        const next = { ...current };
        delete next[article.id];
        return next;
      });
      await loadArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bild konnte nicht gespeichert werden.");
    } finally {
      setSavingId(null);
    }
  };

  const needsPhoto = articles.filter(article => !article.imageUrl);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-500">Redaktion · Bildpflege</p>
          <h1 className="mt-1 text-2xl font-bold text-forest-900">Artikelbilder vervollständigen</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-forest-600">
            Für Artikel ohne eigenes, verwendbares Vorschaubild passende, einzigartige Motive aus Wikimedia Commons suchen.
            Bitte Motiv, Lizenz und Quellenangabe vor der Auswahl prüfen.
          </p>
        </div>
        <Link href="/admin" className="shrink-0 text-sm text-forest-600 underline underline-offset-2">Zurück zum Admin</Link>
      </div>

      <div className="mt-6 rounded-xl border border-forest-100 bg-forest-50 p-4 text-sm text-forest-800">
        {loading ? "Artikel werden geladen …" : `${needsPhoto.length} von ${articles.length} Artikeln benötigen ein passendes Einzelbild.`}
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}

      <div className="mt-6 space-y-4">
        {needsPhoto.map(article => {
          const state = searches[article.id];
          return (
            <section key={article.id} className="rounded-xl border border-forest-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs text-forest-500">{article.categoryName} · Artikel #{article.id}</p>
                  <h2 className="mt-1 font-semibold text-forest-900">{article.title}</h2>
                  <p className="mt-1 text-sm text-forest-600">{article.excerpt}</p>
                </div>
                <button
                  type="button"
                  disabled={state?.status === "loading" || savingId === article.id}
                  onClick={() => void search(article)}
                  className="shrink-0 rounded-lg bg-forest-700 px-3 py-2 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-50"
                >
                  {state?.status === "loading" ? "Suche läuft …" : state ? "Erneut suchen" : "Bildvorschläge suchen"}
                </button>
              </div>
              {state?.status === "error" && <p role="alert" className="mt-3 text-sm text-red-700">{state.message}</p>}
              {state?.status === "ready" && (state.candidates.length === 0
                ? <p className="mt-3 text-sm text-amber-800">Keine passenden freien Vorschläge gefunden. Bitte später erneut versuchen.</p>
                : <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {state.candidates.map(candidate => (
                      <article key={candidate.imageUrl} className="overflow-hidden rounded-lg border border-forest-100">
                        <img src={candidate.previewUrl} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-36 w-full object-cover" />
                        <div className="p-3">
                          <p className="text-sm font-medium text-forest-900">{candidate.title}</p>
                          <p className="mt-1 text-xs text-forest-600">Lizenz: {candidate.license}</p>
                          <p className="mt-1 text-xs text-forest-600">Bildnachweis: {candidate.credit || "Kein Credit angegeben"}</p>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <a href={candidate.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-forest-700 underline">Quelle prüfen</a>
                            <button
                              type="button"
                              disabled={savingId === article.id}
                              onClick={() => void assign(article, candidate)}
                              className="rounded-md bg-forest-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-800 disabled:opacity-50"
                            >
                              {savingId === article.id ? "Speichert …" : "Bild zuordnen"}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
              )}
            </section>
          );
        })}
        {!loading && needsPhoto.length === 0 && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            Alle Artikel haben ein eigenes verwendbares Bild.
          </p>
        )}
      </div>
    </main>
  );
}
