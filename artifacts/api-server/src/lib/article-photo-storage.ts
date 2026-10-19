import { lookup } from "node:dns/promises";
import { randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { Storage, type File } from "@google-cloud/storage";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_REDIRECTS = 3;
export const ARTICLE_PHOTO_URL_PREFIX = "/api/storage/article-photos/";
const ARTICLE_PHOTO_FILENAME_PATTERN =
  "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(?:jpg|png|webp|gif|avif)";
const ARTICLE_PHOTO_FILENAME = new RegExp(`^${ARTICLE_PHOTO_FILENAME_PATTERN}$`, "i");
const ARTICLE_PHOTO_URL = new RegExp(
  `^${ARTICLE_PHOTO_URL_PREFIX}${ARTICLE_PHOTO_FILENAME_PATTERN}$`,
  "i",
);
const IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export function isStoredArticlePhoto(url: string | null | undefined): boolean {
  return typeof url === "string" && ARTICLE_PHOTO_URL.test(url);
}

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 0 || b === 168)) ||
    (a === 192 && b === 0 && parts[2] === 2) ||
    (a === 198 && b === 51 && parts[2] === 100) ||
    (a === 203 && b === 0 && parts[2] === 113) ||
    (a === 198 && (b === 18 || b === 19));
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase().split("%")[0];
  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.slice("::ffff:".length);
    return isIP(mapped) === 4 ? isPrivateIpv4(mapped) : true;
  }
  return normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8:");
}

export async function validateRemoteImageUrl(rawUrl: string): Promise<URL> {
  const url = new URL(rawUrl);
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (
    url.protocol !== "https:" ||
    (url.port !== "" && url.port !== "443") ||
    url.username ||
    url.password ||
    !hostname.includes(".") ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    isIP(hostname) !== 0
  ) {
    throw new Error("Unsupported image URL");
  }

  const resolved = await lookup(hostname, { all: true, verbatim: true });
  if (resolved.length === 0 || resolved.some(({ address }) => {
    const version = isIP(address);
    return version === 4 ? isPrivateIpv4(address) : version === 6 ? isPrivateIpv6(address) : true;
  })) {
    throw new Error("Image host is not publicly routable");
  }
  return url;
}

function publicObjectSearchPaths(): string[] {
  const paths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS ?? "")
    .split(",")
    .map(path => path.trim())
    .filter(Boolean);
  if (paths.length === 0) {
    throw new Error("Public object storage is not configured");
  }
  return paths;
}

function parseStoragePath(rawPath: string): { bucketName: string; prefix: string } {
  const withoutScheme = rawPath.startsWith("gs://")
    ? rawPath.slice("gs://".length)
    : rawPath.replace(/^\/+/, "");
  const [bucketName, ...prefixParts] = withoutScheme.split("/").filter(Boolean);
  if (!bucketName) throw new Error("Invalid public object storage path");
  return { bucketName, prefix: prefixParts.join("/") };
}

async function downloadImage(sourceUrl: string): Promise<{ bytes: Buffer; contentType: string }> {
  let currentUrl = await validateRemoteImageUrl(sourceUrl);

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const response = await fetch(currentUrl, {
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif" },
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || redirects === MAX_REDIRECTS) {
        throw new Error("Image source redirected too many times");
      }
      currentUrl = await validateRemoteImageUrl(new URL(location, currentUrl).toString());
      continue;
    }

    if (!response.ok || !response.body) {
      throw new Error("Image source could not be downloaded");
    }

    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
    if (!IMAGE_TYPES.has(contentType)) {
      await response.body.cancel();
      throw new Error("Image source returned an unsupported format");
    }

    const declaredSize = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredSize) && declaredSize > MAX_IMAGE_BYTES) {
      await response.body.cancel();
      throw new Error("Image is too large");
    }

    const reader = response.body.getReader();
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > MAX_IMAGE_BYTES) {
          await reader.cancel();
          throw new Error("Image is too large");
        }
        chunks.push(Buffer.from(value));
      }
    } finally {
      reader.releaseLock();
    }
    return { bytes: Buffer.concat(chunks, totalBytes), contentType };
  }

  throw new Error("Image source could not be downloaded");
}

function publicObjectFile(relativePath: string): File {
  const { bucketName, prefix } = parseStoragePath(publicObjectSearchPaths()[0]);
  const objectName = [prefix, relativePath].filter(Boolean).join("/");
  return objectStorageClient.bucket(bucketName).file(objectName);
}

export async function storeArticlePhoto(sourceUrl: string): Promise<string> {
  const { bytes, contentType } = await downloadImage(sourceUrl);
  const extension = IMAGE_TYPES.get(contentType);
  if (!extension) throw new Error("Image source returned an unsupported format");

  const filename = `${randomUUID()}.${extension}`;
  const file = publicObjectFile(`article-photos/${filename}`);
  await file.save(bytes, {
    resumable: false,
    metadata: {
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  return `${ARTICLE_PHOTO_URL_PREFIX}${filename}`;
}

export async function findStoredArticlePhoto(filename: string): Promise<File | null> {
  if (!ARTICLE_PHOTO_FILENAME.test(filename)) return null;
  for (const searchPath of publicObjectSearchPaths()) {
    const { bucketName, prefix } = parseStoragePath(searchPath);
    const objectName = [prefix, "article-photos", filename].filter(Boolean).join("/");
    const file = objectStorageClient.bucket(bucketName).file(objectName);
    const [exists] = await file.exists();
    if (exists) return file;
  }
  return null;
}