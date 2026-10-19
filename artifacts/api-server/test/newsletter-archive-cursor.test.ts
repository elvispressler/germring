import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  decodeNewsletterArchiveCursor,
  encodeNewsletterArchiveCursor,
} from "../src/lib/newsletter-archive-cursor.ts";

describe("Newsletter-Archiv-Cursor", () => {
  it("kodiert Versanddatum und ID verlustfrei für den nächsten Archivabruf", () => {
    const cursor = {
      sentAt: new Date("2026-09-30T12:34:56.789Z"),
      id: 42,
    };

    const decoded = decodeNewsletterArchiveCursor(encodeNewsletterArchiveCursor(cursor));

    assert.deepEqual(decoded, cursor);
  });

  it("weist ungültige Cursor sicher zurück", () => {
    assert.equal(decodeNewsletterArchiveCursor("not-a-cursor"), null);
    assert.equal(
      decodeNewsletterArchiveCursor(Buffer.from(JSON.stringify({
        sentAt: "2026-09-30",
        id: 0,
      })).toString("base64url")),
      null,
    );
  });
});