import { Router } from "express";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db, foerderlinkChecksTable } from "@workspace/db";
import { getFundingLinkCheckItems } from "@workspace/foerderlink-sources";
import { requireAdminPin } from "../middleware/adminAuth.ts";
import {
  buildContentDiff,
  checkLink,
  statusKind,
  type CheckedLink,
} from "./foerderlinks-check.ts";
import { getFoerderlinkCheckIntervalHours } from "../lib/foerderlink-schedule.ts";

const router = Router();
const MAX_SOURCES = 100;

export type FundingLinkInput = {
  sourceId: string;
  programId: string;
  programTitle: string;
  label: string;
  href: string;
  url: string;
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function sourceInput(raw: unknown): FundingLinkInput[] {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_SOURCES) {
    throw new Error(`Es werden 1 bis ${MAX_SOURCES} Förderquellen erwartet.`);
  }

  const seen = new Set<string>();
  return raw.map((value, index) => {
    if (!value || typeof value !== "object") {
      throw new Error(`Quelle ${index + 1} ist ungültig.`);
    }

    const item = value as Partial<FundingLinkInput>;
    const fields = [
      "sourceId",
      "programId",
      "programTitle",
      "label",
      "href",
      "url",
    ] as const;
    if (
      fields.some(
        (field) => typeof item[field] !== "string" || !item[field]?.trim(),
      )
    ) {
      throw new Error(`Quelle ${index + 1} enthält unvollständige Angaben.`);
    }
    if (!isHttpUrl(item.url!)) {
      throw new Error(
        `Quelle „${item.label}“ enthält keine prüfbare HTTP-Adresse.`,
      );
    }
    if (seen.has(item.sourceId!)) {
      throw new Error(`Die Quelle „${item.label}“ ist doppelt vorhanden.`);
    }
    seen.add(item.sourceId!);

    return {
      sourceId: item.sourceId!.trim(),
      programId: item.programId!.trim(),
      programTitle: item.programTitle!.trim(),
      label: item.label!.trim(),
      href: item.href!.trim(),
      url: item.url!.trim(),
    };
  });
}

export function publicResult(
  input: FundingLinkInput,
  result: CheckedLink,
  previous: typeof foerderlinkChecksTable.$inferSelect | undefined,
  checkedAt: Date,
) {
  return {
    sourceId: input.sourceId,
    programId: input.programId,
    programTitle: input.programTitle,
    label: input.label,
    href: input.href,
    url: input.url,
    checkedAt: checkedAt.toISOString(),
    status: result.status,
    statusKind: statusKind(result, previous?.contentHash),
    finalUrl: result.finalUrl,
    redirected: result.redirectCount > 0,
    redirectCount: result.redirectCount,
    redirectWarning: result.redirectWarning,
    changedSinceLastCheck: Boolean(
      previous?.contentHash &&
      result.contentHash &&
      previous.contentHash !== result.contentHash,
    ),
    firstCheck: !previous,
    previousCheckedAt:
      previous?.contentCheckedAt?.toISOString() ??
      previous?.previousContentCheckedAt?.toISOString() ??
      previous?.lastCheckedAt?.toISOString() ??
      null,
    pageTitle: result.pageTitle,
    contentType: result.contentType,
    contentLength: result.contentLength,
    contentDiff: buildContentDiff(
      previous?.visibleText,
      result.visibleText,
      previous?.contentCheckedAt ??
        previous?.previousContentCheckedAt ??
        previous?.lastCheckedAt,
    ),
    error: result.error,
  };
}

function storedResult(row: typeof foerderlinkChecksTable.$inferSelect) {
  const hasError = Boolean(row.error);
  const redirect = row.redirectCount > 0;
  const contentDiff = buildContentDiff(
    row.previousVisibleText,
    row.visibleText,
    row.previousContentCheckedAt,
  );
  return {
    sourceId: row.sourceId,
    programId: row.programId,
    programTitle: row.programTitle,
    label: row.label,
    href: row.href,
    url: row.href,
    checkedAt: row.lastCheckedAt.toISOString(),
    status: row.status,
    statusKind: hasError
      ? "error"
      : contentDiff.changed
        ? "changed"
        : redirect
          ? "redirect"
          : "ok",
    finalUrl: row.finalUrl,
    redirected: redirect,
    redirectCount: row.redirectCount,
    redirectWarning: redirect,
    changedSinceLastCheck: contentDiff.changed,
    firstCheck: false,
    previousCheckedAt: contentDiff.previousCheckedAt,
    pageTitle: row.pageTitle,
    contentType: row.contentType,
    contentLength: row.contentLength,
    contentDiff,
    error: row.error,
  };
}

