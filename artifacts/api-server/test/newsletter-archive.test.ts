import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import { after, describe, it } from "node:test";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import {
  db,
  newsletterIssuesTable,
  newsletterSubscribersTable,
  pool,
} from "@workspace/db";
import newsletterRouter from "../src/routes/newsletter.ts";

const privateRecipient = "newsletter-archive-private-test@example.test";
const subjectPrefix = "newsletter-archive-private-test";

after(async () => {
  await db
    .delete(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.email, privateRecipient));
  await pool.end();
});

async function startArchiveServer() {
  const app = express();
  app.use("/api", newsletterRouter);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");

  return {
    server,
    url: `http://127.0.0.1:${address.port}/api/newsletter/archive`,
  };
}

async function closeArchiveServer(server: Awaited<ReturnType<typeof startArchiveServer>>["server"]) {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
}

describe("Newsletter-Archiv-API", () => {
  it("liefert nur öffentliche Daten versendeter Ausgaben mit Versanddatum", async () => {
    const insertedIssues = await db
      .insert(newsletterIssuesTable)
      .values([
        {
          subject: `${subjectPrefix}-published`,
          content: "Öffentlicher Newsletter-Inhalt.",
          status: "sent",
          sentCount: 137,
          failedCount: 9,
          sentAt: new Date("2099-09-29T12:00:00.000Z"),
        },
        {
          subject: `${subjectPrefix}-still-sending`,
          content: "Darf nicht im Archiv erscheinen.",
          status: "sending",
          sentCount: 0,
          failedCount: 0,
          sentAt: new Date("2026-09-29T13:00:00.000Z"),
        },
        {
          subject: `${subjectPrefix}-missing-date`,
          content: "Darf ohne Versanddatum nicht erscheinen.",
          status: "sent",
          sentCount: 42,
          failedCount: 3,
          sentAt: null,
        },
      ])
      .returning({ id: newsletterIssuesTable.id });
    const issueIds = insertedIssues.map(issue => issue.id);

    await db.insert(newsletterSubscribersTable).values({
      email: privateRecipient,
      confirmed: true,
    });

    const { server, url } = await startArchiveServer();

    try {
      const response = await fetch(url);
      assert.equal(response.status, 200);
      const body = await response.json() as {
        issues: Array<Record<string, unknown>>;
        nextCursor: string | null;
      };

      const published = body.issues.filter(issue =>
        String(issue.subject).startsWith(subjectPrefix),
      );
      assert.equal(published.length, 1);
      assert.deepEqual(
        Object.keys(published[0]!).sort(),
        ["content", "id", "sentAt", "subject"],
      );
      assert.deepEqual(published[0], {
        id: issueIds[0],
        subject: `${subjectPrefix}-published`,
        content: "Öffentlicher Newsletter-Inhalt.",
        sentAt: "2099-09-29T12:00:00.000Z",
      });
      assert.equal(body.nextCursor, null);
      assert.ok(
        body.issues.some(issue => issue.subject === "KW 38: Solar, Speicher & Mobilitätswende"),
        "Historische Newsletter sollen im Archiv erscheinen",
      );
      assert.equal(JSON.stringify(body).includes(privateRecipient), false);
      assert.equal(JSON.stringify(body).includes("sentCount"), false);
      assert.equal(JSON.stringify(body).includes("failedCount"), false);

      const invalidCursorResponse = await fetch(`${url}?cursor=not-a-cursor`);
      assert.equal(invalidCursorResponse.status, 400);
      assert.deepEqual(await invalidCursorResponse.json(), {
        error: "Ungültiger Archiv-Cursor.",
      });
    } finally {
      await closeArchiveServer(server);
      if (issueIds.length > 0) {
        await db
          .delete(newsletterIssuesTable)
          .where(inArray(newsletterIssuesTable.id, issueIds));
      }
      await db
        .delete(newsletterSubscribersTable)
        .where(eq(newsletterSubscribersTable.email, privateRecipient));
    }
  });

  it("liefert alle Ausgaben über Folgeseiten hinweg genau einmal und sortiert gleiche Versandzeiten nach ID", async () => {
    const subjectPrefix = `newsletter-archive-pagination-test-${randomUUID()}`;
    const sharedSentAt = new Date("2099-01-10T12:00:00.000Z");
    const issueSpecs = [
      ...Array.from({ length: 6 }, (_, index) => ({
        label: `newer-${index}`,
        sentAt: new Date(Date.UTC(2099, 0, 20 - index)),
      })),
      ...Array.from({ length: 10 }, (_, index) => ({
        label: `same-time-${index}`,
        sentAt: sharedSentAt,
      })),
      ...Array.from({ length: 4 }, (_, index) => ({
        label: `older-${index}`,
        sentAt: new Date(Date.UTC(2099, 0, 9 - index)),
      })),
    ];
    let issueIds: number[] = [];

    try {
      const insertedIssues = await db
        .insert(newsletterIssuesTable)
        .values(issueSpecs.map(issue => ({
          subject: `${subjectPrefix}-${issue.label}`,
          content: `Inhalt ${issue.label}`,
          status: "sent" as const,
          sentCount: 1,
          failedCount: 0,
          sentAt: issue.sentAt,
        })))
        .returning({
          id: newsletterIssuesTable.id,
          subject: newsletterIssuesTable.subject,
          sentAt: newsletterIssuesTable.sentAt,
        });
      issueIds = insertedIssues.map(issue => issue.id);

      assert.equal(insertedIssues.length, issueSpecs.length);
      const expectedIssues = insertedIssues
        .map(issue => ({
          id: issue.id,
          subject: issue.subject,
          sentAt: issue.sentAt!.toISOString(),
        }))
        .sort((a, b) =>
          b.sentAt.localeCompare(a.sentAt) || b.id - a.id,
        );

      const { server, url } = await startArchiveServer();
      try {
        const receivedIssues: Array<{
          id: number;
          subject: string;
          sentAt: string;
        }> = [];
        let cursor: string | null = null;
        let pageCount = 0;

        do {
          assert.ok(pageCount < 4, "Archiv-Cursor hat zu viele Seiten geliefert");
          const response = await fetch(
            cursor ? `${url}?cursor=${encodeURIComponent(cursor)}` : url,
          );
          assert.equal(response.status, 200);
          const body = await response.json() as {
            issues: Array<{ id: number; subject: string; sentAt: string }>;
            nextCursor: string | null;
          };
          receivedIssues.push(
            ...body.issues
              .filter(issue => issue.subject.startsWith(subjectPrefix))
              .map(({ id, subject, sentAt }) => ({ id, subject, sentAt })),
          );
          cursor = body.nextCursor;
          pageCount += 1;
        } while (
          cursor !== null
          && receivedIssues.length < expectedIssues.length
        );

        const receivedTestIssues = receivedIssues;
        assert.ok(pageCount > 1, "Testausgaben müssen mehrere Archivseiten belegen");
        assert.equal(receivedTestIssues.length, expectedIssues.length);
        assert.equal(
          new Set(receivedTestIssues.map(issue => issue.id)).size,
          expectedIssues.length,
          "Eine Ausgabe darf nicht auf mehreren Seiten erscheinen",
        );
        assert.deepEqual(
          receivedTestIssues,
          expectedIssues,
        );
        assert.deepEqual(
          receivedTestIssues
            .filter(issue => issue.sentAt === sharedSentAt.toISOString())
            .map(issue => issue.id),
          expectedIssues
            .filter(issue => issue.sentAt === sharedSentAt.toISOString())
            .map(issue => issue.id),
        );
      } finally {
        await closeArchiveServer(server);
      }
    } finally {
      if (issueIds.length > 0) {
        await db
          .delete(newsletterIssuesTable)
          .where(inArray(newsletterIssuesTable.id, issueIds));
      }
    }
  });
});