import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildNewsletterArchivePage,
  type NewsletterArchiveIssue,
} from "../src/lib/newsletter-archive-page.ts";
import { HISTORICAL_NEWSLETTER_ISSUES } from "../src/data/historical-newsletter-issues.ts";

describe("Newsletter-Archivseiten mit historischen Ausgaben", () => {
  it("führt die historischen und versendeten Ausgaben chronologisch zusammen", () => {
    const page = buildNewsletterArchivePage([
      {
        id: 12,
        subject: "KW 39: Neue Ausgabe",
        content: "Aktuelle Ausgabe",
        sentAt: new Date("2026-09-26T10:00:00.000Z"),
      },
      {
        id: 13,
        subject: " KW 38: Solar, Speicher & Mobilitätswende ",
        content: "Doppelter historischer Eintrag",
        sentAt: new Date("2026-09-20T10:00:00.000Z"),
      },
    ], null, 8);

    assert.equal(page.issues.length, 8);
    assert.equal(page.issues[0]?.subject, "KW 39: Neue Ausgabe");
    assert.equal(page.issues[1]?.subject, "KW 38: Solar, Speicher & Mobilitätswende");
    assert.equal(page.issues[1]?.id, HISTORICAL_NEWSLETTER_ISSUES[6]?.id);
    assert.equal(page.issues.at(-1)?.subject, "KW 26: Wärmewende im Landkreis FFB");
    assert.equal(page.hasMore, false);
  });

  it("setzt den Cursor über die Grenze zwischen Datenbank- und historischen Ausgaben hinweg korrekt fort", () => {
    const databaseIssues: NewsletterArchiveIssue[] = [
      {
        id: 12,
        subject: "Neueste Ausgabe",
        content: "Inhalt",
        sentAt: new Date("2026-10-01T10:00:00.000Z"),
      },
    ];
    const first = buildNewsletterArchivePage(databaseIssues, null, 3);
    const lastIssue = first.issues.at(-1);
    assert.ok(first.hasMore);
    assert.ok(lastIssue);

    const second = buildNewsletterArchivePage(databaseIssues, {
      sentAt: lastIssue.sentAt,
      id: lastIssue.id,
    }, 3);

    assert.deepEqual(
      second.issues.map(issue => issue.subject),
      [
        "KW 36: Windkraft und Heizung im Fokus",
        "KW 35: Hitze, Solar und Kühlkonzepte im FFB",
        "KW 33: Wärme, Solar und Strom im FFB",
      ],
    );
    assert.ok(second.hasMore);
  });
});