export type FundingLinkCheckRun = {
  checkedAt: Date;
  total: number;
  summary: {
    ok: number;
    errors: number;
    redirects: number;
    changed: number;
  };
  results: ReturnType<typeof publicResult>[];
};

export async function runFundingLinkCheck(
  inputs: FundingLinkInput[],
): Promise<FundingLinkCheckRun> {
  const sourceIds = inputs.map((input) => input.sourceId);
  const previousRows = await db
    .select()
    .from(foerderlinkChecksTable)
    .where(inArray(foerderlinkChecksTable.sourceId, sourceIds));
  const previousById = new Map(previousRows.map((row) => [row.sourceId, row]));
  const effectiveInputs = inputs.map((input) => {
    const previous = previousById.get(input.sourceId);
    if (!previous || previous.href === input.href || !isHttpUrl(previous.href)) {
      return input;
    }
    return { ...input, href: previous.href, url: previous.href };
  });
  const checkedAt = new Date();
  const checked = await Promise.all(
    effectiveInputs.map(async (input) => ({
      input,
      result: await checkLink(input.url),
    })),
  );

  await db.transaction(async (tx) => {
    for (const { input, result } of checked) {
      const previous = previousById.get(input.sourceId);
      await tx
        .insert(foerderlinkChecksTable)
        .values({
          sourceId: input.sourceId,
          programId: input.programId,
          programTitle: input.programTitle,
          label: input.label,
          href: input.href,
          lastCheckedAt: checkedAt,
          status: result.status,
          finalUrl: result.finalUrl,
          redirectCount: result.redirectCount,
          contentHash: result.contentHash ?? previous?.contentHash ?? null,
          contentType: result.contentType,
          contentLength: result.contentLength,
          pageTitle: result.pageTitle,
          visibleText: result.visibleText ?? previous?.visibleText ?? null,
          contentCheckedAt:
            result.visibleText !== null
              ? checkedAt
              : (previous?.contentCheckedAt ?? null),
          previousVisibleText:
            result.visibleText !== null
              ? (previous?.visibleText ?? null)
              : (previous?.previousVisibleText ?? null),
          previousContentCheckedAt:
            result.visibleText !== null
              ? (previous?.contentCheckedAt ??
                previous?.previousContentCheckedAt ??
                previous?.lastCheckedAt ??
                null)
              : (previous?.previousContentCheckedAt ?? null),
          error: result.error,
        })
        .onConflictDoUpdate({
          target: foerderlinkChecksTable.sourceId,
          set: {
            programId: input.programId,
            programTitle: input.programTitle,
            label: input.label,
            href: input.href,
            lastCheckedAt: checkedAt,
            status: result.status,
            finalUrl: result.finalUrl,
            redirectCount: result.redirectCount,
            contentHash: result.contentHash ?? previous?.contentHash ?? null,
            contentType: result.contentType,
            contentLength: result.contentLength,
            pageTitle: result.pageTitle,
            visibleText: result.visibleText ?? previous?.visibleText ?? null,
            contentCheckedAt:
              result.visibleText !== null
                ? checkedAt
                : (previous?.contentCheckedAt ?? null),
            previousVisibleText:
              result.visibleText !== null
                ? (previous?.visibleText ?? null)
                : (previous?.previousVisibleText ?? null),
            previousContentCheckedAt:
              result.visibleText !== null
                ? (previous?.contentCheckedAt ??
                  previous?.previousContentCheckedAt ??
                  previous?.lastCheckedAt ??
                  null)
                : (previous?.previousContentCheckedAt ?? null),
            error: result.error,
          },
        });
    }
  });

  const results = checked.map(({ input, result }) =>
    publicResult(input, result, previousById.get(input.sourceId), checkedAt),
  );
  return {
    checkedAt,
    total: results.length,
    summary: {
      ok: results.filter((item) => item.statusKind === "ok").length,
      errors: results.filter((item) => item.statusKind === "error").length,
      redirects: results.filter((item) => item.statusKind === "redirect")
        .length,
      changed: results.filter((item) => item.changedSinceLastCheck).length,
    },
    results,
  };
}

