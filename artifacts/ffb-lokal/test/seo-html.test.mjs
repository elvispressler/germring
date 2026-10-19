import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import test from "node:test";
import { createRequestHandler } from "../server.mjs";
import {
  createArticleSeo,
  createHomeSeo,
  injectPageSeo,
  renderArticleFallback,
  renderNewsletterArchiveFallback,
} from "../src/lib/seo-html.mjs";

const sampleArticle = {
  id: 51,
  title: "Wärmepumpen im Herbst",
  slug: "waermepumpen-im-herbst",
  excerpt: "Hinweise für Haushalte im Landkreis Fürstenfeldbruck.",
  content: "Erster Absatz.\n\nZweiter Absatz mit <script>alert(1)</script>.",
  categoryName: "Praxis & Zukunft",
  categorySlug: "praxis-zukunft",
  author: "germring.de Redaktion",
  publishedAt: "2026-09-30T09:00:00.000Z",
  imageUrl: "/api/storage/article-photos/heat-pump.jpg",
  imageCredit: "Ppntori",
  imageLicense: "Public domain",
  imageSourcePageUrl: "https://commons.wikimedia.org/wiki/File:Outunit_of_heat_pump.jpg",
};

test("article metadata is route-specific and contains absolute share and schema data", () => {
  const meta = createArticleSeo(sampleArticle);
  assert.equal(meta.canonicalUrl, "https://germring.de/artikel/51");
  assert.equal(meta.imageUrl, "https://germring.de/api/storage/article-photos/heat-pump.jpg");
  assert.equal(meta.ogType, "article");
  assert.match(meta.title, /Wärmepumpen im Herbst \| germring\.de/);
  assert.ok(meta.jsonLd["@graph"].some((item) => item["@type"] === "BlogPosting"));
  assert.ok(meta.jsonLd["@graph"].some((item) => item["@type"] === "BreadcrumbList"));
});

test("server HTML replaces generic shell metadata and renders escaped article text", () => {
  const meta = createArticleSeo(sampleArticle);
  const fallback = renderArticleFallback(sampleArticle, meta);
  const html = injectPageSeo(
    `<!doctype html><html><head><title>Default</title><meta name="description" content="Default" /><link rel="canonical" href="https://germring.de" /></head><body><div id="seo-fallback"></div><div id="root"></div></body></html>`,
    meta,
    fallback,
  );

  assert.match(html, /<title>Wärmepumpen im Herbst \| germring\.de<\/title>/);
  assert.match(html, /href="https:\/\/germring\.de\/artikel\/51"/);
  assert.match(html, /property="og:image" content="https:\/\/germring\.de\/api\/storage\/article-photos\/heat-pump\.jpg"/);
  assert.match(html, /"@type":"BlogPosting"/);
  assert.match(html, /<h1>Wärmepumpen im Herbst<\/h1>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /Default/);
});

test("home schema exposes both the news organization and website", () => {
  const meta = createHomeSeo();
  assert.equal(meta.canonicalUrl, "https://germring.de/");
  assert.ok(meta.jsonLd["@graph"].some((item) => item["@type"] === "NewsMediaOrganization"));
  assert.ok(meta.jsonLd["@graph"].some((item) => item["@type"] === "WebSite"));
});

test("article route returns HTML metadata and body before client JavaScript runs", async () => {
  const handler = createRequestHandler({
    template:
      '<!doctype html><html><head><title>Default</title></head><body><div id="seo-fallback"></div><div id="root"></div></body></html>',
    apiOrigin: "http://api.internal",
    fetchImpl: async (url) => {
      assert.equal(String(url), "http://api.internal/api/articles/51");
      return new Response(JSON.stringify(sampleArticle), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });
  const server = createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/artikel/51`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /rel="canonical" href="https:\/\/germring\.de\/artikel\/51"/);
    assert.match(html, /<h1>Wärmepumpen im Herbst<\/h1>/);
    assert.match(html, /Erster Absatz/);
    assert.match(html, /article:published_time/);
  } finally {
    server.close();
    await once(server, "close");
  }
});

test("newsletter archive fallback renders safe issue content and article links", () => {
  const html = renderNewsletterArchiveFallback([
    {
      subject: "KW 38: Solar, Speicher & Mobilitätswende",
      sentAt: "2026-09-19T13:58:08.000Z",
      content: "Hallo,\n\nPHOTOVOLTAIK IM HERBST\n\nMehr dazu: [[ARTIKEL:44]]\n\n<script>alert(1)</script>",
    },
  ]);

  assert.match(html, /<h2>Vergangene Ausgaben<\/h2>/);
  assert.match(html, /<h3>KW 38: Solar, Speicher &amp; Mobilitätswende<\/h3>/);
  assert.match(html, /<h4>PHOTOVOLTAIK IM HERBST<\/h4>/);
  assert.match(html, /<a href="\/artikel\/44">Mehr dazu auf germring\.de →<\/a>/);
  assert.match(html, /<time datetime="2026-09-19T13:58:08\.000Z">19\. September 2026<\/time>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});

test("newsletter route includes the archive content in HTML before client JavaScript runs", async () => {
  const issue = {
    id: 2_000_000_038,
    subject: "KW 38: Solar, Speicher & Mobilitätswende",
    content: "Hallo,\n\nPHOTOVOLTAIK IM HERBST\n\nMehr dazu: [[ARTIKEL:44]]",
    sentAt: "2026-09-19T13:58:08.000Z",
  };
  const handler = createRequestHandler({
    template:
      '<!doctype html><html><head><title>Default</title></head><body><div id="seo-fallback"></div><div id="root"></div></body></html>',
    apiOrigin: "http://api.internal",
    fetchImpl: async (url) => {
      assert.equal(String(url), "http://api.internal/api/newsletter/archive");
      return new Response(JSON.stringify({ issues: [issue], nextCursor: null }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });
  const server = createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/newsletter`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /rel="canonical" href="https:\/\/germring\.de\/newsletter"/);
    assert.match(html, /<h3>KW 38: Solar, Speicher &amp; Mobilitätswende<\/h3>/);
    assert.match(html, /<a href="\/artikel\/44">Mehr dazu auf germring\.de →<\/a>/);
  } finally {
    server.close();
    await once(server, "close");
  }
});

test("missing article routes return a 404 with a noindex directive", async () => {
  const handler = createRequestHandler({
    template:
      '<!doctype html><html><head><title>Default</title></head><body><div id="seo-fallback"></div><div id="root"></div></body></html>',
    apiOrigin: "http://api.internal",
    fetchImpl: async () =>
      new Response(JSON.stringify({ message: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      }),
  });
  const server = createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/artikel/99999`);
    const html = await response.text();
    assert.equal(response.status, 404);
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.match(html, /Artikel nicht gefunden/);
  } finally {
    server.close();
    await once(server, "close");
  }
});

