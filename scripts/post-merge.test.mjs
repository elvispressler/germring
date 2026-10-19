import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";
import { test } from "node:test";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const postMergeScriptPath = resolve(rootDir, "scripts/post-merge.sh");

function createFakePnpm(binDir) {
  const pnpmPath = join(binDir, "pnpm");
  writeFileSync(
    pnpmPath,
    [
      "#!/bin/bash",
      "set -eu",
      'printf "%s\\n" "$*" >> "$POST_MERGE_LOG"',
      'case "$*" in',
      '  "install --frozen-lockfile") phase="install" ;;',
      '  "run typecheck") phase="typecheck" ;;',
      '  "--filter db push") phase="schema" ;;',
      '  *) echo "unexpected pnpm command: $*" >&2; exit 99 ;;',
      "esac",
      'if [[ "${SPAWN_GRANDCHILD_PHASE:-}" == "$phase" ]]; then',
      '  if [[ "${IGNORE_TERM_GRANDCHILD_PHASE:-}" == "$phase" ]]; then',
      '    node -e \'require("node:fs").writeFileSync(process.env.GRANDCHILD_PID_FILE, String(process.pid)); process.on("SIGTERM", () => {}); setInterval(() => {}, 1000);\'',
      "  else",
      "    node -e 'require(\"node:fs\").writeFileSync(process.env.GRANDCHILD_PID_FILE, String(process.pid)); setInterval(() => {}, 1000);'",
      "  fi",
      "fi",
      'if [[ "${SPAWN_PARALLEL_GRANDCHILDREN_PHASE:-}" == "$phase" ]]; then',
      "  node -e 'require(\"node:fs\").writeFileSync(process.env.NORMAL_GRANDCHILD_PID_FILE, String(process.pid)); setInterval(() => {}, 1000);' &",
      '  node -e \'require("node:fs").writeFileSync(process.env.IGNORING_GRANDCHILD_PID_FILE, String(process.pid)); process.on("SIGTERM", () => {}); setInterval(() => {}, 1000);\' &',
      "fi",
      'if [[ "$SLOW_PHASE" == "$phase" ]]; then sleep "${SLOW_SECONDS:-5}"; fi',
      'if [[ "$FAIL_PHASE" == "$phase" ]]; then exit "$FAIL_STATUS"; fi',
      "",
    ].join("\n"),
  );
  chmodSync(pnpmPath, 0o755);
}

function runPostMergeAndReadLog(options) {
  const tempDir = mkdtempSync(join(tmpdir(), "post-merge-test-"));
  const binDir = join(tempDir, "bin");
  const logPath = join(tempDir, "pnpm.log");
  mkdirSync(binDir);
  createFakePnpm(binDir);

  try {
    const result = spawnSync("/bin/bash", [postMergeScriptPath], {
      cwd: rootDir,
      encoding: "utf8",
      env: {
        ...process.env,
        FAIL_PHASE: options.failPhase ?? "",
        FAIL_STATUS: String(options.failStatus ?? 0),
        POST_MERGE_LOG: logPath,
        SLOW_PHASE: options.slowPhase ?? "",
        SLOW_SECONDS: String(options.slowSeconds ?? 5),
        PATH: `${binDir}:${process.env.PATH}`,
      },
    });
    const commands = readFileSync(logPath, "utf8").trim().split("\n");
    return { result, commands };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function runPostMergeUntilTimeout(options) {
  const tempDir = mkdtempSync(join(tmpdir(), "post-merge-timeout-test-"));
  const binDir = join(tempDir, "bin");
  const logPath = join(tempDir, "pnpm.log");
  const grandchildPidPath = join(tempDir, "grandchild.pid");
  const normalGrandchildPidPath = join(tempDir, "normal-grandchild.pid");
  const ignoringGrandchildPidPath = join(tempDir, "ignoring-grandchild.pid");
  const transitionHookPath = join(tempDir, "transition-hook.sh");
  mkdirSync(binDir);
  createFakePnpm(binDir);
  if (options.abortDuringPhaseTransition) {
    writeFileSync(
      transitionHookPath,
      [
        "#!/bin/bash",
        "set -T",
        "trap 'if [[ \"${current_phase:-}\" == \"typecheck\" && \"${BASH_COMMAND:-}\" == phase_pid=* ]]; then trap - DEBUG; sleep 0.1; kill -TERM \"$$\"; fi' DEBUG",
        "",
      ].join("\n"),
    );
  }

  return new Promise((resolve, reject) => {
    const child = spawn("/bin/bash", [postMergeScriptPath], {
      cwd: rootDir,
      detached: true,
      env: {
        ...process.env,
        FAIL_PHASE: "",
        FAIL_STATUS: "0",
        POST_MERGE_LOG: logPath,
        GRANDCHILD_PID_FILE: grandchildPidPath,
        NORMAL_GRANDCHILD_PID_FILE: normalGrandchildPidPath,
        IGNORING_GRANDCHILD_PID_FILE: ignoringGrandchildPidPath,
        IGNORE_TERM_GRANDCHILD_PHASE: options.ignoreTermGrandchildPhase ?? "",
        SPAWN_GRANDCHILD_PHASE: options.spawnGrandchildPhase ?? "",
        SPAWN_PARALLEL_GRANDCHILDREN_PHASE:
          options.spawnParallelGrandchildrenPhase ?? "",
        SLOW_PHASE: options.slowPhase ?? "",
        SLOW_SECONDS: String(options.slowSeconds ?? 5),
        ...(options.abortDuringPhaseTransition
          ? { BASH_ENV: transitionHookPath }
          : {}),
        PATH: `${binDir}:${process.env.PATH}`,
      },
    });
    let stdout = "";
    let stderr = "";
    let timeout;

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", (error) => {
      clearTimeout(timeout);
      rmSync(tempDir, { recursive: true, force: true });
      reject(error);
    });
    child.once("close", (status, signal) => {
      clearTimeout(timeout);
      const commands = readFileSync(logPath, "utf8").trim().split("\n");
      const grandchildPid = existsSync(grandchildPidPath)
        ? readFileSync(grandchildPidPath, "utf8").trim()
        : null;
      const normalGrandchildPid = existsSync(normalGrandchildPidPath)
        ? readFileSync(normalGrandchildPidPath, "utf8").trim()
        : null;
      const ignoringGrandchildPid = existsSync(ignoringGrandchildPidPath)
        ? readFileSync(ignoringGrandchildPidPath, "utf8").trim()
        : null;
      rmSync(tempDir, { recursive: true, force: true });
      resolve({
        result: { status, signal, stdout, stderr },
        commands,
        grandchildPid,
        normalGrandchildPid,
        ignoringGrandchildPid,
      });
    });

    timeout = setTimeout(() => {
      for (
        let signalNumber = 0;
        signalNumber < (options.signalCount ?? 1);
        signalNumber += 1
      ) {
        try {
          process.kill(-child.pid, "SIGTERM");
        } catch {
          // The process may have exited between the timer and the signal.
        }
      }
    }, options.signalAfterMs ?? 100);
  });
}

