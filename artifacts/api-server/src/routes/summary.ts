import { Router } from "express";
import { db, articlesTable, categoriesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

router.get("/summary", async (req, res) => {
  try {
    const [totals] = await db
      .select({
        totalArticles: sql<number>`count(${articlesTable.id})::int`,
        latestPublishedAt: sql<string | null>`to_char(max(${articlesTable.publishedAt}), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`,
      })
      .from(articlesTable);

    const [catCount] = await db
      .select({ totalCategories: sql<number>`count(${categoriesTable.id})::int` })
      .from(categoriesTable);

    const categoryStats = await db
      .select({
        categoryId: categoriesTable.id,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        color: categoriesTable.color,
        count: sql<number>`count(${articlesTable.id})::int`,
      })
      .from(categoriesTable)
      .leftJoin(articlesTable, eq(articlesTable.categoryId, categoriesTable.id))
      .groupBy(categoriesTable.id, categoriesTable.name, categoriesTable.slug, categoriesTable.color)
      .orderBy(desc(sql`count(${articlesTable.id})`));

    res.json({
      totalArticles: totals.totalArticles,
      totalCategories: catCount.totalCategories,
      categoryStats,
      latestPublishedAt: totals.latestPublishedAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
