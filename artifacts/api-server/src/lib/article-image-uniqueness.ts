export type ArticleImageRecord = {
  id: number;
  imageUrl: string | null;
  imageSourceUrl?: string | null;
  publishedAt?: string | Date | null;
};

const editoriallyExcludedImageIdentities = new Set([
  // This stock image shows children and is unrelated to its energy article.
  "images.unsplash.com/photo-1548102245-c79dbcfa9f92",
]);

export function articleImageIdentity(imageUrl: string | null | undefined): string | null {
  if (!imageUrl?.trim()) return null;

  try {
    const url = new URL(imageUrl.trim());
    const hostname = url.hostname.toLowerCase();
    const path = url.pathname.replace(/\/+$/, "");
    const commonsThumbnail = hostname === "upload.wikimedia.org" || hostname === "thumb.wikimedia.org"
      ? path.match(/^\/wikipedia\/commons\/thumb\/(.+)\/\d+px-[^/]+$/)
      : null;
    const identityPath = commonsThumbnail
      ? `/wikipedia/commons/${commonsThumbnail[1]}`
      : path;
    const identityHostname = commonsThumbnail ? "upload.wikimedia.org" : hostname;
    return `${identityHostname}${url.port ? `:${url.port}` : ""}${identityPath}`;
  } catch {
    return imageUrl.trim().split(/[?#]/, 1)[0].replace(/\/+$/, "");
  }
}

export function isEditoriallyRelevantArticleImage(imageUrl: string | null | undefined): boolean {
  const identity = articleImageIdentity(imageUrl);
  return !identity || !editoriallyExcludedImageIdentities.has(identity);
}

function publishedTime(value: ArticleImageRecord["publishedAt"]): number {
  const time = value instanceof Date
    ? value.getTime()
    : typeof value === "string"
      ? Date.parse(value)
      : 0;
  return Number.isFinite(time) ? time : 0;
}

export function createArticleImageOwners(
  articles: ArticleImageRecord[],
): Map<string, number> {
  const owners = new Map<string, number>();
  const newestFirst = [...articles].sort(
    (a, b) => publishedTime(b.publishedAt) - publishedTime(a.publishedAt) || b.id - a.id,
  );

  for (const article of newestFirst) {
    const identity = articleImageIdentity(article.imageSourceUrl || article.imageUrl);
    if (identity && !owners.has(identity)) owners.set(identity, article.id);
  }

  return owners;
}

export function hideDuplicateArticleImages<T extends ArticleImageRecord>(
  articles: T[],
  owners: Map<string, number>,
): T[] {
  return articles.map((article) => {
    const imageIdentityUrl = article.imageSourceUrl || article.imageUrl;
    const identity = articleImageIdentity(imageIdentityUrl);
    if (
      !identity ||
      (isEditoriallyRelevantArticleImage(imageIdentityUrl) && owners.get(identity) === article.id)
    ) {
      return article;
    }
    return { ...article, imageUrl: null };
  });
}

export function findArticleImageDuplicate<T extends Pick<ArticleImageRecord, "id" | "imageUrl"> & Partial<Pick<ArticleImageRecord, "imageSourceUrl">>>(
  articles: T[],
  imageUrl: string,
  excludedArticleId?: number,
): T | undefined {
  const identity = articleImageIdentity(imageUrl);
  if (!identity) return undefined;

  return articles.find(
    (article) =>
      article.id !== excludedArticleId &&
      articleImageIdentity(article.imageSourceUrl || article.imageUrl) === identity,
  );
}