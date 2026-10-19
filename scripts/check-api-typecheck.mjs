import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiTsconfigPath = resolve(rootDir, "artifacts/api-server/tsconfig.json");

function run(command, args) {
  execFileSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
  });
}

function assertApiHasNoProjectReferences() {
  const apiTsconfig = JSON.parse(readFileSync(apiTsconfigPath, "utf8"));
  if (Array.isArray(apiTsconfig.references) && apiTsconfig.references.length > 0) {
    throw new Error(
      "Fresh API typecheck must not use project references. " +
        "Remove artifacts/api-server/tsconfig.json references; " +
        "workspace package declarations must be resolved from their source exports.",
    );
  }
}

// The library projects are composite projects, so their declaration output can
// mask an accidental API project reference during the normal typecheck.
assertApiHasNoProjectReferences();
run("pnpm", ["exec", "tsc", "--build", "--clean", "tsconfig.json"]);
rmSync(resolve(rootDir, "artifacts/api-server/.tsbuildinfo"), { force: true });

run("pnpm", ["--filter", "@workspace/api-server", "run", "typecheck"]);
