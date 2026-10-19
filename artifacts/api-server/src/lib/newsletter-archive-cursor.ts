export type NewsletterArchiveCursor = {
  sentAt: Date;
  id: number;
};

export function encodeNewsletterArchiveCursor(cursor: NewsletterArchiveCursor): string {
  return Buffer.from(JSON.stringify({
    sentAt: cursor.sentAt.toISOString(),
    id: cursor.id,
  })).toString("base64url");
}

export function decodeNewsletterArchiveCursor(value: string): NewsletterArchiveCursor | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;

  try {
    const decoded: unknown = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (
      typeof decoded !== "object"
      || decoded === null
      || !("sentAt" in decoded)
      || !("id" in decoded)
      || typeof decoded.sentAt !== "string"
      || typeof decoded.id !== "number"
      || !Number.isSafeInteger(decoded.id)
      || decoded.id <= 0
    ) {
      return null;
    }

    const sentAt = new Date(decoded.sentAt);
    if (!Number.isFinite(sentAt.getTime()) || sentAt.toISOString() !== decoded.sentAt) return null;

    return { sentAt, id: decoded.id };
  } catch {
    return null;
  }
}