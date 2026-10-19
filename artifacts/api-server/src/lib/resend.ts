async function resendPost(body: object): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error ${response.status}: ${text}`);
  }
}

export type FundingLinkAlert = {
  programTitle: string;
  label: string;
  url: string;
  finalUrl: string | null;
  error: string | null;
  redirectCount: number;
  redirectWarning: boolean;
  changedSinceLastCheck: boolean;
  previousCheckedAt: string | null;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function renderNewsletterParagraph(paragraph: string, domain: string): string {
  const trimmed = paragraph.trim();
  const linkOnly = trimmed.match(/^\[\[ARTIKEL:(\d+)\]\]$/);
  if (linkOnly) {
    return `
      <p style="margin:2px 0 24px;">
        <a href="https://${domain}/artikel/${linkOnly[1]}"
           style="display:inline-block;color:#1e4d35;font-size:14px;font-weight:700;text-decoration:none;border-bottom:2px solid #9bb9aa;padding:0 0 3px;">
          Mehr dazu auf germring.de&nbsp;&rarr;
        </a>
      </p>`;
  }

  const safeText = escapeHtml(trimmed)
    .replace(
      /https?:\/\/[^\s<]+/g,
      (url) => `<a href="${url}" style="color:#1e4d35;text-decoration:underline;">${url}</a>`,
    )
    .replace(
    /\[\[ARTIKEL:(\d+)\]\]/g,
    (_match, articleId: string) =>
      `<a href="https://${domain}/artikel/${articleId}" style="color:#1e4d35;font-weight:700;text-decoration:underline;text-underline-offset:3px;">Mehr dazu auf germring.de&nbsp;&rarr;</a>`,
    );

  if (/^Quelle:/i.test(trimmed)) {
    return `<p style="color:#6b7280;font-size:12px;line-height:1.6;margin:-8px 0 18px;border-left:2px solid #cbd5ce;padding-left:10px;">${safeText}</p>`;
  }

  const letters = trimmed.replace(/[^A-Za-zÄÖÜäöüß]/g, "");
  if (trimmed.length <= 120 && letters.length >= 8 && letters === letters.toUpperCase()) {
    return `<h2 style="color:#183c2d;font-family:Georgia,serif;font-size:19px;line-height:1.35;margin:28px 0 10px;">${safeText}</h2>`;
  }

  return `<p style="color:#374151;line-height:1.7;margin:0 0 18px;">${safeText.replace(/\n/g, "<br/>")}</p>`;
}

export async function sendConfirmationEmail(email: string, token: string): Promise<void> {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0] ?? "germring.de";
  const confirmUrl = `https://${domain}/newsletter/confirm?token=${token}`;

  await resendPost({
    from: "germring.de Newsletter <newsletter@germring.de>",
    to: [email],
    subject: "Bitte bestätige deine Newsletter-Anmeldung",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2a1a;">
        <div style="background: #1e4d35; padding: 32px 40px; border-radius: 8px 8px 0 0;">
          <p style="color: #fff; font-size: 18px; font-weight: 700; margin: 0; letter-spacing: -0.02em;">germring.de</p>
          <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 4px 0 0;">FFB Energie &amp; Zukunft</p>
        </div>
        <div style="background: #fff; padding: 40px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 8px 8px;">
          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 16px; color: #1a2a1a;">Fast geschafft!</h1>
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
            Bitte bestätige deine Anmeldung für den wöchentlichen germring.de-Newsletter —
            jeden Mittwoch: FFB-Energie-Zahlen, Kommunalbeschlüsse, sachlich eingeordnet.
          </p>
          <a href="${confirmUrl}"
             style="display: inline-block; background: #1e4d35; color: #fff; font-weight: 600;
                    padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 15px;">
            Anmeldung bestätigen
          </a>
          <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0; line-height: 1.5;">
            Falls du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.<br/>
            Jederzeit kündbar &middot; Kein Spam &middot; DSGVO-konform
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendAdminPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  await resendPost({
    from: "germring.de <newsletter@germring.de>",
    to: [email],
    subject: "Admin-Passwort zurücksetzen",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a2a1a;">
        <div style="background:#1e4d35;padding:28px 36px;border-radius:8px 8px 0 0;">
          <p style="color:#fff;font-size:18px;font-weight:700;margin:0;">germring.de</p>
          <p style="color:rgba(255,255,255,.7);font-size:12px;margin:4px 0 0;">Redaktions-Zugang</p>
        </div>
        <div style="padding:36px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px;">
          <h1 style="font-size:22px;margin:0 0 16px;">Passwort zurücksetzen</h1>
          <p style="color:#4b5563;line-height:1.6;margin:0 0 24px;">
            Über den folgenden Link kannst du ein neues Admin-Passwort festlegen.
            Der Link ist einmalig und 30 Minuten gültig.
          </p>
          <a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#1e4d35;color:#fff;font-weight:600;padding:13px 24px;border-radius:6px;text-decoration:none;">
            Neues Passwort festlegen
          </a>
          <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:24px 0 0;">
            Falls du diese Anfrage nicht gestellt hast, kannst du die E-Mail ignorieren.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPartnerContactEmail(params: {
  firma: string;
  name: string;
  email: string;
  rubrik: string;
  nachricht: string;
}): Promise<void> {
  const { firma, name, email, rubrik, nachricht } = params;

  await resendPost({
    from: "germring.de <newsletter@germring.de>",
    to: ["partner@germring.de"],
    reply_to: email,
    subject: `Partnerschaftsanfrage von ${firma !== "–" ? firma : name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a2a1a;">
        <div style="background:#1e4d35;padding:24px 32px;border-radius:8px 8px 0 0;">
          <p style="color:#fff;font-size:16px;font-weight:700;margin:0;">germring.de</p>
          <p style="color:rgba(255,255,255,0.65);font-size:11px;margin:2px 0 0;">Neue Partnerschaftsanfrage</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:120px;">Firma</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;">${firma}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">Ansprechpartner</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">E-Mail</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;"><a href="mailto:${email}" style="color:#1e4d35;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Rubrik</td><td style="padding:8px 0;font-size:13px;font-weight:600;">${rubrik}</td></tr>
          </table>
          <p style="font-weight:700;font-size:13px;color:#374151;margin:0 0 8px;">Nachricht:</p>
          <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${nachricht}</p>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;border-top:1px solid #e5e7eb;padding-top:16px;">
            Eingegangen via germring.de/partner &middot; Bitte antworte direkt an ${email}
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendMitmachenFeedbackEmail(params: {
  typ: string;
  message: string;
  email: string;
}): Promise<void> {
  const { typ, message, email } = params;
  await resendPost({
    from: "germring.de <newsletter@germring.de>",
    to: ["redaktion@germring.de"],
    reply_to: email,
    subject: `Meinung zur Seite: ${typ}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a2a1a;">
        <div style="background:#1e4d35;padding:24px 32px;border-radius:8px 8px 0 0;">
          <p style="color:#fff;font-size:16px;font-weight:700;margin:0;">germring.de</p>
          <p style="color:rgba(255,255,255,0.65);font-size:11px;margin:2px 0 0;">Neue Meinung zur Seite</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:100px;">Art</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;">${typ}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">E-Mail</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${email}" style="color:#1e4d35;">${email}</a></td></tr>
          </table>
          <p style="font-weight:700;font-size:13px;color:#374151;margin:0 0 8px;">Nachricht:</p>
          <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;border-top:1px solid #e5e7eb;padding-top:16px;">
            Eingegangen via germring.de/mitmachen &middot; Bitte antworte direkt an ${email}
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendMitmachenIdeeEmail(params: {
  title: string;
  category: string;
  message: string;
  authorName: string | null;
  email: string;
}): Promise<void> {
  const { title, category, message, authorName, email } = params;
  const displayName = authorName || "Anonym";
  await resendPost({
    from: "germring.de <newsletter@germring.de>",
    to: ["redaktion@germring.de"],
    reply_to: email,
    subject: `Neue Idee: ${title}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a2a1a;">
        <div style="background:#1e4d35;padding:24px 32px;border-radius:8px 8px 0 0;">
          <p style="color:#fff;font-size:16px;font-weight:700;margin:0;">germring.de</p>
          <p style="color:rgba(255,255,255,0.65);font-size:11px;margin:2px 0 0;">Neue Projektidee eingegangen</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:100px;">Titel</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;">${title}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">Bereich</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;">${category}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;">${displayName}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">E-Mail</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${email}" style="color:#1e4d35;">${email}</a></td></tr>
          </table>
          <p style="font-weight:700;font-size:13px;color:#374151;margin:0 0 8px;">Idee / Beschreibung:</p>
          <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;border-top:1px solid #e5e7eb;padding-top:16px;">
            Die Idee wartet auf redaktionelle Prüfung und ist bis zur Freigabe nicht öffentlich &middot; Antworte direkt an ${email}
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendNewsletterEmail(
  email: string,
  subject: string,
  textContent: string,
  domain: string,
): Promise<void> {
  const paragraphs = textContent
    .split(/\n\n+/)
    .map(paragraph => renderNewsletterParagraph(paragraph, domain))
    .join("");

  const unsubscribeNote = `
    <p style="color:#9ca3af;font-size:12px;margin:32px 0 0;border-top:1px solid #e5e7eb;padding-top:16px;">
      Du erhältst diesen Newsletter, weil du dich auf germring.de angemeldet hast.<br/>
      Abmelden: <a href="https://${domain}/newsletter" style="color:#6b7280;">germring.de/newsletter</a>
      &nbsp;&middot;&nbsp; DSGVO-konform
    </p>`;

  await resendPost({
    from: "germring.de Newsletter <newsletter@germring.de>",
    to: [email],
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#1a2a1a;">
        <div style="background:#1e4d35;padding:24px 32px;border-radius:8px 8px 0 0;">
          <p style="color:#fff;font-size:16px;font-weight:700;margin:0;">germring.de</p>
          <p style="color:rgba(255,255,255,0.65);font-size:11px;margin:2px 0 0;">FFB Energie &amp; Zukunft</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px;">
          ${paragraphs}
          ${unsubscribeNote}
        </div>
      </div>
    `,
  });
}

export async function sendFundingLinkAlertEmail(
  alerts: FundingLinkAlert[],
  checkedAt: Date,
): Promise<void> {
  const recipient =
    process.env.FOERDERLINK_ALERT_EMAIL?.trim() ||
    process.env.ADMIN_RESET_EMAIL?.trim();
  if (!recipient) {
    throw new Error(
      "FOERDERLINK_ALERT_EMAIL oder ADMIN_RESET_EMAIL ist für Förderlink-Meldungen nicht konfiguriert.",
    );
  }

  const rows = alerts
    .map((alert) => {
      const reasons = [
        alert.error ? `Fehler: ${alert.error}` : null,
        alert.redirectWarning
          ? `Auffällige Weiterleitung (${alert.redirectCount} Schritt${
              alert.redirectCount === 1 ? "" : "e"
            })`
          : null,
        alert.changedSinceLastCheck
          ? `Sichtbarer Inhalt geändert (letzter Check: ${
              alert.previousCheckedAt
                ? new Intl.DateTimeFormat("de-DE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(alert.previousCheckedAt))
                : "unbekannt"
            })`
          : null,
      ]
        .filter((reason): reason is string => Boolean(reason))
        .map((reason) => `<li>${escapeHtml(reason)}</li>`)
        .join("");
      const destination =
        alert.finalUrl && alert.finalUrl !== alert.url
          ? `<br/><span style="color:#6b7280;">Ziel: ${escapeHtml(alert.finalUrl)}</span>`
          : "";

      return `
        <tr>
          <td style="padding:14px 0;border-top:1px solid #e5e7eb;vertical-align:top;">
            <strong style="color:#183c2d;">${escapeHtml(alert.programTitle)}</strong><br/>
            <a href="${escapeHtml(alert.url)}" style="color:#1e4d35;">${escapeHtml(alert.label)}</a>
            ${destination}
            <ul style="margin:8px 0 0;padding-left:18px;color:#7f1d1d;">${reasons}</ul>
          </td>
        </tr>`;
    })
    .join("");

  await resendPost({
    from: "germring.de Redaktion <newsletter@germring.de>",
    to: [recipient],
    subject: `[germring.de] Förderlink-Check: ${alerts.length} Auffälligkeit${
      alerts.length === 1 ? "" : "en"
    }`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#1a2a1a;">
        <div style="background:#1e4d35;padding:24px 32px;border-radius:8px 8px 0 0;">
          <p style="color:#fff;font-size:16px;font-weight:700;margin:0;">germring.de · Redaktion</p>
          <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:4px 0 0;">Automatischer Förderlink-Check</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px;">
          <h1 style="font-size:22px;margin:0 0 10px;color:#183c2d;">Förderquellen bitte prüfen</h1>
          <p style="color:#4b5563;line-height:1.6;margin:0 0 18px;">
            Der automatische Linkcheck vom ${escapeHtml(
              new Intl.DateTimeFormat("de-DE", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(checkedAt),
            )} hat ${alerts.length} auffällige Quelle${
              alerts.length === 1 ? "" : "n"
            } gefunden. Bitte Fehler, Weiterleitungen und geänderte Förderbedingungen im Original redaktionell prüfen.
          </p>
          <table style="width:100%;border-collapse:collapse;">${rows}</table>
          <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:24px 0 0;border-top:1px solid #e5e7eb;padding-top:16px;">
            Die Prüfhistorie bleibt die Vergleichsgrundlage für den nächsten Lauf.
          </p>
        </div>
      </div>
    `,
  });
}
