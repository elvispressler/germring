export const SITE_URL = "https://germring.de";
export const DEFAULT_SITE_TITLE = "germring.de | FFB Energie & Zukunft";
export const DEFAULT_DESCRIPTION =
  "Faktenbasiertes Lokalmedium für Erneuerbare Energien, Kommunalpolitik und die Zukunft des Landkreises Fürstenfeldbruck. Fakten vor Meinung, ohne Parolen.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph.jpg`;

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizePath(path) {
  let pathname = "/";
  try {
    pathname = new URL(path || "/", SITE_URL).pathname;
  } catch {
    pathname = "/";
  }
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
}

export function absolutePublicUrl(value, fallback = DEFAULT_OG_IMAGE) {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    const url = new URL(value, SITE_URL);
    return url.protocol === "https:" ? url.href : fallback;
  } catch {
    return fallback;
  }
}

function fullTitle(title) {
  const normalized = String(title || "germring.de")
    .replace(/\s+[—–-]\s+germring\.de$/i, "")
    .trim();
  if (normalized.toLowerCase() === "germring.de") return DEFAULT_SITE_TITLE;
  return `${normalized} | germring.de`;
}

function safeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function safeSourceUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value, SITE_URL);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function displayDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(date);
}

function breadcrumbSchema(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function createWebPageSeo({
  path,
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG_IMAGE,
  robots = "index, follow",
  jsonLd,
  ogType = "website",
}) {
  const canonicalPath = normalizePath(path);
  const canonicalUrl = new URL(canonicalPath, SITE_URL).href;
  const pageTitle = fullTitle(title);

  return {
    path: canonicalPath,
    title: pageTitle,
    description: String(description || DEFAULT_DESCRIPTION).trim(),
    canonicalUrl,
    imageUrl: absolutePublicUrl(image),
    robots,
    ogType,
    jsonLd:
      jsonLd === undefined
        ? {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: pageTitle,
            description: String(description || DEFAULT_DESCRIPTION).trim(),
            url: canonicalUrl,
            inLanguage: "de-DE",
          }
        : jsonLd,
  };
}

export function createHomeSeo() {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  return createWebPageSeo({
    path: "/",
    title: "germring.de",
    description: DEFAULT_DESCRIPTION,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "NewsMediaOrganization",
          "@id": organizationId,
          name: "FFB Energie & Zukunft",
          url: SITE_URL,
          description: DEFAULT_DESCRIPTION,
          logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
          areaServed: {
            "@type": "AdministrativeArea",
            name: "Landkreis Fürstenfeldbruck",
          },
          inLanguage: "de-DE",
        },
        {
          "@type": "WebSite",
          "@id": websiteId,
          name: "germring.de",
          url: SITE_URL,
          inLanguage: "de-DE",
          publisher: { "@id": organizationId },
        },
      ],
    },
  });
}

export function createArticleSeo(article) {
  const path = `/artikel/${Number(article.id)}`;
  const canonicalUrl = new URL(path, SITE_URL).href;
  const publishedAt = safeDate(article.publishedAt);
  const imageUrl = absolutePublicUrl(article.imageUrl);
  const title = fullTitle(article.title);
  const description = String(article.excerpt || DEFAULT_DESCRIPTION).trim();
  const graph = [
    {
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      headline: String(article.title || ""),
      description,
      image: [imageUrl],
      datePublished: publishedAt,
      dateModified: publishedAt,
      author: {
        "@type": "Organization",
        name: String(article.author || "germring.de Redaktion"),
      },
      publisher: {
        "@type": "NewsMediaOrganization",
        name: "FFB Energie & Zukunft",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      },
      articleSection: String(article.categoryName || ""),
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
      inLanguage: "de-DE",
    },
    breadcrumbSchema([
      { name: "Startseite", url: `${SITE_URL}/` },
      {
        name: String(article.categoryName || "Themen"),
        url: new URL(`/kategorie/${encodeURIComponent(article.categorySlug || "")}`, SITE_URL).href,
      },
      { name: String(article.title || ""), url: canonicalUrl },
    ]),
  ];

  return {
    path,
    title,
    description,
    canonicalUrl,
    imageUrl,
    robots: "index, follow",
    ogType: "article",
    article: {
      publishedAt,
      author: String(article.author || ""),
      section: String(article.categoryName || ""),
    },
    jsonLd: { "@context": "https://schema.org", "@graph": graph },
  };
}

