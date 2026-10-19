import { Router, type RequestHandler } from "express";
import { db, articlesTable, categoriesTable } from "@workspace/db";
import { and, eq, desc, ilike, or, sql } from "drizzle-orm";
import { pipeline } from "node:stream/promises";
import {
  ListArticlesQueryParams,
  GetArticleParams,
  UpdateArticleParams,
  DeleteArticleParams,
  CreateArticleBody,
  UpdateArticleBody,
  MigrateArticleImagesResponse,
  SearchArticleImagesBody,
  SearchArticleImagesResponse,
} from "@workspace/api-zod";
import { requireAdminPin } from "../middleware/adminAuth.ts";
import {
  findStoredArticlePhoto,
  isStoredArticlePhoto,
  storeArticlePhoto,
} from "../lib/article-photo-storage.ts";
import {
  articleImageIdentity,
  createArticleImageOwners,
  findArticleImageDuplicate,
  hideDuplicateArticleImages,
  isEditoriallyRelevantArticleImage,
} from "../lib/article-image-uniqueness.ts";
import { searchReviewedCommonsImages } from "../lib/article-image-search.ts";

export function createArticlesRouter(dependencies: {
  requireAdmin?: RequestHandler;
  storeArticlePhoto?: typeof storeArticlePhoto;
} = {}) {
  const router = Router();
  const requireAdmin = dependencies.requireAdmin ?? requireAdminPin;
  const saveArticlePhoto = dependencies.storeArticlePhoto ?? storeArticlePhoto;

const articleWithCategory = {
  id: articlesTable.id,
  title: articlesTable.title,
  slug: articlesTable.slug,
  excerpt: articlesTable.excerpt,
  content: articlesTable.content,
  categoryId: articlesTable.categoryId,
  categoryName: categoriesTable.name,
  categorySlug: categoriesTable.slug,
  author: articlesTable.author,
  publishedAt: sql<string>`to_char(${articlesTable.publishedAt}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("publishedAt"),
  imageUrl: articlesTable.imageUrl,
  imageSourceUrl: articlesTable.imageSourceUrl,
  imageSourcePageUrl: articlesTable.imageSourcePageUrl,
  imageLicense: articlesTable.imageLicense,
  imageCredit: articlesTable.imageCredit,
  featured: articlesTable.featured,
  readingMinutes: articlesTable.readingMinutes,
  tags: articlesTable.tags,
  sources: articlesTable.sources,
};

async function withUniqueArticleImages<T extends { id: number; imageUrl: string | null }>(
  articles: T[],
): Promise<T[]> {
  if (articles.length === 0) return articles;

  const imageRecords = await db
    .select({
      id: articlesTable.id,
      imageUrl: articlesTable.imageUrl,
      imageSourceUrl: articlesTable.imageSourceUrl,
      publishedAt: articlesTable.publishedAt,
    })
    .from(articlesTable)
    .where(sql`${articlesTable.imageUrl} IS NOT NULL`);

  return hideDuplicateArticleImages(articles, createArticleImageOwners(imageRecords));
}

router.get("/articles", async (req, res) => {
  const parse = ListArticlesQueryParams.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.message });
  }
  const { categorySlug, search, limit = 20, offset = 0 } = parse.data;
  try {
    let query = db
      .select(articleWithCategory)
      .from(articlesTable)
      .innerJoin(categoriesTable, eq(articlesTable.categoryId, categoriesTable.id))
      .orderBy(desc(articlesTable.publishedAt))
      .limit(limit)
      .offset(offset);

    const conditions = [];
    if (categorySlug) {
      conditions.push(eq(categoriesTable.slug, categorySlug));
    }
    if (search) {
      conditions.push(
        or(
          ilike(articlesTable.title, `%${search}%`),
          ilike(articlesTable.excerpt, `%${search}%`)
        )!
      );
    }

    if (conditions.length > 0) {
      const articles = await db
        .select(articleWithCategory)
        .from(articlesTable)
        .innerJoin(categoriesTable, eq(articlesTable.categoryId, categoriesTable.id))
        .where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`)
        .orderBy(desc(articlesTable.publishedAt))
        .limit(limit)
        .offset(offset);
      return res.json(await withUniqueArticleImages(articles));
    }

    const articles = await query;
    return res.json(await withUniqueArticleImages(articles));
  } catch (err) {
    req.log.error({ err }, "Failed to list articles");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/articles/featured", async (req, res) => {
  try {
    const articles = await db
      .select(articleWithCategory)
      .from(articlesTable)
      .innerJoin(categoriesTable, eq(articlesTable.categoryId, categoriesTable.id))
      .where(eq(articlesTable.featured, true))
      .orderBy(desc(articlesTable.publishedAt))
      .limit(4);
    const uniqueArticles = await withUniqueArticleImages(articles);
    res.json(uniqueArticles.filter(article => Boolean(article.imageUrl)));
  } catch (err) {
    req.log.error({ err }, "Failed to get featured articles");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/articles/images/search", requireAdmin, async (req, res): Promise<void> => {
  const parse = SearchArticleImagesBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  try {
    const existingImages = await db
      .select({
        imageUrl: articlesTable.imageUrl,
        imageSourceUrl: articlesTable.imageSourceUrl,
      })
      .from(articlesTable)
      .where(sql`${articlesTable.imageUrl} IS NOT NULL`);
    const candidates = await searchReviewedCommonsImages(parse.data, existingImages.flatMap(article => [
      article.imageSourceUrl,
      article.imageUrl,
    ]).filter((url): url is string => Boolean(url)));

    res.json(SearchArticleImagesResponse.parse({ candidates }));
  } catch (err) {
    req.log.warn({ err, categoryId: parse.data.categoryId }, "Article image search failed");
    res.status(502).json({
      error: "Es konnten keine geprüften Bildvorschläge geladen werden. Bitte versuche die Suche erneut.",
    });
  }
});

