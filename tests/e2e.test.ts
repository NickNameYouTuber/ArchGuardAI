import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runProgram } from "../src/program.js";
import { createCapturedRuntime } from "./helpers.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("example projects", () => {
  it("returns 0 for the good example", async () => {
    const captured = createCapturedRuntime(
      path.join(repositoryRoot, "examples", "nestjs-good"),
    );
    expect(await runProgram(["check"], captured.runtime)).toBe(0);
    expect(captured.stdout()).toContain("no violations or diagnostics found");
  });

  it("returns 1 and JSON evidence for the bad example", async () => {
    const captured = createCapturedRuntime(
      path.join(repositoryRoot, "examples", "nestjs-bad"),
    );
    expect(await runProgram(["check", "--format", "json"], captured.runtime)).toBe(1);

    const report = JSON.parse(captured.stdout()) as {
      ok: boolean;
      violations: Array<{ rule: string }>;
    };
    expect(report.ok).toBe(false);
    expect(report.violations[0]?.rule).toBe("cannot-call");
  });

  it("runs the complete agent generation and drift workflow", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-agent-e2e-"));
    const setup = createCapturedRuntime(root);

    expect(await runProgram(["init"], setup.runtime)).toBe(0);
    expect(await runProgram(["agents", "generate"], setup.runtime)).toBe(0);

    const clean = createCapturedRuntime(root);
    expect(await runProgram(["agents", "check"], clean.runtime)).toBe(0);

    const cursorPath = path.join(
      root,
      ".cursor",
      "rules",
      "archguard-architecture.mdc",
    );
    const cursor = await readFile(cursorPath, "utf8");
    await writeFile(
      cursorPath,
      cursor.replace("Pattern: **clean-architecture-lite**", "Pattern: **stale**"),
    );

    const drift = createCapturedRuntime(root);
    expect(await runProgram(["agents", "check"], drift.runtime)).toBe(1);
    expect(drift.stdout()).toContain("[stale] cursor");
  });
});
