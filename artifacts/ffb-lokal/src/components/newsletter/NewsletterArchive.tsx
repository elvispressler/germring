import { useEffect, useRef, useState } from "react";

type NewsletterIssue = {
  id: number;
  subject: string;
  content: string;
  sentAt: string | null;
};

type ArchiveState = "loading" | "ready" | "error";

type NewsletterArchivePage = {
  issues: NewsletterIssue[];
  nextCursor: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNewsletterArchivePage(data: unknown): NewsletterArchivePage {
  if (!isRecord(data) || !Array.isArray(data.issues)) {
    throw new Error("Ungültige Archiv-Antwort.");
  }

  if (
    data.nextCursor !== null
    && (typeof data.nextCursor !== "string" || data.nextCursor.trim().length === 0)
  ) {
    throw new Error("Ungültige Archiv-Antwort.");
  }

  const issues = data.issues.map((issue): NewsletterIssue => {
    if (
      !isRecord(issue)
      || !Number.isSafeInteger(issue.id)
      || (issue.id as number) <= 0
      || typeof issue.subject !== "string"
      || issue.subject.trim().length === 0
      || typeof issue.content !== "string"
      || issue.content.trim().length === 0
      || (
        issue.sentAt !== null
        && (
          typeof issue.sentAt !== "string"
          || !Number.isFinite(new Date(issue.sentAt).getTime())
          || new Date(issue.sentAt).toISOString() !== issue.sentAt
        )
      )
    ) {
      throw new Error("Ungültige Archiv-Ausgabe.");
    }

    return {
      id: issue.id as number,
      subject: issue.subject,
      content: issue.content,
      sentAt: issue.sentAt,
    };
  });

  return {
    issues,
    nextCursor: data.nextCursor as string | null,
  };
}

function NewsletterIssueBody({ content }: { content: string }) {
  const paragraphs = content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground/85">
      {paragraphs.map((paragraph, index) => {
        const linkOnly = paragraph.match(/^\[\[ARTIKEL:(\d+)\]\]$/);
        if (linkOnly) {
          return (
            <p key={index}>
              <a className="font-semibold text-primary underline underline-offset-4" href={`/artikel/${linkOnly[1]}`}>
                Mehr dazu auf germring.de →
              </a>
            </p>
          );
        }

        const letters = paragraph.replace(/[^A-Za-zÄÖÜäöüß]/g, "");
        const isHeading = paragraph.length <= 120 && letters.length >= 8 && letters === letters.toUpperCase();
        const parts = paragraph.split(/(\[\[ARTIKEL:\d+\]\])/g);
        const textContent = (
          <>
            {parts.map((part, partIndex) => {
              const articleLink = part.match(/^\[\[ARTIKEL:(\d+)\]\]$/);
              if (articleLink) {
                return (
                  <a
                    key={partIndex}
                    className="font-semibold text-primary underline underline-offset-4"
                    href={`/artikel/${articleLink[1]}`}
                  >
                    Mehr dazu auf germring.de →
                  </a>
                );
              }

              const lines = part.split("\n");
              return lines.map((line, lineIndex) => (
                <span key={`${partIndex}-${lineIndex}`}>
                  {line}
                  {lineIndex < lines.length - 1 && <br />}
                </span>
              ));
            })}
          </>
        );

        return isHeading
          ? <h3 key={index} className="pt-2 font-serif text-lg font-bold text-primary">{textContent}</h3>
          : <p key={index}>{textContent}</p>;
      })}
    </div>
  );
}

function getExcerpt(content: string) {
  const paragraphs = content
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const firstParagraph = (paragraphs[0] === "Hallo," ? paragraphs[1] : paragraphs[0])
    ?.replace(/\[\[ARTIKEL:\d+\]\]/g, "")
    .trim() ?? "";

  return firstParagraph.length > 220 ? `${firstParagraph.slice(0, 217)}…` : firstParagraph;
}

