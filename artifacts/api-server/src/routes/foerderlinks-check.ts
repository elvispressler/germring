import { createHash } from "node:crypto";

export const MAX_BODY_BYTES = 1_500_000;
export const MAX_STORED_VISIBLE_TEXT_CHARS = 120_000;
export const MAX_COMPARISON_TEXT_CHARS = 24_000;
export const REQUEST_TIMEOUT_MS = 15_000;
export const MAX_REDIRECTS = 5;

export type CheckedLink = {
  status: number | null;
  finalUrl: string | null;
  redirectCount: number;
  redirectWarning: boolean;
  contentHash: string | null;
  contentType: string | null;
  contentLength: number | null;
  pageTitle: string | null;
  visibleText: string | null;
  error: string | null;
};

type ReadBodyResult = {
  body: Buffer;
  byteLength: number;
};

type TimedResponse = {
  response: Response;
  signal: AbortSignal;
  clearTimeout: () => void;
};

function timeoutError(): Error {
  return new Error(
    `Zeitüberschreitung nach ${REQUEST_TIMEOUT_MS / 1000} Sekunden.`,
  );
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException || error instanceof Error) &&
    error.name === "AbortError"
  );
}

async function cancelReader(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): Promise<void> {
  try {
    await reader.cancel();
  } catch {
    // The request has already been aborted; cancellation is best effort.
  }
}

async function readNextChunk(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  signal: AbortSignal,
): Promise<Awaited<ReturnType<typeof reader.read>>> {
  if (signal.aborted) {
    await cancelReader(reader);
    throw timeoutError();
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const onAbort = () => {
      if (settled) return;
      settled = true;
      void cancelReader(reader);
      reject(timeoutError());
    };
    const finish = () => {
      signal.removeEventListener("abort", onAbort);
    };

    signal.addEventListener("abort", onAbort, { once: true });
    void Promise.resolve()
      .then(() => reader.read())
      .then(
        (result) => {
          finish();
          if (settled) return;
          settled = true;
          resolve(result);
        },
        (error: unknown) => {
          finish();
          if (settled) return;
          settled = true;
          reject(error);
        },
      );
  });
}

export async function readLimitedBody(
  response: Response,
  signal: AbortSignal,
): Promise<ReadBodyResult> {
  if (signal.aborted) throw timeoutError();
  if (!response.body) return { body: Buffer.alloc(0), byteLength: 0 };

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let byteLength = 0;
  let retainedByteLength = 0;

  try {
    while (true) {
      const { done, value } = await readNextChunk(reader, signal);
      if (done) break;

      const chunk = Buffer.from(value);
      byteLength += chunk.length;
      const bytesRemaining = MAX_BODY_BYTES - retainedByteLength;
      if (bytesRemaining > 0) {
        const retainedChunk = chunk.subarray(0, bytesRemaining);
        chunks.push(retainedChunk);
        retainedByteLength += retainedChunk.length;
      }

      if (byteLength >= MAX_BODY_BYTES) {
        await reader.cancel();
        break;
      }
    }
  } catch (error) {
    if (signal.aborted || isAbortError(error)) {
      throw timeoutError();
    }
    throw error;
  }

  return { body: Buffer.concat(chunks), byteLength };
}

function normalizeVisibleText(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function storedVisibleText(value: string): string {
  if (value.length <= MAX_STORED_VISIBLE_TEXT_CHARS) return value;
  return `${value.slice(0, MAX_STORED_VISIBLE_TEXT_CHARS)}\n[Text für den Vergleich gekürzt]`;
}

function extractVisibleText(body: Buffer, contentType: string | null): string {
  const isHtml = contentType?.toLowerCase().includes("html") ?? false;
  if (!isHtml) return normalizeVisibleText(body.toString("utf8"));

  return normalizeVisibleText(
    body
      .toString("utf8")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(
        /<\/?(?:address|article|aside|blockquote|br|dd|div|dl|dt|footer|h[1-6]|header|li|main|nav|ol|p|section|table|td|th|tr|ul)[^>]*>/gi,
        "\n",
      )
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">"),
  );
}

function fingerprintText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export type ContentFocus = "amount" | "deadline" | "condition";

const CONTENT_FOCUS_PATTERNS: Record<ContentFocus, RegExp> = {
  amount:
    /\b\d[\d.\s]*(?:,\d+)?\s*(?:€|EUR|Euro|%|Prozent)\b|(?:€|EUR|Euro|%|Prozent)/i,
  deadline:
    /\b(?:frist|bis zum|spätestens|innerhalb|ab dem|gültig|beantragen bis|202[0-9]|203[0-9])\b/i,
  condition:
    /\b(?:voraussetzung|förderfähig|förderung|antrag|vorhabenbeginn|berechtigt|ausgeschlossen|muss|kann|nur wenn|mindestens|maximal|höchstens|bedingung|einkommen)\b/i,
};