export function createCategorySeo(category, slug) {
  const path = `/kategorie/${encodeURIComponent(slug)}`;
  const canonicalUrl = new URL(path, SITE_URL).href;
  const name = String(category?.name || slug);
  const description = String(
    category?.description ||
      `Alle Artikel aus der Rubrik ${name} auf germring.de.`,
  ).trim();
  const title = fullTitle(name);

  return {
    path,
    title,
    description,
    canonicalUrl,
    imageUrl: DEFAULT_OG_IMAGE,
    robots: "index, follow",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name,
          description,
          url: canonicalUrl,
          inLanguage: "de-DE",
        },
        breadcrumbSchema([
          { name: "Startseite", url: `${SITE_URL}/` },
          { name, url: canonicalUrl },
        ]),
      ],
    },
  };
}

function metaTag(attribute, name, content) {
  return `<meta ${attribute}="${escapeHtml(name)}" content="${escapeHtml(content)}" />`;
}

function safeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function buildSeoHead(meta) {
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    metaTag("name", "description", meta.description),
    metaTag("name", "robots", meta.robots || "index, follow"),
    `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`,
    metaTag("property", "og:title", meta.title),
    metaTag("property", "og:description", meta.description),
    metaTag("property", "og:type", meta.ogType || "website"),
    metaTag("property", "og:url", meta.canonicalUrl),
    metaTag("property", "og:image", meta.imageUrl),
    metaTag("property", "og:image:alt", meta.title),
    metaTag("property", "og:locale", "de_DE"),
    metaTag("property", "og:site_name", "germring.de"),
    metaTag("name", "twitter:card", "summary_large_image"),
    metaTag("name", "twitter:title", meta.title),
    metaTag("name", "twitter:description", meta.description),
    metaTag("name", "twitter:image", meta.imageUrl),
  ];

  if (meta.article?.publishedAt) {
    tags.push(metaTag("property", "article:published_time", meta.article.publishedAt));
  }
  if (meta.article?.author) {
    tags.push(metaTag("property", "article:author", meta.article.author));
  }
  if (meta.article?.section) {
    tags.push(metaTag("property", "article:section", meta.article.section));
  }
  if (meta.jsonLd) {
    tags.push(
      `<script type="application/ld+json" data-seo-id="page">${safeJsonLd(meta.jsonLd)}</script>`,
    );
  }

  return tags.join("\n    ");
}

function stripSeoTags(html) {
  return html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(
      /<meta\b(?=[^>]*\bname=["'](?:description|robots|twitter:[^"']+)["'])[^>]*\/?>/gi,
      "",
    )
    .replace(
      /<meta\b(?=[^>]*\bproperty=["'](?:og:[^"']+|article:[^"']+)["'])[^>]*\/?>/gi,
      "",
    )
    .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\/?>/gi, "")
    .replace(
      /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi,
      "",
    );
}

