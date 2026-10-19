import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname;
const SOURCE_DIRS = ["artifacts/ffb-lokal/src", "artifacts/api-server/src"];
const URL_REGEX = /https?:\/\/[^\s"'`)\]>]+/g;

function collectFiles(dir: string): string[] {
  const abs = join(ROOT, dir);
  const results: string[] = [];
  function walk(d: string) {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?|yaml|yml|md)$/.test(entry)) results.push(full);
    }
  }
  try { walk(abs); } catch { /* dir may not exist */ }
  return results;
}

function extractLinks(file: string): Array<{ url: string; file: string; line: number }> {
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  const found: Array<{ url: string; file: string; line: number }> = [];
  lines.forEach((line, i) => {
    const matches = line.match(URL_REGEX) ?? [];
    for (const url of matches) {
      const clean = url.replace(/[.,;)>\]'"]+$/, "");
      if (clean.startsWith("http")) found.push({ url: clean, file: file.replace(ROOT, ""), line: i + 1 });
    }
  });
  return found;
}

async function checkUrl(url: string): Promise<{ ok: boolean; status: number | string }> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      method: "HEAD",
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "germring.de/linkchecker (+https://germring.de)" },
    });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: msg.includes("abort") ? "TIMEOUT" : "ERROR" };
  }
}

async function main() {
  const allLinks: Array<{ url: string; file: string; line: number }> = [];
  for (const dir of SOURCE_DIRS) {
    for (const file of collectFiles(dir)) {
      allLinks.push(...extractLinks(file));
    }
  }

  const unique = [...new Map(allLinks.map((l) => [l.url, l])).values()];
  const SKIP = /localhost|unsplash\.com\/photos\/[a-z0-9-]+$|127\.0\.0|replit\.dev/;
  const toCheck = unique.filter((l) => !SKIP.test(l.url));

  console.log(`\n🔍 Checking ${toCheck.length} unique external links...\n`);

  const broken: typeof toCheck = [];

  for (const link of toCheck) {
    const { ok, status } = await checkUrl(link.url);
    const icon = ok ? "✅" : "❌";
    const label = ok ? String(status) : `${status}`;
    console.log(`${icon} [${label}]  ${link.url}`);
    if (!ok) broken.push(link);
    await new Promise((r) => setTimeout(r, 300));
  }

  if (broken.length === 0) {
    console.log("\n✅ Alle Links OK.\n");
  } else {
    console.log(`\n❌ ${broken.length} tote Link(s) gefunden:\n`);
    for (const l of broken) {
      console.log(`   ${l.file}:${l.line}  →  ${l.url}`);
    }
    process.exit(1);
  }
}

main();
