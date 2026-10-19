import assert from "node:assert/strict";
import test from "node:test";
import {
  isStoredArticlePhoto,
  validateRemoteImageUrl,
} from "../src/lib/article-photo-storage.ts";

test("recognizes only generated project-owned article photo paths", () => {
  assert.equal(
    isStoredArticlePhoto("/api/storage/article-photos/550e8400-e29b-41d4-a716-446655440000.webp"),
    true,
  );
  assert.equal(
    isStoredArticlePhoto("https://example.com/api/storage/article-photos/550e8400-e29b-41d4-a716-446655440000.webp"),
    false,
  );
  assert.equal(isStoredArticlePhoto("/api/storage/article-photos/../../admin.jpg"), false);
});

test("rejects insecure and local image sources before attempting network access", async () => {
  await assert.rejects(validateRemoteImageUrl("http://images.unsplash.com/photo-123.jpg"));
  await assert.rejects(validateRemoteImageUrl("https://localhost/photo.jpg"));
  await assert.rejects(validateRemoteImageUrl("https://127.0.0.1/photo.jpg"));
  await assert.rejects(validateRemoteImageUrl("https://images.unsplash.com:8443/photo.jpg"));
});