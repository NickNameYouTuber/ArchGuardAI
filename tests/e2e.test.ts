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
    expect(captured.stdout()).toContain("no violations found");
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
});