function isProcessRunning(pid) {
  try {
    const numericPid = Number(pid);
    process.kill(numericPid, 0);
    const stat = readFileSync(`/proc/${numericPid}/stat`, "utf8");
    const stateStart = stat.lastIndexOf(") ") + 2;
    return stat[stateStart] !== "Z";
  } catch {
    return false;
  }
}

test("reports the failed phase and preserves its exit status", () => {
  for (const scenario of [
    {
      failPhase: "install",
      label: "install dependencies",
      commands: ["install --frozen-lockfile"],
    },
    {
      failPhase: "typecheck",
      label: "typecheck",
      commands: ["install --frozen-lockfile", "run typecheck"],
    },
    {
      failPhase: "schema",
      label: "synchronize schema",
      commands: [
        "install --frozen-lockfile",
        "run typecheck",
        "--filter db push",
      ],
    },
  ]) {
    const failStatus = 37;
    const { result, commands } = runPostMergeAndReadLog({
      failPhase: scenario.failPhase,
      failStatus,
    });
    const output = `${result.stdout}\n${result.stderr}`;

    assert.equal(result.status, failStatus);
    assert.match(
      output,
      new RegExp(`\\[post-merge\\] ${scenario.label} failed after \\d+ms`),
    );
    assert.deepEqual(commands, scenario.commands);
  }
});

test("reports the phase that is active when the merge check times out", async () => {
  for (const scenario of [
    {
      slowPhase: "install",
      label: "install dependencies",
      commands: ["install --frozen-lockfile"],
    },
    {
      slowPhase: "typecheck",
      label: "typecheck",
      commands: ["install --frozen-lockfile", "run typecheck"],
    },
    {
      slowPhase: "schema",
      label: "synchronize schema",
      commands: [
        "install --frozen-lockfile",
        "run typecheck",
        "--filter db push",
      ],
    },
  ]) {
    const { result, commands } = await runPostMergeUntilTimeout({
      slowPhase: scenario.slowPhase,
    });
    const output = `${result.stdout}\n${result.stderr}`;

    assert.equal(result.status, 124);
    assert.equal(result.signal, null);
    assert.match(
      output,
      new RegExp(
        `\\[post-merge\\] timed out during ${scenario.label} after \\d+ms`,
      ),
    );
    assert.deepEqual(commands, scenario.commands);
  }
});

test("terminates phase grandchildren when the merge check times out", async () => {
  const { result, grandchildPid } = await runPostMergeUntilTimeout({
    slowPhase: "typecheck",
    spawnGrandchildPhase: "typecheck",
    signalAfterMs: 200,
  });
  const output = `${result.stdout}\n${result.stderr}`;

  try {
    assert.equal(result.status, 124);
    assert.equal(result.signal, null);
    assert.match(
      output,
      /\[post-merge\] timed out during typecheck after \d+ms/,
    );
    assert.ok(grandchildPid);
    assert.equal(isProcessRunning(grandchildPid), false);
  } finally {
    if (grandchildPid && isProcessRunning(grandchildPid)) {
      process.kill(Number(grandchildPid), "SIGKILL");
    }
  }
});