function isSuccessfulCheck(result: CheckedLink): boolean {
  return (
    result.error === null &&
    result.status !== null &&
    result.status >= 200 &&
    result.status < 300
  );
}

export async function previewFundingLinkReplacement(
  sourceId: string,
  url: string,
): Promise<
  | { eligible: false }
  | {
      eligible: true;
      reachable: boolean;
      status: number | null;
      finalUrl: string | null;
      pageTitle: string | null;
      error: string | null;
    }
> {
  const [source] = await db
    .select()
    .from(foerderlinkChecksTable)
    .where(eq(foerderlinkChecksTable.sourceId, sourceId))
    .limit(1);
  if (!source || source.status !== 404) return { eligible: false };

  const result = await checkLink(url);
  return {
    eligible: true,
    reachable: isSuccessfulCheck(result),
    status: result.status,
    finalUrl: result.finalUrl,
    pageTitle: result.pageTitle,
    error: result.error,
  };
}

export async function saveFundingLinkReplacement(
  sourceId: string,
  url: string,
): Promise<"not_found" | "not_404" | "unreachable" | "conflict" | "saved"> {
  const [source] = await db
    .select()
    .from(foerderlinkChecksTable)
    .where(eq(foerderlinkChecksTable.sourceId, sourceId))
    .limit(1);
  if (!source) return "not_found";
  if (source.status !== 404) return "not_404";

  const checkedAt = new Date();
  const result = await checkLink(url);
  if (!isSuccessfulCheck(result)) return "unreachable";

  const [updated] = await db
    .update(foerderlinkChecksTable)
    .set({
      href: url,
      lastCheckedAt: checkedAt,
      status: result.status,
      finalUrl: result.finalUrl,
      redirectCount: result.redirectCount,
      contentHash: result.contentHash,
      contentType: result.contentType,
      contentLength: result.contentLength,
      pageTitle: result.pageTitle,
      visibleText: result.visibleText,
      contentCheckedAt: result.visibleText !== null ? checkedAt : source.contentCheckedAt,
      previousVisibleText:
        result.visibleText !== null
          ? source.visibleText
          : source.previousVisibleText,
      previousContentCheckedAt:
        result.visibleText !== null
          ? (source.contentCheckedAt ??
            source.previousContentCheckedAt ??
            source.lastCheckedAt)
          : source.previousContentCheckedAt,
      error: null,
    })
    .where(
      and(
        eq(foerderlinkChecksTable.sourceId, sourceId),
        eq(foerderlinkChecksTable.status, 404),
      ),
    )
    .returning({ sourceId: foerderlinkChecksTable.sourceId });

  return updated ? "saved" : "conflict";
}

export async function getFundingLinkTargets(
  defaultSources = getFundingLinkCheckItems("https://germring.de", "/"),
): Promise<
  Array<{ sourceId: string; targetUrl: string }>
> {
  const rows = await db
    .select({
      sourceId: foerderlinkChecksTable.sourceId,
      href: foerderlinkChecksTable.href,
    })
    .from(foerderlinkChecksTable);
  const savedTargets = new Map(rows.map((row) => [row.sourceId, row.href]));
  return defaultSources.flatMap((source) => {
    const targetUrl = savedTargets.get(source.sourceId);
    return targetUrl && targetUrl !== source.href && isHttpUrl(targetUrl)
      ? [{ sourceId: source.sourceId, targetUrl }]
      : [];
  });
}

router.get("/foerder-links/targets", async (req, res): Promise<void> => {
  try {
    res.json({ targets: await getFundingLinkTargets() });
  } catch (error) {
    req.log.error({ err: error }, "Public funding link targets failed");
    res.status(500).json({ error: "Förderlink-Ziele konnten nicht geladen werden." });
  }
});

