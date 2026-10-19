import { after, afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { db, foerderlinkChecksTable, pool } from "@workspace/db";
import {
  checkLink,
  buildContentDiff,
  fingerprint,
  MAX_BODY_BYTES,
  MAX_REDIRECTS,
  REQUEST_TIMEOUT_MS,
  statusKind,
} from "../src/routes/foerderlinks-check.ts";
import {
  getFundingLinkTargets,
  previewFundingLinkReplacement,
  runFundingLinkCheck,
  saveFundingLinkReplacement,
  type FundingLinkInput,
} from "../src/routes/foerderlinks.ts";

const originalFetch = globalThis.fetch;
const integrationSourceId = "test-linkcheck-error-recovery";
const repairSourceId = "test-linkcheck-repair";

afterEach(() => {
  globalThis.fetch = originalFetch;
});

after(async () => {
  await db
    .delete(foerderlinkChecksTable)
    .where(eq(foerderlinkChecksTable.sourceId, integrationSourceId));
  await db
    .delete(foerderlinkChecksTable)
    .where(eq(foerderlinkChecksTable.sourceId, repairSourceId));
  await pool.end();
});

function mockFetch(responses: Response[]) {
  let index = 0;
  globalThis.fetch = (async () => {
    const response = responses[index];
    index += 1;
    if (!response) throw new Error("Unerwarteter zusätzlicher Fetch.");
    return response;
  }) as typeof fetch;
}

function redirect(location?: string) {
  return new Response(null, {
    status: 302,
    headers: location ? { location } : undefined,
  });
}

describe("Förderlink-Prüfung", () => {
  it("repariert nur aktuelle 404-Quellen und verwendet bestätigte Ziele dauerhaft", async () => {
    const brokenUrl = "https://example.test/broken";
    const replacementUrl = "https://example.test/new";
    const input: FundingLinkInput = {
      sourceId: repairSourceId,
      programId: "repair-test",
      programTitle: "Reparaturtest",
      label: "Defekte Testquelle",
      href: brokenUrl,
      url: brokenUrl,
    };

    try {
      await db.insert(foerderlinkChecksTable).values({
        sourceId: repairSourceId,
        programId: input.programId,
        programTitle: input.programTitle,
        label: input.label,
        href: brokenUrl,
        status: 503,
        error: "HTTP 503 (Service Unavailable).",
      });

      globalThis.fetch = (async () => {
        throw new Error("Nicht-404-Quellen dürfen nicht angefragt werden.");
      }) as typeof fetch;
      assert.deepEqual(
        await previewFundingLinkReplacement(repairSourceId, replacementUrl),
        { eligible: false },
      );
      assert.equal(
        await saveFundingLinkReplacement(repairSourceId, replacementUrl),
        "not_404",
      );

      await db
        .update(foerderlinkChecksTable)
        .set({ status: 404, error: "HTTP 404 (Not Found)." })
        .where(eq(foerderlinkChecksTable.sourceId, repairSourceId));

      mockFetch([
        new Response("Service unavailable", {
          status: 503,
          statusText: "Service Unavailable",
        }),
      ]);
      const failedPreview = await previewFundingLinkReplacement(
        repairSourceId,
        replacementUrl,
      );
      assert.equal(failedPreview.eligible, true);
      if (failedPreview.eligible) assert.equal(failedPreview.reachable, false);

      mockFetch([
        new Response("Service unavailable", {
          status: 503,
          statusText: "Service Unavailable",
        }),
      ]);
      assert.equal(
        await saveFundingLinkReplacement(repairSourceId, replacementUrl),
        "unreachable",
      );
      const stillBroken = await db
        .select()
        .from(foerderlinkChecksTable)
        .where(eq(foerderlinkChecksTable.sourceId, repairSourceId));
      assert.equal(stillBroken[0]?.href, brokenUrl);
      assert.equal(stillBroken[0]?.status, 404);

      mockFetch([
        new Response("<html><title>Förderung</title><body>Information</body></html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
      ]);
      const successfulPreview = await previewFundingLinkReplacement(
        repairSourceId,
        replacementUrl,
      );
      assert.equal(successfulPreview.eligible, true);
      if (successfulPreview.eligible) {
        assert.equal(successfulPreview.reachable, true);
        assert.equal(successfulPreview.status, 200);
      }

      mockFetch([
        new Response("<html><title>Förderung</title><body>Information</body></html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
      ]);
      assert.equal(
        await saveFundingLinkReplacement(repairSourceId, replacementUrl),
        "saved",
      );
      const saved = await db
        .select()
        .from(foerderlinkChecksTable)
        .where(eq(foerderlinkChecksTable.sourceId, repairSourceId));
      assert.equal(saved[0]?.href, replacementUrl);
      assert.equal(saved[0]?.status, 200);
      assert.deepEqual(await getFundingLinkTargets([input]), [
        { sourceId: repairSourceId, targetUrl: replacementUrl },
      ]);

      let checkedUrl = "";
      globalThis.fetch = (async (url: RequestInfo | URL) => {
        checkedUrl = String(url);
        return new Response("New destination", {
          status: 200,
          headers: { "content-type": "text/plain" },
        });
      }) as typeof fetch;
      const subsequentRun = await runFundingLinkCheck([input]);
      assert.equal(checkedUrl, replacementUrl);
      assert.equal(subsequentRun.results[0]?.url, replacementUrl);
    } finally {
      await db
        .delete(foerderlinkChecksTable)
        .where(eq(foerderlinkChecksTable.sourceId, repairSourceId));
    }
  });

  it("behält nach einem HTTP-Fehler den letzten Fingerprint für den nächsten Vergleich", async () => {
    const input: FundingLinkInput = {
      sourceId: integrationSourceId,
      programId: "test-program",
      programTitle: "Testprogramm",
      label: "Testquelle",
      href: "https://example.test/foerderung",
      url: "https://example.test/foerderung",
    };

    try {
      mockFetch([
        new Response(
          "<html><body><h1>Förderung</h1><p>50 Prozent Zuschuss.</p></body></html>",
          {
            status: 200,
            headers: { "content-type": "text/html; charset=utf-8" },
          },
        ),
      ]);
      const firstRun = await runFundingLinkCheck([input]);
      const firstResult = firstRun.results[0];
      assert.ok(firstResult);
      assert.equal(firstResult.firstCheck, true);
      assert.equal(firstResult.changedSinceLastCheck, false);

      const firstRow = await db
        .select()
        .from(foerderlinkChecksTable)
        .where(eq(foerderlinkChecksTable.sourceId, integrationSourceId));
      assert.equal(firstRow.length, 1);
      const firstHash = firstRow[0].contentHash;
      assert.ok(firstHash);

      mockFetch([
        new Response("vorübergehend nicht verfügbar", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "content-type": "text/plain" },
        }),
      ]);
      const failedRun = await runFundingLinkCheck([input]);
      const failedResult = failedRun.results[0];
      assert.ok(failedResult);
      assert.equal(failedResult.statusKind, "error");
      assert.equal(failedResult.changedSinceLastCheck, false);
      assert.equal(failedResult.error, "HTTP 503 (Service Unavailable).");

      const failedRow = await db
        .select()
        .from(foerderlinkChecksTable)
        .where(eq(foerderlinkChecksTable.sourceId, integrationSourceId));
      assert.equal(failedRow[0]?.contentHash, firstHash);

      mockFetch([
        new Response(
          "<html><body><h1>Förderung</h1><p>60 Prozent Zuschuss.</p></body></html>",
          {
            status: 200,
            headers: { "content-type": "text/html; charset=utf-8" },
          },
        ),
      ]);
      const recoveredRun = await runFundingLinkCheck([input]);
      const recoveredResult = recoveredRun.results[0];
      assert.ok(recoveredResult);
      assert.equal(recoveredResult.statusKind, "changed");
      assert.equal(recoveredResult.changedSinceLastCheck, true);
      assert.equal(recoveredRun.summary.changed, 1);

      const recoveredRow = await db
        .select()
        .from(foerderlinkChecksTable)
        .where(eq(foerderlinkChecksTable.sourceId, integrationSourceId));
      assert.notEqual(recoveredRow[0]?.contentHash, firstHash);
    } finally {
      await db
        .delete(foerderlinkChecksTable)
        .where(eq(foerderlinkChecksTable.sourceId, integrationSourceId));
    }
  });

  it("meldet eine erfolgreiche HTML-Antwort mit Fingerprint und Seitentitel", async () => {
    mockFetch([
      new Response(
        "<html><head><title>Förderung</title></head><body><h1>Gute Förderung</h1></body></html>",
        {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        },
      ),
    ]);

    const result = await checkLink("https://example.test/foerderung");

    assert.equal(result.status, 200);
    assert.equal(result.error, null);
    assert.equal(result.redirectCount, 0);
    assert.equal(result.pageTitle, "Förderung");
    assert.equal(result.visibleText, "Förderung\nGute Förderung");
    assert.ok(result.contentHash);
    assert.equal(statusKind(result, null), "ok");
  });

  it("behandelt HTTP-Fehler als Fehler ohne Inhalts-Fingerprint", async () => {
    mockFetch([
      new Response("nicht gefunden", {
        status: 404,
        statusText: "Not Found",
        headers: { "content-type": "text/plain" },
      }),
    ]);

    const result = await checkLink("https://example.test/fehlt");

    assert.equal(result.status, 404);
    assert.equal(result.contentHash, null);
    assert.equal(result.error, "HTTP 404 (Not Found).");
    assert.equal(statusKind(result, null), "error");
  });

  it("erkennt fehlende Redirect-Ziele", async () => {
    mockFetch([redirect()]);

    const result = await checkLink("https://example.test/ohne-ziel");

    assert.equal(result.status, 302);
    assert.equal(result.redirectCount, 0);
    assert.equal(result.redirectWarning, true);
    assert.equal(result.error, "Weiterleitung ohne Zieladresse.");
    assert.equal(statusKind(result, null), "error");
  });

  it("folgt Redirects, markiert externe Ziele und begrenzt die Kette", async () => {
    mockFetch([
      redirect("https://other.example/landing"),
      new Response("Ziel", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    ]);

    const redirected = await checkLink("https://example.test/start");

    assert.equal(redirected.status, 200);
    assert.equal(redirected.finalUrl, "https://other.example/landing");
    assert.equal(redirected.redirectCount, 1);
    assert.equal(redirected.redirectWarning, true);
    assert.equal(statusKind(redirected, null), "redirect");

    mockFetch(
      Array.from({ length: MAX_REDIRECTS + 1 }, (_, index) =>
        redirect(`/step-${index + 1}`),
      ),
    );
    const tooMany = await checkLink("https://example.test/start");

    assert.equal(tooMany.redirectCount, MAX_REDIRECTS);
    assert.equal(tooMany.redirectWarning, true);
    assert.equal(
      tooMany.error,
      `Zu viele Weiterleitungen (mehr als ${MAX_REDIRECTS}).`,
    );
    assert.equal(statusKind(tooMany, null), "error");
  });

  it("meldet einen abgebrochenen Fetch verständlich und behält den Redirect-Zähler", async () => {
    let fetchCount = 0;
    globalThis.fetch = (async () => {
      fetchCount += 1;
      if (fetchCount === 1) return redirect("/langsam");

      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      throw abortError;
    }) as typeof fetch;

    const result = await checkLink("https://example.test/start");

    assert.equal(fetchCount, 2);
    assert.equal(result.finalUrl, "https://example.test/langsam");
    assert.equal(result.redirectCount, 1);
    assert.equal(result.redirectWarning, false);
    assert.equal(
      result.error,
      `Zeitüberschreitung nach ${REQUEST_TIMEOUT_MS / 1000} Sekunden.`,
    );
    assert.equal(result.contentHash, null);
    assert.equal(statusKind(result, null), "error");
  });

  it("bricht einen nach den Headern hängenden Antwortkörper mit demselben Timeout ab", async () => {
    let fetchCount = 0;
    let cancelled = false;
    const hangingStream = new ReadableStream<Uint8Array>({
      cancel() {
        cancelled = true;
      },
    });
    const originalSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = ((
      handler: (...args: any[]) => void,
      _delay: number,
      ...args: any[]
    ) =>
      originalSetTimeout(handler, 0, ...args)) as typeof globalThis.setTimeout;

    globalThis.fetch = (async (
      _input: RequestInfo | URL,
      _init?: RequestInit,
    ) => {
      fetchCount += 1;
      if (fetchCount === 1) return redirect("/langsam");
      return new Response(hangingStream, {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
    }) as typeof fetch;

    let result: Awaited<ReturnType<typeof checkLink>>;
    try {
      result = await checkLink("https://example.test/start");
    } finally {
      globalThis.setTimeout = originalSetTimeout;
    }

    assert.equal(fetchCount, 2);
    assert.equal(cancelled, true);
    assert.equal(result.finalUrl, "https://example.test/langsam");
    assert.equal(result.redirectCount, 1);
    assert.equal(result.redirectWarning, false);
    assert.equal(
      result.error,
      `Zeitüberschreitung nach ${REQUEST_TIMEOUT_MS / 1000} Sekunden.`,
    );
    assert.equal(result.contentHash, null);
    assert.equal(statusKind(result, null), "error");
  });

  it("beendet übergroße Streaming-Antworten und hasht nur den erlaubten Anteil", async () => {
    const allowedBody = Buffer.alloc(MAX_BODY_BYTES, "a");
    const trailingBody = Buffer.from(
      "Dieser Teil darf nicht in den Fingerprint.",
    );
    let pullCount = 0;
    let cancelled = false;

    const stream = new ReadableStream<Uint8Array>(
      {
        pull(controller) {
          pullCount += 1;
          if (pullCount === 1) {
            controller.enqueue(allowedBody.subarray(0, MAX_BODY_BYTES - 7));
            return;
          }
          if (pullCount === 2) {
            controller.enqueue(
              Buffer.concat([
                allowedBody.subarray(MAX_BODY_BYTES - 7),
                trailingBody,
              ]),
            );
            return;
          }
          controller.error(
            new Error("Stream wurde nicht rechtzeitig beendet."),
          );
        },
        cancel() {
          cancelled = true;
        },
      },
      { highWaterMark: 0 },
    );

    mockFetch([
      new Response(stream, {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    ]);

    const result = await checkLink("https://example.test/gross");
    const expected = fingerprint(allowedBody, "text/plain");

    assert.equal(cancelled, true);
    assert.equal(pullCount, 2);
    assert.equal(result.contentHash, expected.hash);
    assert.equal(result.pageTitle, null);
    assert.ok((result.contentLength ?? 0) > MAX_BODY_BYTES);
    assert.equal(result.error, null);
  });

  it("ignoriert dynamische Markup-Details, erkennt aber echte Inhaltsänderungen", () => {
    const first = fingerprint(
      Buffer.from(`
        <html><head><title>Förderung</title><style>.a { color: red }</style></head>
        <body><main data-rendered-at="10"><h1>Förderung</h1><p>Bis zu 50 Prozent Zuschuss.</p></main>
        <script>window.renderedAt = 10</script></body></html>
      `),
      "text/html",
    );
    const sameContent = fingerprint(
      Buffer.from(`
        <html><head><title>Förderung</title><style>.a { color: blue }</style></head>
        <body><main data-rendered-at="11"><h1>Förderung</h1><p>Bis zu 50 Prozent Zuschuss.</p></main>
        <script>window.renderedAt = 11</script></body></html>
      `),
      "text/html",
    );
    const changedContent = fingerprint(
      Buffer.from(
        "<html><body><h1>Förderung</h1><p>Bis zu 60 Prozent Zuschuss.</p></body></html>",
      ),
      "text/html",
    );

    assert.equal(sameContent.hash, first.hash);
    assert.equal(
      statusKind(
        {
          contentHash: sameContent.hash,
          error: null,
          redirectWarning: false,
          redirectCount: 0,
        },
        first.hash,
      ),
      "ok",
    );
    assert.notEqual(changedContent.hash, first.hash);
    assert.equal(
      statusKind(
        {
          contentHash: changedContent.hash,
          error: null,
          redirectWarning: false,
          redirectCount: 0,
        },
        first.hash,
      ),
      "changed",
    );
  });

  it("liefert den sichtbaren Vorher-/Nachher-Text und markiert redaktionelle Schwerpunkte", () => {
    const diff = buildContentDiff(
      "Zuschuss bis zu 50 Prozent. Antrag bis zum 30. Juni stellen.",
      "Zuschuss bis zu 60 Prozent. Antrag bis zum 31. Juli stellen.",
      new Date("2026-09-01T10:00:00.000Z"),
    );

    assert.equal(diff.available, true);
    assert.equal(diff.changed, true);
    assert.equal(diff.previousCheckedAt, "2026-09-01T10:00:00.000Z");
    assert.deepEqual(diff.focus, ["amount", "deadline", "condition"]);
    assert.match(diff.before ?? "", /50 Prozent/);
    assert.match(diff.after ?? "", /60 Prozent/);
  });

  it("zeigt bei langen Seiten nur den geänderten Ausschnitt mit Kontext", () => {
    const diff = buildContentDiff(
      "Zeile 1\nZeile 2\nZeile 3\nZeile 4\nZeile 5\nAlter Förderbetrag: 50 Prozent\nZeile 7\nZeile 8\nZeile 9\nZeile 10",
      "Zeile 1\nZeile 2\nZeile 3\nZeile 4\nZeile 5\nNeuer Förderbetrag: 60 Prozent\nZeile 7\nZeile 8\nZeile 9\nZeile 10",
      "2026-09-01T10:00:00.000Z",
    );

    assert.equal(diff.changed, true);
    assert.match(diff.before ?? "", /vorherige unveränderte Zeilen/);
    assert.match(diff.before ?? "", /Alter Förderbetrag: 50 Prozent/);
    assert.match(diff.before ?? "", /nachfolgende unveränderte Zeilen/);
    assert.match(diff.after ?? "", /Neuer Förderbetrag: 60 Prozent/);
  });
});
