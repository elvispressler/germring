import { Router, type Request, type Response } from "express";
import {
  db,
  newsletterIssuesTable,
  newsletterSignupLimitsTable,
  newsletterSubscribersTable,
  type NewsletterSignupLocation,
} from "@workspace/db";
import { and, desc, eq, isNotNull, lt, notInArray, or, sql } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { sendConfirmationEmail } from "../lib/resend.ts";
import {
  buildNewsletterArchivePage,
} from "../lib/newsletter-archive-page.ts";
import { HISTORICAL_NEWSLETTER_SUBJECTS } from "../data/historical-newsletter-issues.ts";
import {
  decodeNewsletterArchiveCursor,
  encodeNewsletterArchiveCursor,
} from "../lib/newsletter-archive-cursor.ts";

const NEWSLETTER_ARCHIVE_PAGE_SIZE = 8;
const NEWSLETTER_SUBSCRIBE_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
};
const NEWSLETTER_PUBLIC_RESPONSE = {
  message: "Wenn eine Anmeldung möglich ist, erhalten Sie in Kürze eine E-Mail mit weiteren Informationen.",
};
const router = Router();

router.get("/newsletter/archive", async (req, res) => {
  const rawCursor = req.query.cursor;
  if (rawCursor !== undefined && typeof rawCursor !== "string") {
    res.status(400).json({ error: "Ungültiger Archiv-Cursor." });
    return;
  }

  const cursor = rawCursor === undefined ? null : decodeNewsletterArchiveCursor(rawCursor);
  if (rawCursor !== undefined && !cursor) {
    res.status(400).json({ error: "Ungültiger Archiv-Cursor." });
    return;
  }

  try {
    const filters = [
      eq(newsletterIssuesTable.status, "sent"),
      isNotNull(newsletterIssuesTable.sentAt),
      notInArray(newsletterIssuesTable.subject, HISTORICAL_NEWSLETTER_SUBJECTS),
    ];
    if (cursor) {
      filters.push(
        or(
          lt(newsletterIssuesTable.sentAt, cursor.sentAt),
          and(
            eq(newsletterIssuesTable.sentAt, cursor.sentAt),
            lt(newsletterIssuesTable.id, cursor.id),
          ),
        )!,
      );
    }

    const rows = await db
      .select({
        id: newsletterIssuesTable.id,
        subject: newsletterIssuesTable.subject,
        content: newsletterIssuesTable.content,
        sentAt: newsletterIssuesTable.sentAt,
      })
      .from(newsletterIssuesTable)
      .where(and(...filters))
      .orderBy(desc(newsletterIssuesTable.sentAt), desc(newsletterIssuesTable.id))
      .limit(NEWSLETTER_ARCHIVE_PAGE_SIZE + 1);

    const page = buildNewsletterArchivePage(
      rows,
      cursor,
      NEWSLETTER_ARCHIVE_PAGE_SIZE,
    );
    const lastIssue = page.issues.at(-1);

    res.json({
      issues: page.issues.map(issue => ({
        ...issue,
        sentAt: issue.sentAt.toISOString(),
      })),
      nextCursor: page.hasMore && lastIssue
        ? encodeNewsletterArchiveCursor({ sentAt: lastIssue.sentAt, id: lastIssue.id })
        : null,
    });
  } catch (err) {
    req.log.error({ err }, "Newsletter archive request failed");
    res.status(500).json({ error: "Das Newsletter-Archiv konnte nicht geladen werden." });
  }
});