router.post("/articles/images/migrate", requireAdmin, async (req, res): Promise<void> => {
  try {
    const records = await db
      .select({
        id: articlesTable.id,
        title: articlesTable.title,
        imageUrl: articlesTable.imageUrl,
        imageSourceUrl: articlesTable.imageSourceUrl,
      })
      .from(articlesTable)
      .where(sql`${articlesTable.imageUrl} IS NOT NULL`);
    const targets = records.filter(record => record.imageUrl && !isStoredArticlePhoto(record.imageUrl));
    const results: Array<{
      articleId: number;
      title: string;
      status: "migrated" | "failed";
      message?: string;
    }> = [];

    for (let offset = 0; offset < targets.length; offset += 4) {
      const batch = targets.slice(offset, offset + 4);
      const batchResults = await Promise.all(batch.map(async article => {
        const sourceUrl = article.imageUrl!;
        try {
          const stableUrl = await saveArticlePhoto(sourceUrl);
          const updated = await db
            .update(articlesTable)
            .set({
              imageUrl: stableUrl,
              imageSourceUrl: article.imageSourceUrl ?? sourceUrl,
            })
            .where(and(eq(articlesTable.id, article.id), eq(articlesTable.imageUrl, sourceUrl)))
            .returning({ id: articlesTable.id });

          if (updated.length === 0) {
            return {
              articleId: article.id,
              title: article.title,
              status: "failed" as const,
              message: "Das Bild wurde während der Übertragung geändert; die bestehende Adresse blieb erhalten.",
            };
          }
          return { articleId: article.id, title: article.title, status: "migrated" as const };
        } catch {
          req.log.warn({ articleId: article.id }, "Article photo migration failed");
          return {
            articleId: article.id,
            title: article.title,
            status: "failed" as const,
            message: "Das Foto konnte nicht kopiert werden; die bestehende Adresse blieb erhalten.",
          };
        }
      }));
      results.push(...batchResults);
    }

    const response = {
      total: targets.length,
      migrated: results.filter(result => result.status === "migrated").length,
      failed: results.filter(result => result.status === "failed").length,
      results,
    };
    res.json(MigrateArticleImagesResponse.parse(response));
  } catch (err) {
    req.log.error({ err }, "Failed to migrate article photos");
    res.status(500).json({ error: "Artikelbilder konnten nicht migriert werden." });
  }
});

router.get("/storage/article-photos/:filename", async (req, res): Promise<void> => {
  const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  if (!filename) {
    res.status(404).json({ error: "Bild nicht gefunden." });
    return;
  }
  try {
    const file = await findStoredArticlePhoto(filename ?? "");
    if (!file) {
      res.status(404).json({ error: "Bild nicht gefunden." });
      return;
    }
    const [metadata] = await file.getMetadata();
    res.setHeader("Content-Type", metadata.contentType ?? "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");
    await pipeline(file.createReadStream(), res);
  } catch (err) {
    req.log.error({ err }, "Failed to serve article photo");
    if (!res.headersSent) res.status(500).json({ error: "Bild konnte nicht geladen werden." });
    else res.end();
  }
});

