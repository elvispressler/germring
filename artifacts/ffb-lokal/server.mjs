import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_DESCRIPTION,
  createArticleSeo,
  createCategorySeo,
  createHomeSeo,
  createWebPageSeo,
  injectPageSeo,
  normalizePath,
  renderArticleFallback,
  renderCategoryFallback,
  renderHomeFallback,
  renderNewsletterArchiveFallback,
  renderSimpleFallback,
} from "./src/lib/seo-html.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = resolve(HERE, "dist/public");

function defaultApiOrigin() {
  if (process.env.NODE_ENV === "production") {
    const domain = String(process.env.REPLIT_DOMAINS || "")
      .split(",")[0]
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "");
    if (/^[a-z0-9.-]+(?::\d+)?$/i.test(domain)) return `https://${domain}`;
  }
  return "http://127.0.0.1";
}

const API_ORIGIN = defaultApiOrigin();

const STATIC_PAGES = {
  "/newsletter": {
    title: "Newsletter: Energie und Zukunft im Landkreis FFB",
    description:
      "Die wichtigsten Nachrichten zu Energie, Kommunalpolitik und Klimaschutz im Landkreis Fürstenfeldbruck – regelmäßig im germring.de-Newsletter.",
  },
  "/newsletter/confirm": {
    title: "Newsletter-Anmeldung bestätigen",
    description: "Bestätige deine Anmeldung zum germring.de-Newsletter.",
    robots: "noindex, nofollow",
  },
  "/klima": {
    title: "Klimadaten im Landkreis Fürstenfeldbruck",
    description:
      "Klimadaten, Entwicklungen und Einordnung für den Landkreis Fürstenfeldbruck – verständlich und regional auf germring.de.",
  },
  "/pv-rechner": {
    title: "Photovoltaik-Rechner für den Landkreis FFB",
    description:
      "Ermittle das Solarstrom-Potenzial für dein Dach und informiere dich über Photovoltaik im Landkreis Fürstenfeldbruck.",
  },
  "/energieatlas": {
    title: "Energieatlas für den Landkreis Fürstenfeldbruck",
    description:
      "Regionale Energiedaten und Projekte aus dem Landkreis Fürstenfeldbruck im Überblick.",
  },
  "/foerderung": {
    title: "Förderprogramme für Energie und Sanierung in FFB",
    description:
      "Aktuelle Förderprogramme für Wärmepumpen, Photovoltaik, Sanierung und Energieberatung im Landkreis Fürstenfeldbruck.",
  },
  "/ladesaeulen": {
    title: "Ladesäulen im Landkreis Fürstenfeldbruck",
    description:
      "Finde öffentliche Ladepunkte für Elektroautos im Landkreis Fürstenfeldbruck und informiere dich über den regionalen Ausbau.",
  },
  "/solarkataster": {
    title: "Solarkataster für den Landkreis Fürstenfeldbruck",
    description:
      "Prüfe das Solarpotenzial von Dachflächen im Landkreis Fürstenfeldbruck und entdecke regionale Photovoltaik-Möglichkeiten.",
  },
  "/partner": {
    title: "Partner werden",
    description:
      "Erreiche Menschen, die die Energiewende im Landkreis Fürstenfeldbruck gestalten – mit regionalem Sponsoring auf germring.de.",
  },
  "/mitmachen": {
    title: "Bei germring.de mitmachen",
    description:
      "Gib Hinweise, Themen und Perspektiven aus dem Landkreis Fürstenfeldbruck an die Redaktion von FFB Energie & Zukunft.",
  },
  "/impressum": {
    title: "Impressum",
    description: "Impressum und Anbieterkennzeichnung von germring.de — FFB Energie & Zukunft.",
  },
  "/datenschutz": {
    title: "Datenschutzerklärung",
    description: "Datenschutzerklärung von germring.de gemäß DSGVO.",
  },
};

