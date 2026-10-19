import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import { after, describe, it } from "node:test";
import { createHash, randomUUID } from "node:crypto";
import type { Server } from "node:http";
import pino from "pino";
import pinoHttp from "pino-http";
import { eq, inArray } from "drizzle-orm";
import {
  db,
  newsletterSignupLimitsTable,
  newsletterSubscribersTable,
  pool,
} from "@workspace/db";
import newsletterRouter, {
  createNewsletterSubscribeRouter,
} from "../src/routes/newsletter.ts";

const testLogger = pino({ level: "silent" });

function createTestApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(pinoHttp({ logger: testLogger }));
  app.use(express.json());
  return app;
}

function createTestClientIp(): string {
  const hex = randomUUID().replaceAll("-", "");
  return `10.${Number.parseInt(hex.slice(0, 2), 16)}.${Number.parseInt(hex.slice(2, 4), 16)}.${Number.parseInt(hex.slice(4, 6), 16)}`;
}

function rateLimitKeyForIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

async function deleteRateLimitsForIps(ips: string[]): Promise<void> {
  await db
    .delete(newsletterSignupLimitsTable)
    .where(inArray(newsletterSignupLimitsTable.clientKey, ips.map(rateLimitKeyForIp)));
}

after(async () => {
  await pool.end();
});

