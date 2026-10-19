import assert from "node:assert/strict";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import express from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import { after, it } from "node:test";
import { and, eq } from "drizzle-orm";
import {
  articlesTable,
  categoriesTable,
  db,
  pool,
} from "@workspace/db";
import { createArticlesRouter } from "../src/routes/articles.ts";

const testLogger = pino({ level: "silent" });

after(async () => {
  await pool.end();
});

it("speichert beim Bildwechsel Bild und Nachweise lokal, liefert sie erneut aus und verhindert doppelte Zuordnungen", async () => {
  const suffix = randomUUID();
  const sourceUrl = "https://upload.wikimedia.org/wikipedia/commons/a/a1/regression-photo.jpg";
  const sourcePageUrl = "https://commons.wikimedia.org/wiki/File:regression-photo.jpg";
  const license = "CC BY-SA 4.0";
  const credit = "Beispielautorin";
  const savedImageUrl = `/api/storage/article-photos/${randomUUID()}.webp`;
  const copiedSources: string[] = [];
  let categoryId: number | undefined;
  const articleIds: number[] = [];
  const app = express();

  app.use(pinoHttp({ logger: testLogger }));
  app.use(express.json());
  app.use("/api", createArticlesRouter({
    requireAdmin: (_req, _res, next) => next(),
    storeArticlePhoto: async url => {
      copiedSources.push(url);
      return savedImageUrl;
    },
  }));

  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const apiUrl = `http://127.0.0.1:${address.port}/api`;

  try {
    const [category] = await db
      .insert(categoriesTable)
      .values({
        name: `Testkategorie ${suffix}`,
        slug: `image-provenance-${suffix}`,
        color: "#123456",
        description: "Kategorie für den Bildnachweis-Regressionstest",
      })
      .returning({ id: categoriesTable.id });
    categoryId = category!.id;

    const insertedArticles = await db
      .insert(articlesTable)
      .values([
        {
          title: `Artikel mit Bildwechsel ${suffix}`,
          slug: `image-provenance-primary-${suffix}`,
          excerpt: "Testauszug",
          content: "Testinhalt",
          categoryId,
          author: "Redaktion",
          imageUrl: `/api/storage/article-photos/${randomUUID()}.webp`,
          imageSourceUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b1/previous-photo.jpg",
        },
        {
          title: `Artikel mit bereits verwendeten Bild ${suffix}`,
          slug: `image-provenance-secondary-${suffix}`,
          excerpt: "Testauszug",
          content: "Testinhalt",
          categoryId,
          author: "Redaktion",
          imageUrl: `/api/storage/article-photos/${randomUUID()}.webp`,
          imageSourceUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c1/other-photo.jpg",
        },
      ])
      .returning({ id: articlesTable.id, imageUrl: articlesTable.imageUrl, imageSourceUrl: articlesTable.imageSourceUrl });
    articleIds.push(...insertedArticles.map(article => article.id));

    const changedArticle = insertedArticles[0]!;
    const secondArticle = insertedArticles[1]!;
    const changeResponse = await fetch(`${apiUrl}/articles/${changedArticle.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        imageUrl: sourceUrl,
        imageSourcePageUrl: sourcePageUrl,
        imageLicense: license,
        imageCredit: credit,
      }),
    });
    assert.equal(changeResponse.status, 200);
    assert.deepEqual(copiedSources, [sourceUrl], "the replacement image should be copied locally once");

    const changeBody = await changeResponse.json() as Record<string, unknown>;
    assert.equal(changeBody.imageUrl, savedImageUrl);
    assert.equal(changeBody.imageSourceUrl, sourceUrl);
    assert.equal(changeBody.imageSourcePageUrl, sourcePageUrl);
    assert.equal(changeBody.imageLicense, license);
    assert.equal(changeBody.imageCredit, credit);

    const reloadResponse = await fetch(`${apiUrl}/articles/${changedArticle.id}`);
    assert.equal(reloadResponse.status, 200);
    const reloadedArticle = await reloadResponse.json() as Record<string, unknown>;
    assert.deepEqual(
      {
        imageUrl: reloadedArticle.imageUrl,
        imageSourceUrl: reloadedArticle.imageSourceUrl,
        imageSourcePageUrl: reloadedArticle.imageSourcePageUrl,
        imageLicense: reloadedArticle.imageLicense,
        imageCredit: reloadedArticle.imageCredit,
      },
      {
        imageUrl: savedImageUrl,
        imageSourceUrl: sourceUrl,
        imageSourcePageUrl: sourcePageUrl,
        imageLicense: license,
        imageCredit: credit,
      },
      "reloading the article should preserve its local image and all provenance",
    );

    const duplicateResponse = await fetch(`${apiUrl}/articles/${secondArticle.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        imageUrl: sourceUrl,
        imageSourcePageUrl: sourcePageUrl,
        imageLicense: license,
        imageCredit: credit,
      }),
    });
    assert.equal(duplicateResponse.status, 409);
    assert.deepEqual(copiedSources, [sourceUrl], "a photo already assigned elsewhere must not be copied again");

    const unchangedResponse = await fetch(`${apiUrl}/articles/${secondArticle.id}`);
    assert.equal(unchangedResponse.status, 200);
    const unchangedArticle = await unchangedResponse.json() as Record<string, unknown>;
    assert.equal(unchangedArticle.imageUrl, secondArticle.imageUrl);
    assert.equal(unchangedArticle.imageSourceUrl, secondArticle.imageSourceUrl);

    const duplicateRows = await db
      .select({ id: articlesTable.id })
      .from(articlesTable)
      .where(and(
        eq(articlesTable.imageSourceUrl, sourceUrl),
        eq(articlesTable.categoryId, categoryId),
      ));
    assert.deepEqual(duplicateRows.map(row => row.id), [changedArticle.id]);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
    if (articleIds.length > 0) {
      await db.delete(articlesTable).where(eq(articlesTable.id, articleIds[0]!));
      if (articleIds.length > 1) {
        await db.delete(articlesTable).where(eq(articlesTable.id, articleIds[1]!));
      }
    }
    if (categoryId !== undefined) {
      await db.delete(categoriesTable).where(eq(categoriesTable.id, categoryId));
    }
  }
});

