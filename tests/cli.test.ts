import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runProgram } from "../src/program.js";
import { VERSION } from "../src/version.js";
import { createCapturedRuntime } from "./helpers.js";

describe("CLI", () => {
  it("shows help and reports unknown commands as runtime errors", async () => {
    const help = createCapturedRuntime(process.cwd());
    expect(await runProgram(["--help"], help.runtime)).toBe(0);
    expect(help.stdout()).toContain("Architecture contracts");

    const unknown = createCapturedRuntime(process.cwd());
    expect(await runProgram(["unknown"], unknown.runtime)).toBe(2);
    expect(unknown.stderr()).toContain("unknown command");
  });

  it("reads the CLI version from package metadata", async () => {
    const captured = createCapturedRuntime(process.cwd());
    const packageMetadata = JSON.parse(
      await readFile(path.join(process.cwd(), "package.json"), "utf8"),
    ) as { version: string };

    expect(await runProgram(["--version"], captured.runtime)).toBe(0);
    expect(VERSION).toBe(packageMetadata.version);
    expect(captured.stdout()).toBe(`${packageMetadata.version}\n`);
  });

  it("initializes a contract and requires --force to replace it", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-cli-"));
    const runtime = createCapturedRuntime(root);

    expect(await runProgram(["init"], runtime.runtime)).toBe(0);
    expect(await runProgram(["init"], runtime.runtime)).toBe(2);
    expect(await runProgram(["init", "--force"], runtime.runtime)).toBe(0);

    const config = await readFile(
      path.join(root, ".archguard", "architecture.yaml"),
      "utf8",
    );
    expect(config).toContain("clean-architecture-lite");
  });

  it("generates AGENTS.md idempotently", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-agents-"));
    const runtime = createCapturedRuntime(root);
    await runProgram(["init"], runtime.runtime);

    expect(await runProgram(["agents", "generate"], runtime.runtime)).toBe(0);
    const first = await readFile(path.join(root, "AGENTS.md"), "utf8");
    expect(await runProgram(["agents", "generate"], runtime.runtime)).toBe(0);
    const second = await readFile(path.join(root, "AGENTS.md"), "utf8");

    expect(second).toBe(first);
  });

  it("returns 2 for a missing check path", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-missing-"));
    const runtime = createCapturedRuntime(root);
    await runProgram(["init"], runtime.runtime);

    expect(await runProgram(["check", "missing"], runtime.runtime)).toBe(2);
    expect(runtime.stderr()).toContain("Check path does not exist");
  });
});