export function createNewsletterSubscribeRouter({
  sendConfirmationEmail: sendEmail = sendConfirmationEmail,
  rateLimit = NEWSLETTER_SUBSCRIBE_RATE_LIMIT,
}: {
  sendConfirmationEmail?: typeof sendConfirmationEmail;
  rateLimit?: { maxRequests: number; windowMs: number };
} = {}) {
  const subscribeRouter = Router();
  let requestsSinceCleanup = 0;

  async function allowRequest(req: Request, res: Response): Promise<boolean> {
    const now = new Date();
    const resetAt = new Date(now.getTime() + rateLimit.windowMs);
    const clientAddress = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const clientKey = createHash("sha256").update(clientAddress).digest("hex");
    const [clientLimit] = await db
      .insert(newsletterSignupLimitsTable)
      .values({ clientKey, count: 1, resetAt })
      .onConflictDoUpdate({
        target: newsletterSignupLimitsTable.clientKey,
        set: {
          count: sql`CASE
            WHEN ${newsletterSignupLimitsTable.resetAt} <= ${now} THEN 1
            WHEN ${newsletterSignupLimitsTable.count} <= ${rateLimit.maxRequests}
              THEN ${newsletterSignupLimitsTable.count} + 1
            ELSE ${newsletterSignupLimitsTable.count}
          END`,
          resetAt: sql`CASE
            WHEN ${newsletterSignupLimitsTable.resetAt} <= ${now} THEN ${resetAt}
            ELSE ${newsletterSignupLimitsTable.resetAt}
          END`,
        },
      })
      .returning({
        count: newsletterSignupLimitsTable.count,
        resetAt: newsletterSignupLimitsTable.resetAt,
      });

    requestsSinceCleanup += 1;
    if (requestsSinceCleanup >= 256) {
      requestsSinceCleanup = 0;
      void db
        .delete(newsletterSignupLimitsTable)
        .where(lt(newsletterSignupLimitsTable.resetAt, now))
        .catch(err => req.log.warn({ err }, "Newsletter rate-limit cleanup failed"));
    }

    if (!clientLimit) {
      throw new Error("Newsletter rate-limit upsert returned no row");
    }

    if (clientLimit.count > rateLimit.maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((clientLimit.resetAt.getTime() - now.getTime()) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        error: "Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.",
      });
      return false;
    }

    clientLimit.count += 1;
    return true;
  }

  function sendConfirmationInBackground(
    req: Request,
    email: string,
    token: string,
  ): void {
    sendEmail(email, token).catch((err) => {
      req.log.error({ err }, "Confirmation email failed (non-fatal)");
    });
  }

  subscribeRouter.post("/newsletter/subscribe", async (req, res): Promise<void> => {
    const body = req.body as { email?: unknown; location?: unknown } | undefined;
    const email = body?.email;
    const location = body?.location;

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Ungültige E-Mail-Adresse." });
      return;
    }

    if (
      location !== undefined
      && location !== "home"
      && location !== "newsletter"
    ) {
      res.status(400).json({ error: "Ungültiger Anmeldeursprung." });
      return;
    }

    try {
      if (!await allowRequest(req, res)) return;

      const normalizedEmail = email.toLowerCase();
      const token = randomBytes(32).toString("hex");
      const signupLocation = location as NewsletterSignupLocation | undefined;

      const inserted = await db
        .insert(newsletterSubscribersTable)
        .values({
          email: normalizedEmail,
          confirmed: false,
          confirmToken: token,
          signupLocation: signupLocation ?? null,
        })
        .onConflictDoNothing({ target: newsletterSubscribersTable.email })
        .returning({ email: newsletterSubscribersTable.email });

      if (inserted.length > 0) {
        sendConfirmationInBackground(req, normalizedEmail, token);
      }

      res.status(202).json(NEWSLETTER_PUBLIC_RESPONSE);
    } catch (err) {
      req.log.error({ err }, "Newsletter subscribe failed");
      res.status(500).json({ error: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut." });
    }
  });

  subscribeRouter.post("/newsletter/resend-confirmation", async (req, res): Promise<void> => {
    const email = (req.body as { email?: unknown } | undefined)?.email;

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Ungültige E-Mail-Adresse." });
      return;
    }

    try {
      if (!await allowRequest(req, res)) return;

      const normalizedEmail = email.toLowerCase();
      const token = randomBytes(32).toString("hex");
      const updated = await db
        .update(newsletterSubscribersTable)
        .set({ confirmToken: token })
        .where(and(
          eq(newsletterSubscribersTable.email, normalizedEmail),
          eq(newsletterSubscribersTable.confirmed, false),
        ))
        .returning({ email: newsletterSubscribersTable.email });

      if (updated.length > 0) {
        sendConfirmationInBackground(req, normalizedEmail, token);
      }

      res.status(202).json(NEWSLETTER_PUBLIC_RESPONSE);
    } catch (err) {
      req.log.error({ err }, "Newsletter confirmation resend failed");
      res.status(500).json({ error: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut." });
    }
  });

  return subscribeRouter;
}

router.use(createNewsletterSubscribeRouter());

router.get("/newsletter/confirm", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : null;

  if (!token) {
    return res.status(400).json({ error: "Ungültiger Bestätigungslink." });
  }

  try {
    const [subscriber] = await db
      .update(newsletterSubscribersTable)
      .set({ confirmed: true, confirmToken: null })
      .where(eq(newsletterSubscribersTable.confirmToken, token))
      .returning({ signupLocation: newsletterSubscribersTable.signupLocation });

    if (!subscriber) {
      return res.status(404).json({ error: "Bestätigungslink nicht gefunden." });
    }

    return res.json({ location: subscriber.signupLocation ?? "unknown" });
  } catch (err) {
    req.log.error({ err }, "Newsletter confirm failed");
    return res.status(500).json({ error: "Bestätigung fehlgeschlagen." });
  }
});

export default router;
