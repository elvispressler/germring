import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";

const router = Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        color: categoriesTable.color,
        description: categoriesTable.description,
        articleCount: categoriesTable.articleCount,
      })
      .from(categoriesTable)
      .orderBy(categoriesTable.name);
    return res.json(categories);
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/categories", async (req, res) => {
  const parse = CreateCategoryBody.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.message });
  }
  try {
    const [category] = await db
      .insert(categoriesTable)
      .values(parse.data)
      .returning();
    return res.status(201).json(category);
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