export function injectPageSeo(html, meta, fallbackHtml = "") {
  const cleaned = stripSeoTags(html);
  const withHead = cleaned.replace(
    /<\/head>/i,
    `    ${buildSeoHead(meta)}\n  </head>`,
  );
  const withFallback = withHead.replace(
    /<div\s+id=["']seo-fallback["']\s*>\s*<\/div>/i,
    () => fallbackHtml,
  );
  return withFallback;
}

export function renderSimpleFallback(meta, body = "") {
  return `<main id="seo-fallback" class="seo-fallback">
  <header><a href="/">germring.de — FFB Energie &amp; Zukunft</a></header>
  <h1>${escapeHtml(meta.heading || meta.title)}</h1>
  <p>${escapeHtml(meta.description)}</p>
  ${body}
</main>`;
}

function renderArticleBody(content) {
  return String(content || "")
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export function renderArticleFallback(article, meta) {
  const categoryUrl = `/kategorie/${encodeURIComponent(article.categorySlug || "")}`;
  const sourceUrl = safeSourceUrl(article.imageSourcePageUrl);
  const image = article.imageUrl
    ? `<figure><img src="${escapeHtml(meta.imageUrl)}" alt="${escapeHtml(article.title)}" width="1200" height="675" /><figcaption>${article.imageCredit ? `${escapeHtml(article.imageCredit)}${article.imageLicense ? " · " : ""}` : ""}${escapeHtml(article.imageLicense || "")}${sourceUrl ? ` · <a href="${escapeHtml(sourceUrl)}" rel="noopener noreferrer">Bildquelle</a>` : ""}</figcaption></figure>`
    : "";
  const publishedAt = meta.article?.publishedAt || "";

  return `<main id="seo-fallback" class="seo-fallback">
  <header><a href="/">germring.de — FFB Energie &amp; Zukunft</a></header>
  <nav aria-label="Brotkrumennavigation"><a href="/">Startseite</a> / <a href="${categoryUrl}">${escapeHtml(article.categoryName || "Themen")}</a></nav>
  <article>
    <h1>${escapeHtml(article.title)}</h1>
    <p class="seo-fallback__excerpt">${escapeHtml(article.excerpt)}</p>
    <p class="seo-fallback__byline">${escapeHtml(article.author)} · <time datetime="${escapeHtml(publishedAt)}">${escapeHtml(displayDate(article.publishedAt))}</time></p>
    ${image}
    <div class="seo-fallback__content">${renderArticleBody(article.content)}</div>
  </article>
</main>`;
}

export function renderHomeFallback(articles = []) {
  const items = articles
    .slice(0, 8)
    .map(
      (article) =>
        `<li><a href="/artikel/${Number(article.id)}">${escapeHtml(article.title)}</a><p>${escapeHtml(article.excerpt)}</p></li>`,
    )
    .join("\n");
  const list = items ? `<ul>${items}</ul>` : "";
  return renderSimpleFallback(
    {
      title: DEFAULT_SITE_TITLE,
      heading: "FFB Energie & Zukunft",
      description: DEFAULT_DESCRIPTION,
    },
    `<section><h2>Aktuelle Beiträge aus dem Landkreis</h2>${list}</section>`,
  );
}

export function renderCategoryFallback(category, articles = []) {
  const items = articles
    .slice(0, 20)
    .map(
      (article) =>
        `<li><a href="/artikel/${Number(article.id)}">${escapeHtml(article.title)}</a><p>${escapeHtml(article.excerpt)}</p></li>`,
    )
    .join("\n");
  return renderSimpleFallback(
    {
      title: String(category?.name || "Themen"),
      heading: String(category?.name || "Themen"),
      description: String(category?.description || "Artikel aus dem Landkreis Fürstenfeldbruck."),
    },
    items ? `<ul>${items}</ul>` : "",
  );
}

function renderNewsletterContent(content) {
  return String(content || "")
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const parts = paragraph.split(/(\[\[ARTIKEL:\d+\]\])/g);
      const rendered = parts
        .map((part) => {
          const articleLink = part.match(/^\[\[ARTIKEL:(\d+)\]\]$/);
          if (articleLink) {
            return `<a href="/artikel/${Number(articleLink[1])}">Mehr dazu auf germring.de →</a>`;
          }
          return escapeHtml(part).replace(/\n/g, "<br />");
        })
        .join("");
      const letters = paragraph.replace(/[^A-Za-zÄÖÜäöüß]/g, "");
      const isHeading =
        paragraph.length <= 120
        && letters.length >= 8
        && letters === letters.toUpperCase();

      if (/^\[\[ARTIKEL:\d+\]\]$/.test(paragraph)) return `<p>${rendered}</p>`;
      return isHeading ? `<h4>${rendered}</h4>` : `<p>${rendered}</p>`;
    })
    .join("\n");
}

export function renderNewsletterArchiveFallback(issues = []) {
  const entries = issues
    .slice(0, 8)
    .map((issue) => {
      const sentAt = safeDate(issue.sentAt);
      const date = sentAt
        ? `<p><time datetime="${escapeHtml(sentAt)}">${escapeHtml(displayDate(sentAt))}</time></p>`
        : "";
      return `<article>
  <h3>${escapeHtml(issue.subject)}</h3>
  ${date}
  ${renderNewsletterContent(issue.content)}
</article>`;
    })
    .join("\n");

  return renderSimpleFallback(
    {
      title: "Newsletter: Energie und Zukunft im Landkreis FFB | germring.de",
      heading: "Newsletter: Energie und Zukunft im Landkreis FFB",
      description:
        "Die wichtigsten Nachrichten zu Energie, Kommunalpolitik und Klimaschutz im Landkreis Fürstenfeldbruck – regelmäßig im germring.de-Newsletter.",
    },
    `<section><h2>Vergangene Ausgaben</h2>${entries}</section>`,
  );
}

