import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiTsconfigPath = resolve(rootDir, "artifacts/api-server/tsconfig.json");
const checkScriptPath = resolve(rootDir, "scripts/check-api-typecheck.mjs");

test("rejects API project references with an actionable error", () => {
  const originalTsconfig = readFileSync(apiTsconfigPath, "utf8");
  const tsconfigWithReference = {
    ...JSON.parse(originalTsconfig),
    references: [{ path: "../../lib/api-zod" }],
  };

  writeFileSync(
    apiTsconfigPath,
    `${JSON.stringify(tsconfigWithReference, null, 2)}\n`,
  );

  let result;
  try {
    result = spawnSync(process.execPath, [checkScriptPath], {
      cwd: rootDir,
      encoding: "utf8",
    });
  } finally {
    writeFileSync(apiTsconfigPath, originalTsconfig);
  }

  assert.equal(
    readFileSync(apiTsconfigPath, "utf8"),
    originalTsconfig,
    "the regression test must restore the productive API TypeScript configuration",
  );
  assert.equal(result.error, undefined, result.error?.message);
  assert.notEqual(
    result.status,
    0,
    "the fresh API typecheck must fail for project references",
  );

  const output = `${result.stdout}\n${result.stderr}`;
  assert.match(output, /Fresh API typecheck must not use project references\./);
  assert.match(
    output,
    /Remove artifacts\/api-server\/tsconfig\.json references;/,
  );
  assert.match(
    output,
    /workspace package declarations must be resolved from their source exports\./,
  );
});