function focusForText(text: string): ContentFocus[] {
  return (Object.keys(CONTENT_FOCUS_PATTERNS) as ContentFocus[]).filter(
    (focus) => CONTENT_FOCUS_PATTERNS[focus].test(text),
  );
}

export type ContentDiff = {
  available: boolean;
  changed: boolean;
  previousCheckedAt: string | null;
  before: string | null;
  after: string | null;
  focus: ContentFocus[];
};

function compactComparison(
  before: string,
  after: string,
): { before: string; after: string } {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  let prefix = 0;
  while (
    prefix < beforeLines.length &&
    prefix < afterLines.length &&
    beforeLines[prefix] === afterLines[prefix]
  ) {
    prefix += 1;
  }

  let suffix = 0;
  while (
    suffix < beforeLines.length - prefix &&
    suffix < afterLines.length - prefix &&
    beforeLines[beforeLines.length - 1 - suffix] ===
      afterLines[afterLines.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const context = 2;
  const beforeStart = Math.max(0, prefix - context);
  const afterStart = Math.max(0, prefix - context);
  const beforeEnd = Math.min(
    beforeLines.length,
    beforeLines.length - suffix + context,
  );
  const afterEnd = Math.min(
    afterLines.length,
    afterLines.length - suffix + context,
  );

  const format = (lines: string[], start: number, end: number): string => {
    const hasLeadingOmission = start > 0;
    const hasTrailingOmission = end < lines.length;
    const content = lines.slice(start, end).join("\n");
    const withMarkers = [
      hasLeadingOmission ? "… vorherige unveränderte Zeilen …" : "",
      content,
      hasTrailingOmission ? "… nachfolgende unveränderte Zeilen …" : "",
    ]
      .filter(Boolean)
      .join("\n");
    return withMarkers.length <= MAX_COMPARISON_TEXT_CHARS
      ? withMarkers
      : `${withMarkers.slice(0, MAX_COMPARISON_TEXT_CHARS)}\n… Vergleichsausschnitt gekürzt …`;
  };

  return {
    before: format(beforeLines, beforeStart, beforeEnd),
    after: format(afterLines, afterStart, afterEnd),
  };
}

/**
 * Keeps the editorial comparison deliberately compact: the complete previous
 * and current visible text are retained, while the response also identifies
 * the changed subject areas that deserve a manual check.
 */
export function buildContentDiff(
  previousText: string | null | undefined,
  currentText: string | null | undefined,
  previousCheckedAt: Date | string | null | undefined,
): ContentDiff {
  const before = previousText?.trim() || null;
  const after = currentText?.trim() || null;
  if (!before || !after) {
    return {
      available: false,
      changed: false,
      previousCheckedAt: previousCheckedAt
        ? new Date(previousCheckedAt).toISOString()
        : null,
      before,
      after,
      focus: [],
    };
  }

  const changed = before !== after;
  const comparison = changed ? compactComparison(before, after) : null;
  return {
    available: true,
    changed,
    previousCheckedAt: previousCheckedAt
      ? new Date(previousCheckedAt).toISOString()
      : null,
    before: comparison?.before ?? before,
    after: comparison?.after ?? after,
    focus: changed ? focusForText(`${before}\n${after}`) : [],
  };
}

export function fingerprint(
  body: Buffer,
  contentType: string | null,
): { hash: string; pageTitle: string | null; visibleText: string } {
  const isHtml = contentType?.toLowerCase().includes("html") ?? false;
  const visibleText = extractVisibleText(body, contentType);
  if (!isHtml) {
    return {
      hash: createHash("sha256").update(body).digest("hex"),
      pageTitle: null,
      visibleText: storedVisibleText(visibleText),
    };
  }

  const html = body.toString("utf8");
  const title =
    html
      .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300) || null;
  return {
    hash: createHash("sha256")
      .update(fingerprintText(visibleText))
      .digest("hex"),
    pageTitle: title,
    visibleText: storedVisibleText(visibleText),
  };
}

async function fetchWithTimeout(url: string): Promise<TimedResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let timeoutCleared = false;
  const clearRequestTimeout = () => {
    if (timeoutCleared) return;
    timeoutCleared = true;
    clearTimeout(timeout);
  };

  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/pdf,text/plain;q=0.8,*/*;q=0.1",
        "user-agent": "germring.de Förderlink-Prüfung/1.0",
      },
    });
    return {
      response,
      signal: controller.signal,
      clearTimeout: clearRequestTimeout,
    };
  } catch (error) {
    clearRequestTimeout();
    if (isAbortError(error)) {
      throw timeoutError();
    }
    throw error;
  }
}

export async function checkLink(url: string): Promise<CheckedLink> {
  let currentUrl = url;
  let redirectCount = 0;
  let redirectWarning = false;
  const originalHost = new URL(url).host;

  for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt += 1) {
    let timedResponse: TimedResponse;
    try {
      timedResponse = await fetchWithTimeout(currentUrl);
    } catch (error) {
      return {
        status: null,
        finalUrl: currentUrl,
        redirectCount,
        redirectWarning,
        contentHash: null,
        contentType: null,
        contentLength: null,
        pageTitle: null,
        visibleText: null,
        error:
          error instanceof Error
            ? error.message
            : "Verbindung konnte nicht hergestellt werden.",
      };
    }

    const { response, signal, clearTimeout } = timedResponse;
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        clearTimeout();
        return {
          status: response.status,
          finalUrl: currentUrl,
          redirectCount,
          redirectWarning: true,
          contentHash: null,
          contentType: response.headers.get("content-type"),
          contentLength: null,
          pageTitle: null,
          visibleText: null,
          error: "Weiterleitung ohne Zieladresse.",
        };
      }
      if (redirectCount >= MAX_REDIRECTS) {
        clearTimeout();
        return {
          status: response.status,
          finalUrl: currentUrl,
          redirectCount,
          redirectWarning: true,
          contentHash: null,
          contentType: response.headers.get("content-type"),
          contentLength: null,
          pageTitle: null,
          visibleText: null,
          error: `Zu viele Weiterleitungen (mehr als ${MAX_REDIRECTS}).`,
        };
      }

      let nextUrl: string;
      try {
        nextUrl = new URL(location, currentUrl).toString();
      } catch {
        clearTimeout();
        return {
          status: response.status,
          finalUrl: currentUrl,
          redirectCount,
          redirectWarning: true,
          contentHash: null,
          contentType: response.headers.get("content-type"),
          contentLength: null,
          pageTitle: null,
          visibleText: null,
          error: "Weiterleitung enthält keine gültige Zieladresse.",
        };
      }
      redirectWarning ||=
        new URL(nextUrl).host !== originalHost || redirectCount > 0;
      redirectCount += 1;
      currentUrl = nextUrl;
      clearTimeout();
      await response.body?.cancel();
      continue;
    }

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      clearTimeout();
      return {
        status: response.status,
        finalUrl: currentUrl,
        redirectCount,
        redirectWarning,
        contentHash: null,
        contentType,
        contentLength: null,
        pageTitle: null,
        visibleText: null,
        error: `HTTP ${response.status}${response.statusText ? ` (${response.statusText})` : ""}.`,
      };
    }

    let bodyResult: ReadBodyResult;
    try {
      bodyResult = await readLimitedBody(response, signal);
    } catch (error) {
      clearTimeout();
      if (!signal.aborted && !isAbortError(error)) throw error;
      return {
        status: null,
        finalUrl: currentUrl,
        redirectCount,
        redirectWarning,
        contentHash: null,
        contentType: null,
        contentLength: null,
        pageTitle: null,
        visibleText: null,
        error: timeoutError().message,
      };
    }
    clearTimeout();
    const { body, byteLength } = bodyResult;
    const { hash, pageTitle, visibleText } = fingerprint(body, contentType);
    return {
      status: response.status,
      finalUrl: currentUrl,
      redirectCount,
      redirectWarning,
      contentHash: hash,
      contentType,
      contentLength: byteLength,
      pageTitle,
      visibleText,
      error: null,
    };
  }

  return {
    status: null,
    finalUrl: currentUrl,
    redirectCount,
    redirectWarning: true,
    contentHash: null,
    contentType: null,
    contentLength: null,
    pageTitle: null,
    visibleText: null,
    error: "Weiterleitung konnte nicht abgeschlossen werden.",
  };
}

export function statusKind(
  result: Pick<
    CheckedLink,
    "error" | "contentHash" | "redirectWarning" | "redirectCount"
  >,
  previousHash: string | null | undefined,
): string {
  if (result.error) return "error";
  if (previousHash && result.contentHash && previousHash !== result.contentHash)
    return "changed";
  if (result.redirectWarning) return "redirect";
  if (result.redirectCount > 0) return "redirect";
  return "ok";
}
