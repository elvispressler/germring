import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { JSDOM } from "jsdom";

describe("Newsletter-Bestätigungs-URL", () => {
  it("entfernt den Token synchron vor dem Laden der App-Skripte", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    const token = "private-confirm-token";
    const dom = new JSDOM(html, {
      url: `https://germring.de/newsletter/confirm?token=${token}&newsletter=confirmed#details`,
      runScripts: "dangerously",
    });
    const window = dom.window as typeof dom.window & {
      __newsletterConfirmToken?: string;
    };

    assert.equal(window.__newsletterConfirmToken, token);
    assert.equal(window.location.search, "?newsletter=confirmed");
    assert.equal(window.location.hash, "#details");
    assert.equal(window.location.href.includes(token), false);

    dom.window.close();
  });
});