const MIME_TYPES = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function fetchJson(fetchImpl, apiOrigin, path) {
  const response = await fetchImpl(new URL(path, apiOrigin), {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) {
    const error = new Error(`API returned HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function simplePageMeta(path, page) {
  return createWebPageSeo({
    path,
    title: page.title,
    description: page.description || DEFAULT_DESCRIPTION,
    robots: page.robots,
  });
}

function routePathFromRequest(requestUrl) {
  try {
    return normalizePath(new URL(requestUrl || "/", "http://localhost").pathname);
  } catch {
    return "/";
  }
}

function safeStaticFile(publicDir, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const filePath = resolve(publicDir, `.${decoded}`);
  const rel = relative(publicDir, filePath);
  if (rel === ".." || rel.startsWith(`..${sep}`) || rel.startsWith(sep)) return null;
  return filePath;
}

async function sendStaticFile(response, filePath, method) {
  let fileInfo;
  try {
    fileInfo = await stat(filePath);
  } catch {
    return false;
  }
  if (!fileInfo.isFile()) return false;

  const extension = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || "application/octet-stream";
  const isHashedAsset = /[.-][a-z0-9_-]{8,}[.-]/i.test(filePath);
  response.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": fileInfo.size,
    "Cache-Control": isHashedAsset ? "public, max-age=31536000, immutable" : "public, max-age=300",
    "X-Content-Type-Options": "nosniff",
  });
  if (method === "HEAD") {
    response.end();
  } else {
    createReadStream(filePath).pipe(response);
  }
  return true;
}

function fallbackForSimplePage(meta) {
  return renderSimpleFallback({
    title: meta.title,
    heading: meta.title.replace(/\s+\|\s+germring\.de$/i, ""),
    description: meta.description,
  });
}

async function renderRequestPage({ path, fetchImpl, apiOrigin }) {
  if (path === "/") {
    const meta = createHomeSeo();
    let articles = [];
    try {
      const result = await fetchJson(fetchImpl, apiOrigin, "/api/articles?limit=8");
      if (Array.isArray(result)) articles = result;
    } catch {
      // The editorial shell remains useful while its latest-article list recovers.
    }
    return { status: 200, meta, fallback: renderHomeFallback(articles) };
  }

  const articleMatch = path.match(/^\/artikel\/(\d+)$/);
  if (articleMatch) {
    try {
      const article = await fetchJson(fetchImpl, apiOrigin, `/api/articles/${articleMatch[1]}`);
      const meta = createArticleSeo(article);
      return { status: 200, meta, fallback: renderArticleFallback(article, meta) };
    } catch (error) {
      const missing = error?.status === 404;
      const meta = createWebPageSeo({
        path,
        title: missing ? "Artikel nicht gefunden" : "Artikel vorübergehend nicht verfügbar",
        description: missing
          ? "Der gesuchte Artikel existiert nicht oder wurde entfernt."
          : "Der Artikel kann gerade nicht geladen werden. Bitte versuche es später erneut.",
        robots: "noindex, nofollow",
      });
      return {
        status: missing ? 404 : 503,
        retryAfter: missing ? undefined : "30",
        meta,
        fallback: renderSimpleFallback({
          title: meta.title,
          heading: missing ? "Artikel nicht gefunden" : "Artikel vorübergehend nicht verfügbar",
          description: meta.description,
        }),
      };
    }
  }

  const categoryMatch = path.match(/^\/kategorie\/([^/]+)$/);
  if (categoryMatch) {
    const slug = decodeURIComponent(categoryMatch[1]);
    try {
      const [categories, articles] = await Promise.all([
        fetchJson(fetchImpl, apiOrigin, "/api/categories"),
        fetchJson(
          fetchImpl,
          apiOrigin,
          `/api/articles?categorySlug=${encodeURIComponent(slug)}&limit=20`,
        ),
      ]);
      const category = Array.isArray(categories)
        ? categories.find((candidate) => candidate.slug === slug)
        : undefined;
      if (!category) {
        const meta = createWebPageSeo({
          path,
          title: "Rubrik nicht gefunden",
          description: "Diese Rubrik ist nicht verfügbar.",
          robots: "noindex, nofollow",
        });
        return {
          status: 404,
          meta,
          fallback: renderSimpleFallback({
            title: meta.title,
            heading: "Rubrik nicht gefunden",
            description: meta.description,
          }),
        };
      }
      const safeArticles = Array.isArray(articles) ? articles : [];
      return {
        status: 200,
        meta: createCategorySeo(category, slug),
        fallback: renderCategoryFallback(category, safeArticles),
      };
    } catch {
      const meta = createWebPageSeo({
        path,
        title: "Rubrik vorübergehend nicht verfügbar",
        description: "Diese Rubrik kann gerade nicht geladen werden. Bitte versuche es später erneut.",
        robots: "noindex, nofollow",
      });
      return {
        status: 503,
        retryAfter: "30",
        meta,
        fallback: renderSimpleFallback({
          title: meta.title,
          heading: "Rubrik vorübergehend nicht verfügbar",
          description: meta.description,
        }),
      };
    }
  }

  const staticPage = STATIC_PAGES[path];
  if (staticPage) {
    const meta = simplePageMeta(path, staticPage);
    if (path === "/newsletter") {
      let issues = [];
      try {
        const archive = await fetchJson(fetchImpl, apiOrigin, "/api/newsletter/archive");
        if (Array.isArray(archive?.issues)) issues = archive.issues;
      } catch {
        // Keep the newsletter page available with its metadata while the archive API recovers.
      }
      return {
        status: 200,
        meta,
        fallback: renderNewsletterArchiveFallback(issues),
      };
    }
    return {
      status: 200,
      meta,
      fallback: fallbackForSimplePage(meta),
    };
  }

  if (path === "/admin" || path.startsWith("/admin/")) {
    const meta = createWebPageSeo({
      path,
      title: "Redaktionsbereich",
      description: "Interner Redaktionsbereich von germring.de.",
      robots: "noindex, nofollow",
    });
    return { status: 200, meta, fallback: "" };
  }

  const meta = createWebPageSeo({
    path,
    title: "Seite nicht gefunden",
    description: "Diese Seite wurde nicht gefunden.",
    robots: "noindex, nofollow",
  });
  return {
    status: 404,
    meta,
    fallback: renderSimpleFallback({
      title: meta.title,
      heading: "Seite nicht gefunden",
      description: meta.description,
    }),
  };
}

export function createRequestHandler({
  publicDir = PUBLIC_DIR,
  apiOrigin = API_ORIGIN,
  fetchImpl = fetch,
  template,
} = {}) {
  const templatePromise =
    typeof template === "string"
      ? Promise.resolve(template)
      : readFile(resolve(publicDir, "index.html"), "utf8");

  return async function handleRequest(request, response) {
    const method = request.method || "GET";
    if (method !== "GET" && method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }

    const path = routePathFromRequest(request.url);
    if (path === "/sitemap.xml") {
      response.writeHead(308, { Location: "/api/sitemap.xml", "Cache-Control": "public, max-age=3600" });
      response.end();
      return;
    }
    if (path === "/api" || path.startsWith("/api/")) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(method === "HEAD" ? undefined : "Not Found");
      return;
    }

    const filePath = safeStaticFile(publicDir, path);
    if (filePath && (await sendStaticFile(response, filePath, method))) return;
    if (extname(path)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(method === "HEAD" ? undefined : "Not Found");
      return;
    }

    let page;
    try {
      page = await renderRequestPage({ path, fetchImpl, apiOrigin });
    } catch {
      response.writeHead(503, {
        "Content-Type": "text/plain; charset=utf-8",
        "Retry-After": "30",
      });
      response.end(method === "HEAD" ? undefined : "Page temporarily unavailable");
      return;
    }

    const baseHtml = await templatePromise;
    const html = injectPageSeo(baseHtml, page.meta, page.fallback);
    response.writeHead(page.status, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "X-Content-Type-Options": "nosniff",
      ...(page.retryAfter ? { "Retry-After": page.retryAfter } : {}),
    });
    response.end(method === "HEAD" ? undefined : html);
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = Number(process.env.PORT || 23013);
  createServer(createRequestHandler()).listen(port, "0.0.0.0");
}

