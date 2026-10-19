import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { db, adminAuthTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const scrypt = promisify(scryptCallback);
const ADMIN_AUTH_ID = "primary";

export function getAdminCredential(): string | undefined {
  return (process.env.GERMRING_ADMIN_PASSWORD ?? process.env.ADMIN_PIN)?.trim() || undefined;
}

export async function hashAdminPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID();
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function matchesHash(password: string, storedHash: string): Promise<boolean> {
  const [salt, expectedHex] = storedHash.split(":");
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = await scrypt(password, salt, expected.length) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function verifyAdminCredential(provided: string): Promise<boolean> {
  const [record] = await db
    .select({ passwordHash: adminAuthTable.passwordHash })
    .from(adminAuthTable)
    .where(eq(adminAuthTable.id, ADMIN_AUTH_ID))
    .limit(1);

  if (record?.passwordHash) return matchesHash(provided, record.passwordHash);
  return provided === getAdminCredential();
}

export async function requireAdminPin(req: Request, res: Response, next: NextFunction) {
  try {
    const providedHeader = req.headers["x-admin-pin"];
    const provided = Array.isArray(providedHeader) ? providedHeader[0]?.trim() : providedHeader?.trim();
    if (!provided || !(await verifyAdminCredential(provided))) {
      return res.status(401).json({ error: "Nicht autorisiert." });
    }
    return next();
  } catch (error) {
    req.log.error({ err: error }, "Admin authentication failed");
    return res.status(500).json({ error: "Admin-Anmeldung konnte nicht geprüft werden." });
  }
}

export { ADMIN_AUTH_ID };
