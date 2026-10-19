import { Router } from "express";
import { db, mitmachenIdeenTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { sendMitmachenFeedbackEmail, sendMitmachenIdeeEmail } from "../lib/resend.js";
import { requireAdminPin } from "../middleware/adminAuth.js";

const router = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/mitmachen/ideen — public list (no email field)
router.get("/mitmachen/ideen", async (req, res) => {
  try {
    const ideen = await db
      .select({
        id: mitmachenIdeenTable.id,
        title: mitmachenIdeenTable.title,
        category: mitmachenIdeenTable.category,
        message: mitmachenIdeenTable.message,
        authorName: mitmachenIdeenTable.authorName,
        createdAt: mitmachenIdeenTable.createdAt,
      })
      .from(mitmachenIdeenTable)
      .where(eq(mitmachenIdeenTable.status, "approved"))
      .orderBy(desc(mitmachenIdeenTable.createdAt));
    return res.json(ideen);
  } catch (err) {
    req.log.error({ err }, "Failed to load ideen");
    return res.status(500).json({ error: "Ideen konnten nicht geladen werden." });
  }
});

// POST /api/mitmachen/feedback — Meinung zur Seite (email only, no DB)
router.post("/mitmachen/feedback", async (req, res) => {
  const { typ, message, email } = req.body as {
    typ?: string;
    message?: string;
    email?: string;
  };

  if (!message?.trim() || !email?.trim() || !typ?.trim()) {
    return res.status(400).json({ error: "Typ, Nachricht und E-Mail sind Pflichtfelder." });
  }
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: "Ungültige E-Mail-Adresse." });
  }

  try {
    await sendMitmachenFeedbackEmail({
      typ: typ.trim(),
      message: message.trim(),
      email: email.trim(),
    });
    return res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Mitmachen feedback email failed");
    return res.status(500).json({ error: "E-Mail konnte nicht gesendet werden. Bitte später erneut versuchen." });
  }
});

// POST /api/mitmachen/idee — Projektidee (DB + email)
router.post("/mitmachen/idee", async (req, res) => {
  const { title, category, message, authorName, email } = req.body as {
    title?: string;
    category?: string;
    message?: string;
    authorName?: string;
    email?: string;
  };

  if (!title?.trim() || !category?.trim() || !message?.trim() || !email?.trim()) {
    return res.status(400).json({ error: "Titel, Bereich, Beschreibung und E-Mail sind Pflichtfelder." });
  }
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: "Ungültige E-Mail-Adresse." });
  }

  const validCategories = ["energie", "kommunal", "praxis", "zahlen", "sonstiges"];
  if (!validCategories.includes(category.trim())) {
    return res.status(400).json({ error: "Ungültiger Bereich." });
  }

  try {
    const [inserted] = await db
      .insert(mitmachenIdeenTable)
      .values({
        title: title.trim(),
        category: category.trim(),
        message: message.trim(),
        authorName: authorName?.trim() || null,
        authorEmail: email.trim(),
      })
      .returning({
        id: mitmachenIdeenTable.id,
        title: mitmachenIdeenTable.title,
        category: mitmachenIdeenTable.category,
        message: mitmachenIdeenTable.message,
        authorName: mitmachenIdeenTable.authorName,
        createdAt: mitmachenIdeenTable.createdAt,
        status: mitmachenIdeenTable.status,
      });

    // Send email notification (non-blocking on failure)
    sendMitmachenIdeeEmail({
      title: title.trim(),
      category: category.trim(),
      message: message.trim(),
      authorName: authorName?.trim() || null,
      email: email.trim(),
    }).catch((err) => console.error("Mitmachen idee email failed:", err));

    return res.status(201).json({ ok: true, status: inserted.status });
  } catch (err) {
    req.log.error({ err }, "Mitmachen idee insert failed");
    return res.status(500).json({ error: "Idee konnte nicht gespeichert werden. Bitte später erneut versuchen." });
  }
});

// GET /api/admin/mitmachen/ideen — review queue, protected
router.get("/admin/mitmachen/ideen", requireAdminPin, async (req, res) => {
  try {
    const ideen = await db
      .select({
        id: mitmachenIdeenTable.id,
        title: mitmachenIdeenTable.title,
        category: mitmachenIdeenTable.category,
        message: mitmachenIdeenTable.message,
        authorName: mitmachenIdeenTable.authorName,
        authorEmail: mitmachenIdeenTable.authorEmail,
        createdAt: mitmachenIdeenTable.createdAt,
        status: mitmachenIdeenTable.status,
        reviewedAt: mitmachenIdeenTable.reviewedAt,
        reviewNote: mitmachenIdeenTable.reviewNote,
      })
      .from(mitmachenIdeenTable)
      .where(eq(mitmachenIdeenTable.status, "pending"))
      .orderBy(desc(mitmachenIdeenTable.createdAt));
    return res.json(ideen);
  } catch (err) {
    req.log.error({ err }, "Failed to load idea review queue");
    return res.status(500).json({ error: "Ideen konnten nicht geladen werden." });
  }
});

// PATCH /api/admin/mitmachen/ideen/:id — approve or reject, protected
router.patch("/admin/mitmachen/ideen/:id", requireAdminPin, async (req, res) => {
  const id = Number(req.params.id);
  const { status, reviewNote } = req.body as { status?: string; reviewNote?: string };

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Ungültige Ideen-ID." });
  }
  if (status !== "approved" && status !== "rejected") {
    return res.status(400).json({ error: "Ungültiger Prüfstatus." });
  }

  try {
    const [updated] = await db
      .update(mitmachenIdeenTable)
      .set({
        status,
        reviewedAt: new Date(),
        reviewNote: reviewNote?.trim() || null,
      })
      .where(and(eq(mitmachenIdeenTable.id, id), eq(mitmachenIdeenTable.status, "pending")))
      .returning({ id: mitmachenIdeenTable.id, status: mitmachenIdeenTable.status });

    if (!updated) {
      return res.status(404).json({ error: "Idee nicht gefunden oder bereits geprüft." });
    }

    return res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to moderate idea");
    return res.status(500).json({ error: "Idee konnte nicht geprüft werden." });
  }
});

export default router;