export function NewsletterArchive() {
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [state, setState] = useState<ArchiveState>("loading");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoadAttempt, setInitialLoadAttempt] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    let active = true;

    setState("loading");
    fetch("/api/newsletter/archive")
      .then(async (response) => {
        if (!response.ok) throw new Error("Archiv konnte nicht geladen werden.");
        return parseNewsletterArchivePage(await response.json());
      })
      .then((data) => {
        if (active) {
          setIssues(data.issues);
          setNextCursor(data.nextCursor);
          setState("ready");
        }
      })
      .catch(() => {
        if (active) setState("error");
      });

    return () => {
      active = false;
    };
  }, [initialLoadAttempt]);

  async function loadMoreIssues() {
    if (!nextCursor || isLoadingMoreRef.current) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(false);
    try {
      const response = await fetch(`/api/newsletter/archive?cursor=${encodeURIComponent(nextCursor)}`);
      if (!response.ok) throw new Error("Weitere Ausgaben konnten nicht geladen werden.");

      const data = parseNewsletterArchivePage(await response.json());

      setIssues((currentIssues) => [...currentIssues, ...data.issues]);
      setNextCursor(data.nextCursor);
    } catch {
      setLoadMoreError(true);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }

  return (
    <section className="mt-20" aria-labelledby="newsletter-archive-heading">
      <div className="mb-7 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Ein Blick in den Newsletter</p>
        <h2 id="newsletter-archive-heading" className="mb-3 text-2xl font-serif font-bold">
          Vergangene Ausgaben
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Lies nach, welche Themen, Zahlen und Einordnungen im germring.de-Newsletter landen.
        </p>
      </div>

      {state === "loading" ? (
        <div className="space-y-3" aria-label="Newsletter-Archiv wird geladen" aria-busy="true">
          <div className="h-28 animate-pulse rounded-2xl border bg-card" />
          <div className="h-28 animate-pulse rounded-2xl border bg-card" />
        </div>
      ) : state === "error" ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4">
          <p className="mb-3 text-sm text-muted-foreground" role="status">
            Die Archivdaten konnten nicht geladen werden. Bitte versuche es erneut.
          </p>
          <button
            type="button"
            onClick={() => setInitialLoadAttempt((attempt) => attempt + 1)}
            data-testid="button-retry-newsletter-archive"
            className="min-h-11 rounded-xl border border-primary/25 bg-card px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Erneut versuchen
          </button>
        </div>
      ) : issues.length === 0 ? (
        <div className="rounded-2xl border bg-card px-6 py-8 text-center">
          <p className="mb-2 font-serif text-lg font-bold">Die ersten Ausgaben folgen hier</p>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
            Bisher wurden Newsletter-Ausgaben nicht archiviert. Ab dem nächsten Versand findest du hier die tatsächlich versendeten Inhalte.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <details key={issue.id} className="group overflow-hidden rounded-2xl border bg-card">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-6 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <time className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground" dateTime={issue.sentAt ?? undefined}>
                    {issue.sentAt
                      ? new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(issue.sentAt))
                      : "Datum nicht verfügbar"}
                  </time>
                  <h3 className="font-serif text-lg font-bold text-primary">{issue.subject}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{getExcerpt(issue.content)}</p>
                </div>
                <span aria-hidden="true" className="mt-1 shrink-0 text-xl font-light text-primary transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t bg-muted/20 px-5 py-6 sm:px-6">
                <NewsletterIssueBody content={issue.content} />
              </div>
            </details>
          ))}

          {nextCursor && (
            <div className="pt-3">
              {loadMoreError && (
                <p className="mb-3 text-sm text-destructive" role="status">
                  Weitere Ausgaben konnten gerade nicht geladen werden. Bitte versuche es erneut.
                </p>
              )}
              <button
                type="button"
                onClick={loadMoreIssues}
                disabled={isLoadingMore}
                aria-busy={isLoadingMore}
                data-testid="button-load-more-newsletters"
                className="min-h-11 w-full rounded-xl border border-primary/25 bg-card px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                {isLoadingMore
                  ? "Weitere Ausgaben werden geladen …"
                  : loadMoreError
                    ? "Erneut versuchen"
                    : "Weitere Ausgaben laden"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}