describe("Newsletter-Anmelde-API", () => {
  it("gibt für neue und bereits angemeldete Adressen dieselbe Antwort aus und versendet nur einmal", async () => {
    const suffix = randomUUID();
    const newEmail = `newsletter-subscribe-new-${suffix}@example.test`;
    const existingEmail = `newsletter-subscribe-existing-${suffix}@example.test`;
    const clientIp = createTestClientIp();
    const sentConfirmations: Array<{ email: string; token: string }> = [];

    await db.insert(newsletterSubscribersTable).values({
      email: existingEmail,
      confirmed: true,
    });

    const app = createTestApp();
    app.use("/api", createNewsletterSubscribeRouter({
      sendConfirmationEmail: async (email, token) => {
        sentConfirmations.push({ email, token });
      },
    }));

    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const url = `http://127.0.0.1:${address.port}/api/newsletter/subscribe`;

    const subscribe = async (email: string, location: "home" | "newsletter" = "home") => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": clientIp,
        },
        body: JSON.stringify({ email, location }),
      });
      return {
        status: response.status,
        body: await response.json(),
      };
    };

    try {
      const newAddressResponse = await subscribe(newEmail);
      const repeatedFromAnotherLocationResponse = await subscribe(
        newEmail,
        "newsletter",
      );
      const existingAddressResponse = await subscribe(existingEmail);
      const existingAddressCaseVariantResponse = await subscribe(
        existingEmail.toUpperCase(),
      );

      assert.equal(newAddressResponse.status, 202);
      assert.deepEqual(repeatedFromAnotherLocationResponse, newAddressResponse);
      assert.deepEqual(existingAddressResponse, newAddressResponse);
      assert.deepEqual(existingAddressCaseVariantResponse, newAddressResponse);
      assert.deepEqual(newAddressResponse.body, {
        message: "Wenn eine Anmeldung möglich ist, erhalten Sie in Kürze eine E-Mail mit weiteren Informationen.",
      });
      assert.equal(sentConfirmations.length, 1);
      assert.equal(sentConfirmations[0]?.email, newEmail);
      assert.ok(sentConfirmations[0]?.token);
      const [newSubscriber] = await db
        .select({ signupLocation: newsletterSubscribersTable.signupLocation })
        .from(newsletterSubscribersTable)
        .where(eq(newsletterSubscribersTable.email, newEmail))
        .limit(1);
      assert.equal(newSubscriber?.signupLocation, "home");
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
      await db
        .delete(newsletterSubscribersTable)
        .where(inArray(newsletterSubscribersTable.email, [newEmail, existingEmail]));
      await deleteRateLimitsForIps([clientIp]);
    }
  });

  it("weist frei eingegebene Anmeldeursprünge zurück", async () => {
    const email = `newsletter-invalid-location-${randomUUID()}@example.test`;
    const clientIp = createTestClientIp();
    const sentConfirmations: Array<{ email: string; token: string }> = [];
    const app = createTestApp();
    app.use("/api", createNewsletterSubscribeRouter({
      sendConfirmationEmail: async (sentEmail, token) => {
        sentConfirmations.push({ email: sentEmail, token });
      },
    }));

    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const url = `http://127.0.0.1:${address.port}/api/newsletter/subscribe`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": clientIp,
        },
        body: JSON.stringify({ email, location: "custom-page?user=private" }),
      });

      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), {
        error: "Ungültiger Anmeldeursprung.",
      });
      assert.deepEqual(sentConfirmations, []);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
      await db
        .delete(newsletterSubscribersTable)
        .where(eq(newsletterSubscribersTable.email, email));
      await deleteRateLimitsForIps([clientIp]);
    }
  });

  it("sendet nur für ausstehende Anmeldungen erneut und verrät den Adressstatus nicht", async () => {
    const suffix = randomUUID();
    const pendingEmail = `newsletter-resend-pending-${suffix}@example.test`;
    const confirmedEmail = `newsletter-resend-confirmed-${suffix}@example.test`;
    const unknownEmail = `newsletter-resend-unknown-${suffix}@example.test`;
    const clientIp = createTestClientIp();
    const oldToken = randomUUID();
    const sentConfirmations: Array<{ email: string; token: string }> = [];

    await db.insert(newsletterSubscribersTable).values([
      {
        email: pendingEmail,
        confirmed: false,
        confirmToken: oldToken,
        signupLocation: "newsletter",
      },
      { email: confirmedEmail, confirmed: true },
    ]);

    const app = createTestApp();
    app.use("/api", createNewsletterSubscribeRouter({
      sendConfirmationEmail: async (email, token) => {
        sentConfirmations.push({ email, token });
      },
    }));

    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const url = `http://127.0.0.1:${address.port}/api/newsletter/resend-confirmation`;

    const resend = async (email: string) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": clientIp,
        },
        body: JSON.stringify({ email }),
      });
      return { status: response.status, body: await response.json() };
    };

    try {
      const pendingResponse = await resend(pendingEmail.toUpperCase());
      const confirmedResponse = await resend(confirmedEmail);
      const unknownResponse = await resend(unknownEmail);

      assert.equal(pendingResponse.status, 202);
      assert.deepEqual(confirmedResponse, pendingResponse);
      assert.deepEqual(unknownResponse, pendingResponse);
      assert.deepEqual(pendingResponse.body, {
        message: "Wenn eine Anmeldung möglich ist, erhalten Sie in Kürze eine E-Mail mit weiteren Informationen.",
      });
      assert.equal(sentConfirmations.length, 1);
      assert.equal(sentConfirmations[0]?.email, pendingEmail);
      assert.ok(sentConfirmations[0]?.token);
      assert.notEqual(sentConfirmations[0]?.token, oldToken);

      const [pendingSubscriber] = await db
        .select({
          confirmToken: newsletterSubscribersTable.confirmToken,
          signupLocation: newsletterSubscribersTable.signupLocation,
        })
        .from(newsletterSubscribersTable)
        .where(eq(newsletterSubscribersTable.email, pendingEmail))
        .limit(1);
      assert.equal(pendingSubscriber?.confirmToken, sentConfirmations[0]?.token);
      assert.equal(pendingSubscriber?.signupLocation, "newsletter");
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
      await db
        .delete(newsletterSubscribersTable)
        .where(inArray(newsletterSubscribersTable.email, [
          pendingEmail,
          confirmedEmail,
          unknownEmail,
        ]));
      await deleteRateLimitsForIps([clientIp]);
    }
  });

  it("begrenzt Anmeldungen und Wiederholungsanfragen gemeinsam je Client-IP", async () => {
    const suffix = randomUUID();
    const emails = [
      `newsletter-limit-one-${suffix}@example.test`,
      `newsletter-limit-two-${suffix}@example.test`,
      `newsletter-limit-blocked-${suffix}@example.test`,
      `newsletter-limit-other-client-${suffix}@example.test`,
      `newsletter-limit-after-window-${suffix}@example.test`,
    ];
    const primaryClientIp = createTestClientIp();
    const otherClientIp = createTestClientIp();
    const sentConfirmations: string[] = [];

    const app = createTestApp();
    app.use("/api", createNewsletterSubscribeRouter({
      rateLimit: { maxRequests: 2, windowMs: 1_000 },
      sendConfirmationEmail: async email => {
        sentConfirmations.push(email);
      },
    }));

    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const baseUrl = `http://127.0.0.1:${address.port}/api/newsletter`;

    const request = async (path: "subscribe" | "resend-confirmation", email: string, clientIp: string) => {
      return fetch(`${baseUrl}/${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": clientIp,
        },
        body: JSON.stringify({ email }),
      });
    };

    try {
      assert.equal((await request("subscribe", emails[0]!, primaryClientIp)).status, 202);
      assert.equal((await request("resend-confirmation", emails[1]!, primaryClientIp)).status, 202);

      const blockedResponse = await request("subscribe", emails[2]!, primaryClientIp);
      assert.equal(blockedResponse.status, 429);
      const retryAfterSeconds = Number(blockedResponse.headers.get("retry-after"));
      assert.ok(retryAfterSeconds > 0 && retryAfterSeconds <= 1);
      assert.deepEqual(await blockedResponse.json(), {
        error: "Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.",
      });

      assert.equal((await request("subscribe", emails[3]!, otherClientIp)).status, 202);
      await new Promise(resolve => setTimeout(resolve, 1_050));
      assert.equal((await request("subscribe", emails[4]!, primaryClientIp)).status, 202);
      assert.deepEqual(sentConfirmations, [
        emails[0],
        emails[3],
        emails[4],
      ]);

      const blockedSubscriber = await db
        .select({ email: newsletterSubscribersTable.email })
        .from(newsletterSubscribersTable)
        .where(eq(newsletterSubscribersTable.email, emails[2]!))
        .limit(1);
      assert.equal(blockedSubscriber.length, 0);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
      await db
        .delete(newsletterSubscribersTable)
        .where(inArray(newsletterSubscribersTable.email, emails));
      await deleteRateLimitsForIps([primaryClientIp, otherClientIp]);
    }
  });

  it("teilt das Limit zwischen API-Instanzen und behält es nach einem Neustart bei", async () => {
    const suffix = randomUUID();
    const clientIp = createTestClientIp();
    const emails = Array.from(
      { length: 13 },
      (_, index) => `newsletter-shared-limit-${index}-${suffix}@example.test`,
    );
    const limit = { maxRequests: 2, windowMs: 10_000 };
    const startedServers: Server[] = [];

    const startServer = async () => {
      const app = createTestApp();
      app.use("/api", createNewsletterSubscribeRouter({
        rateLimit: limit,
        sendConfirmationEmail: async () => {},
      }));

      const server = app.listen(0, "127.0.0.1");
      startedServers.push(server);
      await once(server, "listening");
      const address = server.address();
      assert.ok(address && typeof address !== "string");
      return `http://127.0.0.1:${address.port}/api/newsletter/subscribe`;
    };

    const request = async (url: string, email: string) => fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": clientIp,
      },
      body: JSON.stringify({ email }),
    });

    const closeServers = async () => {
      await Promise.all(startedServers.map(server => new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      })));
      startedServers.length = 0;
    };

    try {
      const firstInstanceUrl = await startServer();
      const secondInstanceUrl = await startServer();
      const concurrentResponses = await Promise.all(emails.slice(0, 12).map((email, index) =>
        request(index % 2 === 0 ? firstInstanceUrl : secondInstanceUrl, email),
      ));
      assert.equal(concurrentResponses.filter(response => response.status === 202).length, 2);
      assert.equal(concurrentResponses.filter(response => response.status === 429).length, 10);

      const insertedSubscribers = await db
        .select({ email: newsletterSubscribersTable.email })
        .from(newsletterSubscribersTable)
        .where(inArray(newsletterSubscribersTable.email, emails.slice(0, 12)));
      assert.equal(insertedSubscribers.length, 2);

      await closeServers();

      const restartedInstanceUrl = await startServer();
      const afterRestart = await request(restartedInstanceUrl, emails[12]!);
      assert.equal(afterRestart.status, 429);
      assert.ok(Number(afterRestart.headers.get("retry-after")) > 0);
    } finally {
      await closeServers();
      await db
        .delete(newsletterSubscribersTable)
        .where(inArray(newsletterSubscribersTable.email, emails));
      await deleteRateLimitsForIps([clientIp]);
    }
  });

  it("gibt nach der Bestätigung nur den festen Anmeldeursprung zurück", async () => {
    const email = `newsletter-confirm-${randomUUID()}@example.test`;
    const token = randomUUID();

    await db.insert(newsletterSubscribersTable).values({
      email,
      confirmed: false,
      confirmToken: token,
      signupLocation: "home",
    });

    const app = express();
    app.use("/api", newsletterRouter);
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const url = `http://127.0.0.1:${address.port}/api/newsletter/confirm?token=${token}`;

    try {
      const [firstResponse, concurrentResponse] = await Promise.all([
        fetch(url, { redirect: "manual" }),
        fetch(url, { redirect: "manual" }),
      ]);
      const successfulResponse = firstResponse.status === 200
        ? firstResponse
        : concurrentResponse;
      const unsuccessfulResponse = firstResponse.status === 200
        ? concurrentResponse
        : firstResponse;

      assert.equal(firstResponse.status + concurrentResponse.status, 200 + 404);
      assert.equal(unsuccessfulResponse.status, 404);
      assert.deepEqual(await unsuccessfulResponse.json(), {
        error: "Bestätigungslink nicht gefunden.",
      });
      assert.equal(successfulResponse.status, 200);
      const body = await successfulResponse.json();

      assert.deepEqual(body, { location: "home" });
      assert.doesNotMatch(JSON.stringify(body), new RegExp(email));
      assert.doesNotMatch(JSON.stringify(body), new RegExp(token));

      const [subscriber] = await db
        .select({
          confirmed: newsletterSubscribersTable.confirmed,
          confirmToken: newsletterSubscribersTable.confirmToken,
          signupLocation: newsletterSubscribersTable.signupLocation,
        })
        .from(newsletterSubscribersTable)
        .where(eq(newsletterSubscribersTable.email, email))
        .limit(1);
      assert.deepEqual(subscriber, {
        confirmed: true,
        confirmToken: null,
        signupLocation: "home",
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
      await db
        .delete(newsletterSubscribersTable)
        .where(eq(newsletterSubscribersTable.email, email));
    }
  });
});
