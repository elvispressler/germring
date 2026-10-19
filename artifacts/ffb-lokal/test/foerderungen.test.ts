import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  foerderungen,
  getFundingLinkCheckItems,
} from "../src/data/foerderungen.ts";

describe("Förderquellen für den Linkcheck", () => {
  it("liefert jede redaktionelle Quelle genau einmal mit stabiler Source-ID", () => {
    const items = getFundingLinkCheckItems("https://germring.de", "/");
    const expectedCount = foerderungen.reduce(
      (count, program) => count + program.links.length,
      0,
    );
    const sourceIds = items.map((item) => item.sourceId);

    assert.equal(items.length, expectedCount);
    assert.equal(new Set(sourceIds).size, sourceIds.length);
    assert.ok(items.every((item) => item.sourceId.includes(":")));
  });

  it("löst interne Quellen gegen den Artifact-Pfad auf und lässt externe URLs unverändert", () => {
    const items = getFundingLinkCheckItems("https://germring.de", "/lokal/");
    const internal = items.find((item) => item.href === "/pv-rechner");
    const external = items.find((item) => item.href.startsWith("https://"));

    assert.equal(internal?.url, "https://germring.de/lokal/pv-rechner");
    assert.equal(external?.url, external?.href);
  });
});
