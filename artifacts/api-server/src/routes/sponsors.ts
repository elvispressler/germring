import { Router } from "express";
import { db, sponsorsTable, categoriesTable } from "@workspace/db";
import { eq, and, or, isNull, gte, lte } from "drizzle-orm";

const router = Router();

router.get("/sponsors/active", async (req, res) => {
  const categorySlug = typeof req.query.categorySlug === "string" ? req.query.categorySlug : undefined;
  const now = new Date();

  try {
    const conditions = [
      eq(sponsorsTable.active, true),
      or(isNull(sponsorsTable.endsAt), gte(sponsorsTable.endsAt, now))!,
      lte(sponsorsTable.startsAt, now),
    ];

    const sponsors = await db
      .select({
        id: sponsorsTable.id,
        name: sponsorsTable.name,
        logoUrl: sponsorsTable.logoUrl,
        website: sponsorsTable.website,
        tagline: sponsorsTable.tagline,
        ctaLabel: sponsorsTable.ctaLabel,
        categoryId: sponsorsTable.categoryId,
        categorySlug: categoriesTable.slug,
      })
      .from(sponsorsTable)
      .leftJoin(categoriesTable, eq(sponsorsTable.categoryId, categoriesTable.id))
      .where(and(...conditions));

    if (categorySlug) {
      const slug = categorySlug;
      const filtered = sponsors.filter(
        (s) => s.categorySlug === slug || s.categoryId === null
      );
      const catSpecific = filtered.filter((s) => s.categorySlug === slug);
      const result = catSpecific.length > 0 ? catSpecific : filtered.filter((s) => s.categoryId === null);
      return res.json(result.slice(0, 1));
    }

    const global = sponsors.filter((s) => s.categoryId === null);
    return res.json(global.slice(0, 1));
  } catch (err) {
    req.log.error({ err }, "Failed to get active sponsor");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
