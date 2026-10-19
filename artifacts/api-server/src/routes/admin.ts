import { Router } from "express";
import { createHash, randomBytes } from "node:crypto";
import { db, adminAuthTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ADMIN_AUTH_ID,
  getAdminCredential,
  hashAdminPassword,
  verifyAdminCredential,
} from "../middleware/adminAuth.js";
import { sendAdminPasswordResetEmail } from "../lib/resend.js";

const router = Router();
const RESET_VALIDITY_MS = 30 * 60 * 1000;
const genericResetMessage = "Falls eine Admin-Adresse hinterlegt ist, wurde ein Link versendet.";

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * POST /api/admin/verify
 * Checks the supplied PIN against the ADMIN_PIN env var.
 * Does NOT require the adminAuth middleware itself — it IS the auth check.
 */
router.post("/admin/verify", async (req, res) => {
  if (!getAdminCredential()) {
    const [record] = await db.select({ passwordHash: adminAuthTable.passwordHash }).from(adminAuthTable).limit(1);
    if (!record?.passwordHash) {
      return res.status(503).json({ error: "Admin authentication not configured." });
    }
  }
  const { pin: rawProvided } = req.body as { pin?: string };
  const provided = rawProvided?.trim();
  if (!provided || !(await verifyAdminCredential(provided))) {
    return res.status(401).json({ error: "Falsches Passwort." });
  }
  return res.json({ ok: true });
});

router.post("/admin/password-reset/request", async (req, res) => {
  const email = process.env.ADMIN_RESET_EMAIL?.trim();
  if (!email) return res.json({ ok: true, message: genericResetMessage });

  try {
    const token = randomBytes(32).toString("hex");
    const resetExpiresAt = new Date(Date.now() + RESET_VALIDITY_MS);
    await db
      .insert(adminAuthTable)
      .values({ id: ADMIN_AUTH_ID, resetTokenHash: tokenHash(token), resetExpiresAt, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: adminAuthTable.id,
        set: { resetTokenHash: tokenHash(token), resetExpiresAt, updatedAt: new Date() },
      });

    const configuredHost = process.env.REPLIT_DOMAINS?.split(",")[0]?.trim();
    const protocol = configuredHost ? "https" : (req.get("x-forwarded-proto")?.split(",")[0] ?? req.protocol);
    const host = configuredHost ?? req.get("host");
    if (!host) throw new Error("Request host missing");
    const resetUrl = `${protocol}://${host}/admin?reset=${encodeURIComponent(token)}`;
    await sendAdminPasswordResetEmail(email, resetUrl);
  } catch (error) {
    req.log.error({ err: error }, "Admin password reset email failed");
  }

  return res.json({ ok: true, message: genericResetMessage });
});

router.post("/admin/password-reset/confirm", async (req, res) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password || password.length < 10) {
    return res.status(400).json({ error: "Bitte ein Passwort mit mindestens 10 Zeichen wählen." });
  }

  const [record] = await db
    .select()
    .from(adminAuthTable)
    .where(eq(adminAuthTable.id, ADMIN_AUTH_ID))
    .limit(1);

  if (
    !record?.resetTokenHash ||
    !record.resetExpiresAt ||
    record.resetExpiresAt.getTime() < Date.now() ||
    record.resetTokenHash !== tokenHash(token)
  ) {
    return res.status(400).json({ error: "Dieser Link ist ungültig oder abgelaufen." });
  }

  await db
    .update(adminAuthTable)
    .set({
      passwordHash: await hashAdminPassword(password),
      resetTokenHash: null,
      resetExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(adminAuthTable.id, ADMIN_AUTH_ID));

  return res.json({ ok: true });
});

export default router;
