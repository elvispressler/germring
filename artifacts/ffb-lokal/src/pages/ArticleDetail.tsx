import { useState } from "react";
import { useParams } from "wouter";
import { useGetArticle, useListArticles, getGetArticleQueryKey, getListArticlesQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { SponsorBox } from "@/components/ui/SponsorBox";
import { usePageMeta } from "@/hooks/usePageMeta";
import { GLOSSARY_TERMS, linkifyContent, type GlossaryTerm } from "@/lib/keywordLinks";

function publicImageUrl(imageUrl: string | null | undefined) {
  try {
    const url = new URL(imageUrl || "/opengraph.jpg", "https://germring.de");
    return url.protocol === "https:" ? url.href : "https://germring.de/opengraph.jpg";
  } catch {
    return "https://germring.de/opengraph.jpg";
  }
}

export function ArticleDetailPage() {
  const [glossaryTerm, setGlossaryTerm] = useState<GlossaryTerm | null>(null);
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);

  const { data: article, isLoading } = useGetArticle(numId, {
    query: { enabled: !!numId, queryKey: getGetArticleQueryKey(numId) },
  });

  const { data: related } = useListArticles(
    { categorySlug: article?.categorySlug, limit: 3 },
    {
      query: {
        enabled: !!article?.categorySlug,
        queryKey: getListArticlesQueryKey({ categorySlug: article?.categorySlug, limit: 3 }),
      },
    }
  );

  usePageMeta({
    title: article ? article.title : "Artikel",
    description: article ? article.excerpt : undefined,
    path: `/artikel/${article?.id ?? id}`,
    ogImage: article?.imageUrl ?? undefined,
    ogType: "article",
    article: article
      ? { publishedAt: article.publishedAt, author: article.author, section: article.categoryName }
      : undefined,
    jsonLd: article
      ? {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `https://germring.de/artikel/${article.id}#article`,
              headline: article.title,
              description: article.excerpt,
              image: [publicImageUrl(article.imageUrl)],
              datePublished: article.publishedAt,
              dateModified: article.publishedAt,
              author: { "@type": "Organization", name: article.author },
              publisher: {
                "@type": "NewsMediaOrganization",
                name: "FFB Energie & Zukunft",
                url: "https://germring.de",
                logo: { "@type": "ImageObject", url: "https://germring.de/logo.png" },
              },
              articleSection: article.categoryName,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://germring.de/artikel/${article.id}`,
              },
              inLanguage: "de-DE",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Startseite",
                  item: "https://germring.de/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: article.categoryName,
                  item: `https://germring.de/kategorie/${encodeURIComponent(article.categorySlug)}`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: article.title,
                  item: `https://germring.de/artikel/${article.id}`,
                },
              ],
            },
          ],
        }
      : undefined,
  });

  if (isLoading) {
    return <LogoLoader className="min-h-[58vh]" label="Artikel wird geladen" />;
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl py-24 text-center">
        <h1 className="text-2xl font-serif font-bold text-forest-900 mb-4">Artikel nicht gefunden</h1>
        <p className="text-forest-500">Der gesuchte Artikel existiert nicht oder wurde entfernt.</p>
      </div>
    );
  }

  const relatedFiltered = related?.filter(a => a.id !== article.id).slice(0, 2) ?? [];
  const sources: Array<{ label: string; url?: string | null }> = (article as unknown as { sources?: Array<{ label: string; url?: string | null }> }).sources ?? [];


  return (
    <div className="container mx-auto px-4 lg:px-8 max-w-3xl py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-forest-400 mb-6 flex items-center gap-2">
        <a href="/" className="hover:text-forest-700 transition-colors">Startseite</a>
        <span>/</span>
        <a href={`/kategorie/${article.categorySlug}`} className="hover:text-forest-700 transition-colors">{article.categoryName}</a>
        <span>/</span>
        <span className="text-forest-600 truncate max-w-[200px]">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <Badge className="mb-4 text-xs font-semibold" style={{ background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))", border: "none" }}>
          {article.categoryName}
        </Badge>
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-forest-900 leading-tight mb-4">
          {article.title}
        </h1>
        <p className="text-lg text-forest-500 leading-relaxed mb-5">{article.excerpt}</p>
        <div className="flex items-center gap-3 text-sm text-forest-400 border-t border-forest-100 pt-4">
          <span>{article.author}</span>
          <span>·</span>
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
          </time>
          <span>·</span>
          <span>{article.readingMinutes} Min. Lesezeit</span>
        </div>
      </header>

      {/* Hero image */}
      {article.imageUrl && (
        <figure className="mb-8 rounded-xl overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-64 lg:h-96 object-cover"
            loading="lazy"
          />
          {(article.imageSourcePageUrl || article.imageSourceUrl || article.imageLicense || article.imageCredit) && (
            <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-forest-50 px-3 py-2 text-xs text-forest-500">
              <span
                className="min-w-0 flex-1 [overflow-wrap:anywhere]"
                data-testid="text-image-credit"
              >
                {[article.imageCredit, article.imageLicense].filter(Boolean).join(" · ")}
              </span>
              {(article.imageSourcePageUrl || article.imageSourceUrl) && (
                <a
                  href={article.imageSourcePageUrl || article.imageSourceUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-forest-800"
                  data-testid="link-image-source"
                >
                  Bildquelle
                </a>
              )}
            </figcaption>
          )}
        </figure>
      )}

      {/* Article body */}
      <div
        className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-primary prose-strong:font-semibold"
        data-testid="content-article-body"
        onClick={(event) => {
          const target = event.target as HTMLElement;
          const trigger = target.closest<HTMLElement>("[data-glossary-term]");
          const glossaryKey = trigger?.dataset.glossaryTerm;
          if (glossaryKey && GLOSSARY_TERMS[glossaryKey]) {
            setGlossaryTerm(GLOSSARY_TERMS[glossaryKey]);
          }
        }}
        dangerouslySetInnerHTML={{ __html: linkifyContent(article.content.replace(/\n/g, "<br/>")) }}
      />

      {glossaryTerm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/25 p-3 sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setGlossaryTerm(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="energiewende-title"
            className="w-full max-w-lg rounded-2xl border border-forest-100 bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-forest-400">
                  Begriff erklärt
                </p>
                <h2 id="glossary-term-title" className="font-serif text-2xl font-bold text-forest-900">
                  {glossaryTerm.label}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setGlossaryTerm(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-50 text-xl leading-none text-forest-600 hover:bg-forest-100"
                aria-label="Erklärung schließen"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-[15px] leading-7 text-forest-700">{glossaryTerm.definition}</p>

            <div className="mt-5 border-t border-forest-100 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-forest-400">
                Weiterlesen bei
              </h3>
              <ul className="mt-3 space-y-2.5">
                {glossaryTerm.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 rounded-lg border border-forest-100 px-3.5 py-3 text-left hover:border-forest-300 hover:bg-forest-50"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-forest-800 group-hover:text-primary">
                          {source.label}
                        </span>
                        <span className="block text-xs text-forest-400">{source.detail}</span>
                      </span>
                      <span className="text-forest-400" aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-forest-100">
          {article.tags.map(tag => (
            <span key={tag} className="text-xs font-medium bg-forest-50 text-forest-500 px-2.5 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <aside className="mt-8 pt-6 border-t border-forest-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-forest-400 mb-3">Quellen</h3>
          <ul className="space-y-1.5">
            {sources.map((src, i) => (
              <li key={i} className="text-sm text-forest-500 flex items-start gap-2">
                <span className="mt-0.5 text-forest-300 select-none">↳</span>
                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-forest-800 underline underline-offset-2 decoration-forest-300 transition-colors"
                  >
                    {src.label}
                  </a>
                ) : (
                  <span>{src.label}</span>
                )}
              </li>
            ))}
          </ul>
        </aside>
      )}

      <SponsorBox categorySlug={article.categorySlug} />

      {relatedFiltered && relatedFiltered.length > 0 && (
        <section className="mt-12 pt-10 border-t border-forest-100">
          <h2 className="text-xl font-serif font-bold text-forest-900 mb-6">Weitere Artikel aus {article.categoryName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {relatedFiltered.map(a => (
              <ArticleCard key={a.id} article={a} data-testid={`card-related-${a.id}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