test("force-terminates phase grandchildren that ignore the merge abort", async () => {
  const { result, grandchildPid } = await runPostMergeUntilTimeout({
    slowPhase: "typecheck",
    spawnGrandchildPhase: "typecheck",
    ignoreTermGrandchildPhase: "typecheck",
    signalAfterMs: 200,
  });
  const output = `${result.stdout}\n${result.stderr}`;

  try {
    assert.equal(result.status, 124);
    assert.equal(result.signal, null);
    assert.match(
      output,
      /\[post-merge\] timed out during typecheck after \d+ms/,
    );
    assert.ok(grandchildPid);
    assert.equal(isProcessRunning(grandchildPid), false);
  } finally {
    if (grandchildPid && isProcessRunning(grandchildPid)) {
      process.kill(Number(grandchildPid), "SIGKILL");
    }
  }
});

test("terminates every phase grandchild when one ignores the merge abort", async () => {
  const { result, normalGrandchildPid, ignoringGrandchildPid } =
    await runPostMergeUntilTimeout({
      slowPhase: "typecheck",
      spawnParallelGrandchildrenPhase: "typecheck",
      signalAfterMs: 200,
    });
  const output = `${result.stdout}\n${result.stderr}`;

  try {
    assert.equal(result.status, 124);
    assert.equal(result.signal, null);
    assert.match(
      output,
      /\[post-merge\] timed out during typecheck after \d+ms/,
    );
    assert.ok(normalGrandchildPid);
    assert.ok(ignoringGrandchildPid);
    assert.equal(isProcessRunning(normalGrandchildPid), false);
    assert.equal(isProcessRunning(ignoringGrandchildPid), false);
  } finally {
    for (const pid of [normalGrandchildPid, ignoringGrandchildPid]) {
      if (pid && isProcessRunning(pid)) {
        process.kill(Number(pid), "SIGKILL");
      }
    }
  }
});

test("handles repeated merge aborts without leaving phase processes running", async () => {
  const { result, normalGrandchildPid, ignoringGrandchildPid } =
    await runPostMergeUntilTimeout({
      slowPhase: "typecheck",
      spawnParallelGrandchildrenPhase: "typecheck",
      signalAfterMs: 200,
      signalCount: 3,
    });
  const output = `${result.stdout}\n${result.stderr}`;

  try {
    assert.equal(result.status, 124);
    assert.equal(result.signal, null);
    assert.match(
      output,
      /\[post-merge\] timed out during typecheck after \d+ms/,
    );
    assert.ok(normalGrandchildPid);
    assert.ok(ignoringGrandchildPid);
    assert.equal(isProcessRunning(normalGrandchildPid), false);
    assert.equal(isProcessRunning(ignoringGrandchildPid), false);
  } finally {
    for (const pid of [normalGrandchildPid, ignoringGrandchildPid]) {
      if (pid && isProcessRunning(pid)) {
        process.kill(Number(pid), "SIGKILL");
      }
    }
  }
});

test("handles a timeout during the phase handoff without leaving the next phase running", async () => {
  const { result, commands, grandchildPid } = await runPostMergeUntilTimeout({
    abortDuringPhaseTransition: true,
    spawnGrandchildPhase: "typecheck",
    signalAfterMs: 1000,
  });
  const output = `${result.stdout}\n${result.stderr}`;

  try {
    assert.equal(result.status, 124);
    assert.equal(result.signal, null);
    assert.match(
      output,
      /\[post-merge\] timed out during typecheck after \d+ms/,
    );
    assert.deepEqual(commands, [
      "install --frozen-lockfile",
      "run typecheck",
    ]);
    assert.ok(grandchildPid);
    assert.equal(isProcessRunning(grandchildPid), false);
  } finally {
    if (grandchildPid && isProcessRunning(grandchildPid)) {
      process.kill(Number(grandchildPid), "SIGKILL");
    }
  }
});

test("runs all merge phases when every command succeeds", () => {
  const { result, commands } = runPostMergeAndReadLog({});

  assert.equal(result.status, 0);
  assert.match(
    result.stdout,
    /\[post-merge\] install dependencies completed in \d+ms/,
  );
  assert.match(result.stdout, /\[post-merge\] typecheck completed in \d+ms/);
  assert.match(
    result.stdout,
    /\[post-merge\] synchronize schema completed in \d+ms/,
  );
  assert.deepEqual(commands, [
    "install --frozen-lockfile",
    "run typecheck",
    "--filter db push",
  ]);
});

test("reports the elapsed time of a slow successful phase", () => {
  const { result } = runPostMergeAndReadLog({
    slowPhase: "typecheck",
    slowSeconds: 0.15,
  });

  assert.equal(result.status, 0);
  const match = result.stdout.match(
    /\[post-merge\] typecheck completed in (\d+)ms/,
  );
  assert.ok(match);
  assert.ok(Number(match[1]) >= 100);
});