router.get("/articles/:id", async (req, res) => {
  const parse = GetArticleParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const [article] = await db
      .select(articleWithCategory)
      .from(articlesTable)
      .innerJoin(categoriesTable, eq(articlesTable.categoryId, categoriesTable.id))
      .where(eq(articlesTable.id, parse.data.id));
    if (!article) return res.status(404).json({ error: "Not found" });
    return res.json((await withUniqueArticleImages([article]))[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to get article");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/articles", requireAdmin, async (req, res) => {
  const parse = CreateArticleBody.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.message });
  }
  if (!parse.data.imageUrl?.trim()) {
    return res.status(422).json({
      error: "Ein thematisch passendes Artikelbild ist für die Veröffentlichung erforderlich.",
    });
  }
  if (parse.data.imageUrl && !isEditoriallyRelevantArticleImage(parse.data.imageUrl)) {
    return res.status(422).json({
      error: "Dieses Motiv zeigt Kinder und wird nicht als Artikelbild verwendet. Bitte wähle ein thematisch passendes Foto.",
    });
  }
  try {
    const sourceImageUrl = parse.data.imageUrl ?? null;
    let imageUrl = sourceImageUrl;
    let imageSourceUrl: string | null = null;
    const photoProvenance = sourceImageUrl
      ? {
          imageSourcePageUrl: parse.data.imageSourcePageUrl ?? null,
          imageLicense: parse.data.imageLicense ?? null,
          imageCredit: parse.data.imageCredit ?? null,
        }
      : {
          imageSourcePageUrl: null,
          imageLicense: null,
          imageCredit: null,
        };
    const shouldStorePhoto = Boolean(sourceImageUrl && !isStoredArticlePhoto(sourceImageUrl));
    const words = parse.data.content.split(" ").length;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));
    const sources = parse.data.sources.map(source =>
      source.url ? { label: source.label, url: source.url } : { label: source.label },
    );
    const createResult = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(173351097, 19)`);

      if (sourceImageUrl) {
        const existingImages = await tx
          .select({
            id: articlesTable.id,
            imageUrl: articlesTable.imageUrl,
            imageSourceUrl: articlesTable.imageSourceUrl,
          })
          .from(articlesTable)
          .where(sql`${articlesTable.imageUrl} IS NOT NULL`);
        if (findArticleImageDuplicate(existingImages, imageSourceUrl ?? imageUrl!)) {
          return { kind: "duplicate-image" as const };
        }
      }

      if (shouldStorePhoto) {
        try {
          imageUrl = await saveArticlePhoto(sourceImageUrl!);
          imageSourceUrl = sourceImageUrl;
        } catch {
          return { kind: "photo-storage-failed" as const };
        }
      }

      const [inserted] = await tx
        .insert(articlesTable)
        .values({ ...parse.data, ...photoProvenance, imageUrl, imageSourceUrl, sources, readingMinutes })
        .returning({ id: articlesTable.id });

      await tx
        .update(categoriesTable)
        .set({ articleCount: sql`${categoriesTable.articleCount} + 1` })
        .where(eq(categoriesTable.id, parse.data.categoryId));

      return { kind: "created" as const, id: inserted.id };
    });

    if (createResult.kind === "duplicate-image") {
      return res.status(409).json({
        error: "Dieses Foto wird bereits in einem anderen Beitrag verwendet. Bitte wähle ein anderes, thematisch passendes Motiv.",
      });
    }
    if (createResult.kind === "photo-storage-failed") {
      req.log.warn({ articleTitle: parse.data.title }, "New article photo could not be copied");
      return res.status(502).json({
        error: "Das Artikelbild konnte nicht dauerhaft gespeichert werden. Der Artikel wurde nicht veröffentlicht.",
      });
    }

    const [article] = await db
      .select(articleWithCategory)
      .from(articlesTable)
      .innerJoin(categoriesTable, eq(articlesTable.categoryId, categoriesTable.id))
      .where(eq(articlesTable.id, createResult.id));

    return res.status(201).json((await withUniqueArticleImages([article]))[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to create article");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/articles/:id", requireAdmin, async (req, res) => {
  const paramParse = UpdateArticleParams.safeParse({ id: Number(req.params.id) });
  if (!paramParse.success) return res.status(400).json({ error: "Invalid id" });
  const bodyParse = UpdateArticleBody.safeParse(req.body);
  if (!bodyParse.success) return res.status(400).json({ error: bodyParse.error.message });
  if (
    typeof bodyParse.data.imageUrl === "string" &&
    !isEditoriallyRelevantArticleImage(bodyParse.data.imageUrl)
  ) {
    return res.status(422).json({
      error: "Dieses Motiv zeigt Kinder und wird nicht als Artikelbild verwendet. Bitte wähle ein thematisch passendes Foto.",
    });
  }
  try {
    const [currentBeforeUpdate] = await db
      .select({
        id: articlesTable.id,
      })
      .from(articlesTable)
      .where(eq(articlesTable.id, paramParse.data.id));
    if (!currentBeforeUpdate) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const { sources: rawSources, ...articleUpdates } = bodyParse.data;
    const preparedUpdates: typeof articleUpdates & { imageSourceUrl?: string | null } = {
      ...articleUpdates,
    };
    if (Object.prototype.hasOwnProperty.call(bodyParse.data, "imageUrl") && bodyParse.data.imageUrl === null) {
      preparedUpdates.imageSourceUrl = null;
      preparedUpdates.imageSourcePageUrl = null;
      preparedUpdates.imageLicense = null;
      preparedUpdates.imageCredit = null;
    }
    const sources: Array<{ label: string; url?: string }> | undefined = rawSources?.map(source =>
      source.url ? { label: source.label, url: source.url } : { label: source.label },
    );
    const updateResult = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(173351097, 19)`);
      const [current] = await tx
        .select({
          id: articlesTable.id,
          imageUrl: articlesTable.imageUrl,
          imageSourceUrl: articlesTable.imageSourceUrl,
          imageSourcePageUrl: articlesTable.imageSourcePageUrl,
          imageLicense: articlesTable.imageLicense,
          imageCredit: articlesTable.imageCredit,
        })
        .from(articlesTable)
        .where(eq(articlesTable.id, paramParse.data.id));

      if (!current) return { kind: "not-found" as const };

      const updateFields = { ...preparedUpdates };
      if (typeof bodyParse.data.imageUrl === "string") {
        const requestedImageUrl = bodyParse.data.imageUrl;
        const requestedIdentity = articleImageIdentity(requestedImageUrl);
        const currentIdentity = articleImageIdentity(current.imageSourceUrl || current.imageUrl);
        const sameImage =
          requestedImageUrl === current.imageUrl ||
          (requestedIdentity === currentIdentity && isStoredArticlePhoto(current.imageUrl));

        if (sameImage) {
          updateFields.imageUrl = current.imageUrl!;
          updateFields.imageSourceUrl = current.imageSourceUrl;
        } else {
          const existingImages = await tx
            .select({
              id: articlesTable.id,
              imageUrl: articlesTable.imageUrl,
              imageSourceUrl: articlesTable.imageSourceUrl,
            })
            .from(articlesTable)
            .where(sql`${articlesTable.imageUrl} IS NOT NULL`);
          if (findArticleImageDuplicate(existingImages, requestedImageUrl, current.id)) {
            return { kind: "duplicate-image" as const };
          }

          if (isStoredArticlePhoto(requestedImageUrl)) {
            updateFields.imageUrl = requestedImageUrl;
            updateFields.imageSourceUrl = null;
          } else {
            try {
              updateFields.imageUrl = await saveArticlePhoto(requestedImageUrl);
              updateFields.imageSourceUrl = requestedImageUrl;
            } catch {
              return { kind: "photo-storage-failed" as const };
            }
          }
          updateFields.imageSourcePageUrl = bodyParse.data.imageSourcePageUrl ?? null;
          updateFields.imageLicense = bodyParse.data.imageLicense ?? null;
          updateFields.imageCredit = bodyParse.data.imageCredit ?? null;
        }
      }

      await tx
        .update(articlesTable)
        .set(sources ? { ...updateFields, sources } : updateFields)
        .where(eq(articlesTable.id, paramParse.data.id));

      return { kind: "updated" as const };
    });

    if (updateResult.kind === "not-found") return res.status(404).json({ error: "Not found" });
    if (updateResult.kind === "duplicate-image") {
      return res.status(409).json({
        error: "Dieses Foto wird bereits in einem anderen Beitrag verwendet. Bitte wähle ein anderes, thematisch passendes Motiv.",
      });
    }
    if (updateResult.kind === "photo-storage-failed") {
      req.log.warn({ articleId: paramParse.data.id }, "Updated article photo could not be copied");
      return res.status(502).json({
        error: "Das Artikelbild konnte nicht dauerhaft gespeichert werden. Die bisherige Adresse blieb erhalten.",
      });
    }

    const [article] = await db
      .select(articleWithCategory)
      .from(articlesTable)
      .innerJoin(categoriesTable, eq(articlesTable.categoryId, categoriesTable.id))
      .where(eq(articlesTable.id, paramParse.data.id));
    return res.json((await withUniqueArticleImages([article]))[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update article");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/articles/:id", requireAdmin, async (req, res) => {
  const parse = DeleteArticleParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) return res.status(400).json({ error: "Invalid id" });
  try {
    await db.delete(articlesTable).where(eq(articlesTable.id, parse.data.id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete article");
    return res.status(500).json({ error: "Internal server error" });
  }
});
  return router;
}

const router = createArticlesRouter();

export default router;