it("bewahrt Bild und vollständige Nachweise bei redaktionellen Änderungen ohne Bildwechsel", async () => {
  const suffix = randomUUID();
  const imageUrl = `/api/storage/article-photos/${randomUUID()}.webp`;
  const sourceUrl = "https://upload.wikimedia.org/wikipedia/commons/f/f1/editorial-update-photo.jpg";
  const sourcePageUrl = "https://commons.wikimedia.org/wiki/File:editorial-update-photo.jpg";
  const license = "CC BY-SA 4.0";
  const credit = "Beispielautor";
  let originalCategoryId: number | undefined;
  let updatedCategoryId: number | undefined;
  let articleId: number | undefined;
  const app = express();

  app.use(pinoHttp({ logger: testLogger }));
  app.use(express.json());
  app.use("/api", createArticlesRouter({
    requireAdmin: (_req, _res, next) => next(),
    storeArticlePhoto: async () => {
      throw new Error("an editorial update must not replace or copy the existing image");
    },
  }));

  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const apiUrl = `http://127.0.0.1:${address.port}/api`;

  try {
    const categories = await db
      .insert(categoriesTable)
      .values([
        {
          name: `Ursprungskategorie ${suffix}`,
          slug: `image-provenance-original-${suffix}`,
          color: "#123456",
          description: "Ausgangskategorie für den Nachweis-Regressionstest",
        },
        {
          name: `Neue Kategorie ${suffix}`,
          slug: `image-provenance-updated-${suffix}`,
          color: "#654321",
          description: "Zielkategorie für den Nachweis-Regressionstest",
        },
      ])
      .returning({ id: categoriesTable.id });
    originalCategoryId = categories[0]!.id;
    updatedCategoryId = categories[1]!.id;

    const [article] = await db
      .insert(articlesTable)
      .values({
        title: `Ursprünglicher Titel ${suffix}`,
        slug: `image-provenance-editorial-${suffix}`,
        excerpt: "Ursprünglicher Text",
        content: "Ursprünglicher Artikelinhalt",
        categoryId: originalCategoryId,
        author: "Redaktion",
        imageUrl,
        imageSourceUrl: sourceUrl,
        imageSourcePageUrl: sourcePageUrl,
        imageLicense: license,
        imageCredit: credit,
      })
      .returning({ id: articlesTable.id });
    articleId = article!.id;

    const patchResponse = await fetch(`${apiUrl}/articles/${articleId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: `Geänderter Titel ${suffix}`,
        excerpt: "Geänderter Textauszug",
        content: "Geänderter Artikelinhalt",
        categoryId: updatedCategoryId,
      }),
    });
    assert.equal(patchResponse.status, 200);
    const patchBody = await patchResponse.json() as Record<string, unknown>;
    assert.equal(patchBody.title, `Geänderter Titel ${suffix}`);
    assert.equal(patchBody.excerpt, "Geänderter Textauszug");
    assert.equal(patchBody.content, "Geänderter Artikelinhalt");
    assert.equal(patchBody.categoryId, updatedCategoryId);
    assert.deepEqual(
      {
        imageUrl: patchBody.imageUrl,
        imageSourceUrl: patchBody.imageSourceUrl,
        imageSourcePageUrl: patchBody.imageSourcePageUrl,
        imageLicense: patchBody.imageLicense,
        imageCredit: patchBody.imageCredit,
      },
      { imageUrl, imageSourceUrl: sourceUrl, imageSourcePageUrl: sourcePageUrl, imageLicense: license, imageCredit: credit },
      "an editorial update should preserve the local image and all provenance in the PATCH response",
    );

    const getResponse = await fetch(`${apiUrl}/articles/${articleId}`);
    assert.equal(getResponse.status, 200);
    const getBody = await getResponse.json() as Record<string, unknown>;
    assert.deepEqual(
      {
        imageUrl: getBody.imageUrl,
        imageSourceUrl: getBody.imageSourceUrl,
        imageSourcePageUrl: getBody.imageSourcePageUrl,
        imageLicense: getBody.imageLicense,
        imageCredit: getBody.imageCredit,
      },
      { imageUrl, imageSourceUrl: sourceUrl, imageSourcePageUrl: sourcePageUrl, imageLicense: license, imageCredit: credit },
      "a subsequent GET should preserve the local image and all provenance",
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
    if (articleId !== undefined) {
      await db.delete(articlesTable).where(eq(articlesTable.id, articleId));
    }
    if (originalCategoryId !== undefined) {
      await db.delete(categoriesTable).where(eq(categoriesTable.id, originalCategoryId));
    }
    if (updatedCategoryId !== undefined) {
      await db.delete(categoriesTable).where(eq(categoriesTable.id, updatedCategoryId));
    }
  }
});

it("kopiert bei gleichzeitigen Bildwechseln höchstens eine Datei für dasselbe Foto", async () => {
  const suffix = randomUUID();
  const sourceUrl = "https://upload.wikimedia.org/wikipedia/commons/d/d1/concurrent-photo.jpg";
  const copiedSources: string[] = [];
  const storedImageUrls: string[] = [];
  let categoryId: number | undefined;
  const articleIds: number[] = [];
  let unblockPhotoSave = () => {};
  let markPhotoSaveStarted = () => {};
  let markBothPatchesArrived = () => {};
  const photoSaveGate = new Promise<void>(resolve => {
    unblockPhotoSave = resolve;
  });
  const photoSaveStarted = new Promise<void>(resolve => {
    markPhotoSaveStarted = resolve;
  });
  const bothPatchesArrived = new Promise<void>(resolve => {
    markBothPatchesArrived = resolve;
  });
  let patchArrivals = 0;
  const app = express();

  app.use(pinoHttp({ logger: testLogger }));
  app.use(express.json());
  app.use("/api/articles/:id", async (req, _res, next) => {
    if (req.method === "PATCH") {
      patchArrivals += 1;
      if (patchArrivals === 2) markBothPatchesArrived();
      await bothPatchesArrived;
    }
    next();
  });
  app.use("/api", createArticlesRouter({
    requireAdmin: (_req, _res, next) => next(),
    storeArticlePhoto: async url => {
      copiedSources.push(url);
      markPhotoSaveStarted();
      await photoSaveGate;
      const storedUrl = `/api/storage/article-photos/${randomUUID()}.webp`;
      storedImageUrls.push(storedUrl);
      return storedUrl;
    },
  }));

  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const apiUrl = `http://127.0.0.1:${address.port}/api`;
  let responsesPromise: Promise<Response[]> | undefined;

  try {
    const [category] = await db
      .insert(categoriesTable)
      .values({
        name: `Testkategorie parallel ${suffix}`,
        slug: `image-provenance-concurrent-${suffix}`,
        color: "#123456",
        description: "Kategorie für den parallelen Bildwechseltest",
      })
      .returning({ id: categoriesTable.id });
    categoryId = category!.id;

    const insertedArticles = await db
      .insert(articlesTable)
      .values([1, 2].map(number => ({
        title: `Paralleler Bildwechsel ${number} ${suffix}`,
        slug: `image-provenance-concurrent-${number}-${suffix}`,
        excerpt: "Testauszug",
        content: "Testinhalt",
        categoryId: categoryId!,
        author: "Redaktion",
        imageUrl: `/api/storage/article-photos/${randomUUID()}.webp`,
        imageSourceUrl: `https://upload.wikimedia.org/wikipedia/commons/e/e${number}/previous-${number}.jpg`,
      })))
      .returning({ id: articlesTable.id });
    articleIds.push(...insertedArticles.map(article => article.id));

    const patchRequests = insertedArticles.map(article =>
      fetch(`${apiUrl}/articles/${article.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageUrl: sourceUrl }),
      }),
    );
    responsesPromise = Promise.all(patchRequests);

    await Promise.all([photoSaveStarted, bothPatchesArrived]);
    unblockPhotoSave();

    const responses = await responsesPromise;
    assert.deepEqual(
      responses.map(response => response.status).sort(),
      [200, 409],
      "only one article should be allowed to claim the shared photo",
    );
    assert.deepEqual(copiedSources, [sourceUrl], "the losing update must not create another stored object");
    assert.equal(storedImageUrls.length, 1, "only one object should have been written to storage");

    const savedArticles = await db
      .select({
        id: articlesTable.id,
        imageUrl: articlesTable.imageUrl,
        imageSourceUrl: articlesTable.imageSourceUrl,
      })
      .from(articlesTable)
      .where(eq(articlesTable.categoryId, categoryId));
    const photoOwners = savedArticles.filter(article => article.imageSourceUrl === sourceUrl);
    assert.equal(photoOwners.length, 1);
    assert.equal(photoOwners[0]!.imageUrl, storedImageUrls[0]);
  } finally {
    unblockPhotoSave();
    if (responsesPromise) await responsesPromise.catch(() => undefined);
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
    if (articleIds.length > 0) {
      await db.delete(articlesTable).where(eq(articlesTable.id, articleIds[0]!));
      if (articleIds.length > 1) {
        await db.delete(articlesTable).where(eq(articlesTable.id, articleIds[1]!));
      }
    }
    if (categoryId !== undefined) {
      await db.delete(categoriesTable).where(eq(categoriesTable.id, categoryId));
    }
  }
});
