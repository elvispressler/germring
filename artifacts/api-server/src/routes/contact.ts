import { Router } from "express";
import { sendPartnerContactEmail } from "../lib/resend.js";

const router = Router();

router.post("/contact", async (req, res) => {
  const { firma, name, email, rubrik, nachricht } = req.body as {
    firma?: string;
    name?: string;
    email?: string;
    rubrik?: string;
    nachricht?: string;
  };

  if (!name?.trim() || !email?.trim() || !nachricht?.trim()) {
    return res.status(400).json({ error: "Name, E-Mail und Nachricht sind Pflichtfelder." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: "Ungültige E-Mail-Adresse." });
  }

  try {
    await sendPartnerContactEmail({
      firma: firma?.trim() || "–",
      name: name.trim(),
      email: email.trim(),
      rubrik: rubrik?.trim() || "–",
      nachricht: nachricht.trim(),
    });
    return res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Partner contact email failed");
    return res.status(500).json({ error: "E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut." });
  }
});

export default router;
