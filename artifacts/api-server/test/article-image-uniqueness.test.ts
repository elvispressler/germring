import assert from "node:assert/strict";
import test from "node:test";
import {
  articleImageIdentity,
  createArticleImageOwners,
  findArticleImageDuplicate,
  hideDuplicateArticleImages,
  isEditoriallyRelevantArticleImage,
} from "../src/lib/article-image-uniqueness.ts";

test("treats image resizing query parameters as the same photo", () => {
  assert.equal(
    articleImageIdentity("https://images.unsplash.com/photo-123?w=1200&q=80"),
    articleImageIdentity("https://images.unsplash.com/photo-123?w=640&q=60"),
  );
});

test("treats Wikimedia Commons thumbnails as their original source photo", () => {
  assert.equal(
    articleImageIdentity("https://upload.wikimedia.org/wikipedia/commons/a/a1/Example.jpg"),
    articleImageIdentity("https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Example.jpg/640px-Example.jpg"),
  );
});

test("keeps the newest article as the sole visible owner of a repeated photo", () => {
  const articles = [
    { id: 1, imageUrl: "https://images.unsplash.com/photo-123?w=1200", publishedAt: "2026-01-01" },
    { id: 2, imageUrl: "https://images.unsplash.com/photo-123?w=640", publishedAt: "2026-02-01" },
    { id: 3, imageUrl: "https://images.unsplash.com/photo-456?w=1200", publishedAt: "2026-01-15" },
  ];
  const owners = createArticleImageOwners(articles);
  const visible = hideDuplicateArticleImages(articles, owners);

  assert.equal(owners.get("images.unsplash.com/photo-123"), 2);
  assert.equal(visible[0].imageUrl, null);
  assert.equal(visible[1].imageUrl, articles[1].imageUrl);
  assert.equal(visible[2].imageUrl, articles[2].imageUrl);
});

test("uses preserved source URLs to suppress duplicates after photos are stored locally", () => {
  const sourceUrl = "https://images.unsplash.com/photo-123?w=1200&q=80";
  const articles = [
    {
      id: 1,
      imageUrl: "/api/storage/article-photos/older.jpg",
      imageSourceUrl: "https://images.unsplash.com/photo-123?w=640&q=60",
      publishedAt: "2026-01-01",
    },
    {
      id: 2,
      imageUrl: "/api/storage/article-photos/newer.jpg",
      imageSourceUrl: sourceUrl,
      publishedAt: "2026-02-01",
    },
  ];
  const owners = createArticleImageOwners(articles);
  const visible = hideDuplicateArticleImages(articles, owners);

  assert.equal(visible[0].imageUrl, null);
  assert.equal(visible[1].imageUrl, articles[1].imageUrl);
  assert.equal(findArticleImageDuplicate(articles, sourceUrl)?.id, 1);
});

test("finds a duplicate image but allows the article keeping its current image", () => {
  const articles = [
    { id: 1, imageUrl: "https://images.unsplash.com/photo-123?w=1200" },
    { id: 2, imageUrl: "https://images.unsplash.com/photo-456?w=1200" },
  ];

  assert.equal(
    findArticleImageDuplicate(articles, "https://images.unsplash.com/photo-123?w=640")?.id,
    1,
  );
  assert.equal(
    findArticleImageDuplicate(articles, "https://images.unsplash.com/photo-123?w=640", 1),
    undefined,
  );
});

test("suppresses a known child-focused stock image unrelated to the article topics", () => {
  const image = "https://images.unsplash.com/photo-1548102245-c79dbcfa9f92?w=1200&q=80";
  assert.equal(isEditoriallyRelevantArticleImage(image), false);
  assert.equal(
    hideDuplicateArticleImages(
      [{ id: 1, imageUrl: image }],
      new Map([[articleImageIdentity(image)!, 1]]),
    )[0].imageUrl,
    null,
  );
});