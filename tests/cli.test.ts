import { mkdtemp, readFile, writeFile } from "node:fs/promises";
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

  it("generates configured targets and checks them for drift", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-targets-"));
    const runtime = createCapturedRuntime(root);
    await runProgram(["init"], runtime.runtime);

    expect(await runProgram(["agents", "generate"], runtime.runtime)).toBe(0);
    await expect(readFile(path.join(root, "AGENTS.md"), "utf8")).resolves.toContain(
      "Codex-compatible agents",
    );
    await expect(readFile(path.join(root, "CLAUDE.md"), "utf8")).resolves.toContain(
      "Claude Code",
    );
    await expect(
      readFile(
        path.join(root, ".cursor", "rules", "archguard-architecture.mdc"),
        "utf8",
      ),
    ).resolves.toContain("alwaysApply: true");
    await expect(
      readFile(path.join(root, ".github", "copilot-instructions.md"), "utf8"),
    ).resolves.toContain("GitHub Copilot");

    const check = createCapturedRuntime(root);
    expect(await runProgram(["agents", "check"], check.runtime)).toBe(0);
    expect(check.stdout()).toContain("in sync for 4 target(s)");
  });

  it("supports --target and --all selection", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-select-"));
    const runtime = createCapturedRuntime(root);
    await runProgram(["init"], runtime.runtime);

    expect(
      await runProgram(
        ["agents", "generate", "--target", "cursor"],
        runtime.runtime,
      ),
    ).toBe(0);
    await expect(
      readFile(
        path.join(root, ".cursor", "rules", "archguard-architecture.mdc"),
        "utf8",
      ),
    ).resolves.toContain("Cursor");
    await expect(readFile(path.join(root, "AGENTS.md"), "utf8")).rejects.toThrow();

    expect(
      await runProgram(["agents", "generate", "--all"], runtime.runtime),
    ).toBe(0);
    await expect(readFile(path.join(root, "AGENTS.md"), "utf8")).resolves.toContain(
      "ArchGuard",
    );
  });

  it("keeps legacy contracts on AGENTS.md-only generation", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-legacy-agent-"));
    const runtime = createCapturedRuntime(root);
    await writeFile(
      path.join(root, "legacy.yaml"),
      [
        "version: 1",
        "architecture:",
        "  name: legacy",
        "  pattern: layered",
        "  language: typescript",
        "layers:",
        "  source:",
        "    description: Source files.",
        "    path: src/**/*.ts",
        "",
      ].join("\n"),
    );
    await runProgram(["init"], runtime.runtime);
    await writeFile(
      path.join(root, ".archguard", "architecture.yaml"),
      await readFile(path.join(root, "legacy.yaml"), "utf8"),
    );

    expect(await runProgram(["agents", "generate"], runtime.runtime)).toBe(0);
    await expect(readFile(path.join(root, "AGENTS.md"), "utf8")).resolves.toContain(
      "legacy",
    );
    await expect(readFile(path.join(root, "CLAUDE.md"), "utf8")).rejects.toThrow();
  });

  it("returns drift results in JSON without rewriting files", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-json-drift-"));
    const setup = createCapturedRuntime(root);
    await runProgram(["init"], setup.runtime);
    await runProgram(["agents", "generate", "--target", "agents"], setup.runtime);

    const agentsPath = path.join(root, "AGENTS.md");
    const current = await readFile(agentsPath, "utf8");
    await writeFile(
      agentsPath,
      current.replace(
        "Pattern: **clean-architecture-lite**",
        "Pattern: **manual-change**",
      ),
    );

    const check = createCapturedRuntime(root);
    expect(
      await runProgram(
        ["agents", "check", "--target", "agents", "--format", "json"],
        check.runtime,
      ),
    ).toBe(1);
    expect(JSON.parse(check.stdout())).toMatchObject({
      ok: false,
      checkedTargets: 1,
      results: [
        {
          target: "agents",
          path: "AGENTS.md",
          status: "stale",
        },
      ],
    });
    expect(await readFile(agentsPath, "utf8")).toContain("manual-change");
  });

  it("returns 1 for missing generated files", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-missing-agent-"));
    const runtime = createCapturedRuntime(root);
    await runProgram(["init"], runtime.runtime);

    expect(
      await runProgram(
        ["agents", "check", "--target", "claude"],
        runtime.runtime,
      ),
    ).toBe(1);
    expect(runtime.stdout()).toContain("[missing] claude: CLAUDE.md");
  });

  it("returns 2 for conflicting flags, unknown targets, and broken markers", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-agent-errors-"));
    const runtime = createCapturedRuntime(root);
    await runProgram(["init"], runtime.runtime);

    expect(
      await runProgram(
        ["agents", "generate", "--target", "cursor", "--all"],
        runtime.runtime,
      ),
    ).toBe(2);
    expect(
      await runProgram(
        ["agents", "generate", "--target", "unknown"],
        runtime.runtime,
      ),
    ).toBe(2);

    await writeFile(
      path.join(root, "AGENTS.md"),
      "<!-- archguard:start -->\nbroken\n",
    );
    expect(
      await runProgram(
        ["agents", "check", "--target", "agents"],
        runtime.runtime,
      ),
    ).toBe(2);
  });

  it("returns 2 for a missing check path", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-missing-"));
    const runtime = createCapturedRuntime(root);
    await runProgram(["init"], runtime.runtime);

    expect(await runProgram(["check", "missing"], runtime.runtime)).toBe(2);
    expect(runtime.stderr()).toContain("Check path does not exist");
  });
});
