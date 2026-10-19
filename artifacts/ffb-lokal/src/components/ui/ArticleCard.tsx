import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Article } from "@workspace/api-client-react";

const CATEGORY_COLORS: Record<string, string> = {
  "Energie & Erneuerbare":  "#059669",
  "Kommunalpolitik":         "#0369a1",
  "Praxis & Zukunft":        "#7c3aed",
  "Zahlen & Daten":          "#b45309",
};

function categoryColor(name?: string | null) {
  if (!name) return "#059669";
  return CATEGORY_COLORS[name] ?? "#059669";
}

function ImageAttribution({ article }: { article: Article }) {
  const sourceUrl = article.imageSourcePageUrl || article.imageSourceUrl;
  const details = [article.imageCredit, article.imageLicense].filter(Boolean);

  if (!sourceUrl && details.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-x-1.5 gap-y-1 px-3 py-2 text-[11px] leading-snug text-muted-foreground [overflow-wrap:anywhere]"
      data-testid={`image-attribution-${article.id}`}
    >
      {details.length > 0 && (
        <span>
          <span className="font-medium">Bildnachweis:</span> {details.join(" · ")}
        </span>
      )}
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Bildquelle zu „${article.title}“ (öffnet in neuem Tab)`}
          className="shrink-0 underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          data-testid={`link-image-source-${article.id}`}
        >
          Bildquelle
        </a>
      )}
    </div>
  );
}

export function ArticleCard({
  article,
  layout = "vertical",
  index,
}: {
  article: Article;
  layout?: "vertical" | "horizontal" | "feature" | "sidebar";
  index?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const publishedDate = new Date(article.publishedAt);
  const formattedDate = format(publishedDate, "d. MMMM yyyy", { locale: de });
  const color = categoryColor(article.categoryName);
  const imageSrc = article.imageUrl ?? undefined;
  const hasImage = Boolean(imageSrc) && !imageFailed;

  /* ── Feature-Karte: breites Bild, Titel als Overlay ─────────────── */
  if (layout === "feature") {
    if (!hasImage) return null;

    return (
      <article className="group relative rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 h-full">
        <Link href={`/artikel/${article.id}`} className="block cursor-pointer">
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={article.imageUrl!}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span
                className="inline-block text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3"
                style={{ background: color + "cc" }}
              >
                {article.categoryName}
              </span>
              <h3 className="font-serif font-bold text-2xl text-white leading-tight mb-1 line-clamp-2">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="text-white/70 text-sm line-clamp-2">{article.excerpt}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-t border-border/30 bg-card/80">
            <span className="text-xs text-muted-foreground">
              {formattedDate}
              {article.readingMinutes ? ` · ${article.readingMinutes} Min. Lesezeit` : ""}
            </span>
            <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Lesen →
            </span>
          </div>
        </Link>
        <ImageAttribution article={article} />
      </article>
    );
  }

  /* ── Sidebar-Karte: kleines Bild, kompakter Text ─────────────────── */
  if (layout === "sidebar") {
    return (
      <article className="group flex flex-col rounded-xl overflow-hidden border border-border/40 bg-card shadow-sm hover:shadow-lg hover:shadow-emerald-900/8 transition-all duration-300 h-full">
        <Link href={`/artikel/${article.id}`} className="flex flex-col flex-1 cursor-pointer">
          {hasImage && (
            <div className="relative overflow-hidden aspect-video">
              <img
                src={article.imageUrl!}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={() => setImageFailed(true)}
              />
              <span
                className="absolute top-2 left-2 text-white text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: color + "cc" }}
              >
                {article.categoryName}
              </span>
            </div>
          )}
          <div className="p-3 flex flex-col flex-1">
            {!hasImage && (
              <span className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                {article.categoryName}
              </span>
            )}
            <h3 className="font-serif font-bold text-sm leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-3">
              {article.title}
            </h3>
            <span className="text-xs text-muted-foreground mt-auto">
              {formattedDate}
              {article.readingMinutes ? ` · ${article.readingMinutes} Min.` : ""}
            </span>
          </div>
        </Link>
        {hasImage && <ImageAttribution article={article} />}
      </article>
    );
  }

  /* ── Horizontal-Karte: Bild links, Text rechts (mit Nummern-Akzent) */
  if (layout === "horizontal") {
    return (
      <article className="group flex gap-4 items-start">
        {typeof index === "number" && (
          <span className="font-serif font-black text-5xl text-muted-foreground/15 leading-none select-none shrink-0 translate-y-1">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="inline-block text-white text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: color }}
            >
              {article.categoryName}
            </span>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
          <Link href={`/artikel/${article.id}`}>
            <h3 className="font-serif font-bold text-lg leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2 cursor-pointer">
              {article.title}
            </h3>
          </Link>
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{article.excerpt}</p>
          )}
          {article.readingMinutes && (
            <span className="text-xs text-muted-foreground">{article.readingMinutes} Min. Lesezeit</span>
          )}
        </div>
      </article>
    );
  }

  /* ── Vertical (Standard) ─────────────────────────────────────────── */
  return (
    <article className="card-hover group flex flex-col h-full rounded-2xl overflow-hidden border border-border/40 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/10 hover:-translate-y-0.5">
      {hasImage ? (
        <Link href={`/artikel/${article.id}`} className="block relative overflow-hidden aspect-video shrink-0">
          <img
            src={article.imageUrl!}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
          <span
            className="absolute top-3 left-3 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: color + "cc" }}
          >
            {article.categoryName}
          </span>
        </Link>
      ) : (
        <div className="px-5 pt-5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {article.categoryName}
          </span>
        </div>
      )}
      {hasImage && <ImageAttribution article={article} />}
      <div className="flex flex-col flex-1 p-5">
        <span className="text-xs text-muted-foreground mb-2">{formattedDate}</span>
        <Link href={`/artikel/${article.id}`} className="mb-2 block">
          <h3 className="font-serif font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-3">
            {article.title}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">{article.excerpt}</p>
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          {article.readingMinutes && (
            <span className="text-xs text-muted-foreground">{article.readingMinutes} Min. Lesezeit</span>
          )}
          <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
            Lesen →
          </span>
        </div>
      </div>
    </article>
  );
}
