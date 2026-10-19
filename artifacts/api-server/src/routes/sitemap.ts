import { Router } from "express";
import { db, articlesTable, categoriesTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

const BASE_URL = "https://germring.de";

function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc: string, lastmod?: string, priority = "0.7", changefreq = "weekly") {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : "",
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

router.get("/sitemap.xml", async (req, res) => {
  try {
    const [articles, categories] = await Promise.all([
      db
        .select({
          id: articlesTable.id,
          publishedAt: articlesTable.publishedAt,
        })
        .from(articlesTable)
        .orderBy(desc(articlesTable.publishedAt)),
      db
        .select({ slug: categoriesTable.slug })
        .from(categoriesTable),
    ]);

    const now = new Date().toISOString().slice(0, 10);

    const staticPages = [
      urlEntry(`${BASE_URL}/`, now, "1.0", "daily"),
      urlEntry(`${BASE_URL}/newsletter`, now, "0.5", "monthly"),
      urlEntry(`${BASE_URL}/klima`, now, "0.6", "monthly"),
      urlEntry(`${BASE_URL}/pv-rechner`, now, "0.6", "monthly"),
      urlEntry(`${BASE_URL}/foerderung`, now, "0.6", "monthly"),
      urlEntry(`${BASE_URL}/solarkataster`, now, "0.6", "monthly"),
    ];

    const categoryPages = categories.map((c) =>
      urlEntry(`${BASE_URL}/kategorie/${c.slug}`, now, "0.8", "daily")
    );

    const articlePages = articles.map((a) =>
      urlEntry(
        `${BASE_URL}/artikel/${a.id}`,
        a.publishedAt instanceof Date
          ? a.publishedAt.toISOString()
          : String(a.publishedAt),
        "0.9",
        "never",
      )
    );

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...staticPages,
      ...categoryPages,
      ...articlePages,
      "</urlset>",
    ].join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    req.log.error({ err }, "sitemap generation failed");
    res.status(500).send("Internal Server Error");
  }
});

export default router;