router.post(
  "/admin/foerder-links/repair-check",
  requireAdminPin,
  async (req, res): Promise<void> => {
    const sourceId = req.body?.sourceId;
    const url = req.body?.url;
    if (
      typeof sourceId !== "string" ||
      !sourceId.trim() ||
      typeof url !== "string" ||
      !isHttpUrl(url)
    ) {
      res.status(400).json({ error: "Quelle oder Ersatzadresse ist ungültig." });
      return;
    }

    try {
      const result = await previewFundingLinkReplacement(sourceId.trim(), url.trim());
      if (!result.eligible) {
        res.status(409).json({
          error: "Nur eine aktuell mit HTTP 404 geprüfte Quelle kann repariert werden.",
        });
        return;
      }
      res.json({ sourceId: sourceId.trim(), url: url.trim(), ...result });
    } catch (error) {
      req.log.error({ err: error }, "Funding link replacement check failed");
      res.status(500).json({ error: "Die Ersatzadresse konnte nicht geprüft werden." });
    }
  },
);

router.post(
  "/admin/foerder-links/repair",
  requireAdminPin,
  async (req, res): Promise<void> => {
    const sourceId = req.body?.sourceId;
    const url = req.body?.url;
    if (
      typeof sourceId !== "string" ||
      !sourceId.trim() ||
      typeof url !== "string" ||
      !isHttpUrl(url)
    ) {
      res.status(400).json({ error: "Quelle oder Ersatzadresse ist ungültig." });
      return;
    }

    try {
      const outcome = await saveFundingLinkReplacement(sourceId.trim(), url.trim());
      if (outcome === "not_found") {
        res.status(404).json({ error: "Die Förderquelle wurde nicht gefunden." });
        return;
      }
      if (outcome === "not_404") {
        res.status(409).json({
          error: "Die Quelle ist nicht mehr mit HTTP 404 geprüft und wurde nicht geändert.",
        });
        return;
      }
      if (outcome === "unreachable") {
        res.status(422).json({
          error: "Das Ersatz-Ziel ist nicht erfolgreich erreichbar und wurde nicht gespeichert.",
        });
        return;
      }
      if (outcome === "conflict") {
        res.status(409).json({
          error: "Die Quelle wurde parallel geändert. Bitte lade den Linkcheck neu.",
        });
        return;
      }
      res.json({ sourceId: sourceId.trim(), url: url.trim(), saved: true });
    } catch (error) {
      req.log.error({ err: error }, "Funding link replacement failed");
      res.status(500).json({ error: "Die Ersatzadresse konnte nicht übernommen werden." });
    }
  },
);

router.get("/admin/foerder-links/status", requireAdminPin, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(foerderlinkChecksTable)
      .orderBy(
        asc(foerderlinkChecksTable.programId),
        asc(foerderlinkChecksTable.label),
      );
    return res.json({
      checkedAt:
        rows.length > 0
          ? rows
              .reduce(
                (latest, row) =>
                  row.lastCheckedAt > latest ? row.lastCheckedAt : latest,
                rows[0].lastCheckedAt,
              )
              .toISOString()
          : null,
      schedule: {
        intervalHours: getFoerderlinkCheckIntervalHours(),
        alertConfigured: Boolean(
          process.env.FOERDERLINK_ALERT_EMAIL?.trim() ||
          process.env.ADMIN_RESET_EMAIL?.trim(),
        ),
      },
      results: rows.map(storedResult),
    });
  } catch (error) {
    req.log.error({ err: error }, "Funding link status failed");
    return res
      .status(500)
      .json({ error: "Der letzte Linkcheck konnte nicht geladen werden." });
  }
});

router.post("/admin/foerder-links/check", requireAdminPin, async (req, res) => {
  let inputs: FundingLinkInput[];
  try {
    inputs = sourceInput(req.body?.links);
  } catch (error) {
    return res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : "Die Quellenliste ist ungültig.",
    });
  }

  try {
    const run = await runFundingLinkCheck(inputs);
    return res.json({ ...run, checkedAt: run.checkedAt.toISOString() });
  } catch (error) {
    req.log.error({ err: error }, "Funding link check failed");
    return res
      .status(500)
      .json({ error: "Der Linkcheck konnte nicht abgeschlossen werden." });
  }
});

export default router;
