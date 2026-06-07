import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type {
  AgentTarget,
  ArchitectureConfig,
} from "../src/config/types.js";
import { createInstructionDocument } from "../src/generator/document.js";
import {
  checkTargetFile,
  generateTargetFile,
} from "../src/generator/files.js";
import {
  END_MARKER,
  managedBlockIsCurrent,
  START_MARKER,
  updateManagedBlock,
  validateManagedBlock,
} from "../src/generator/managed-block.js";
import {
  renderTargetBlock,
  targetPreamble,
} from "../src/generator/renderers.js";
import { selectAgentTargets } from "../src/generator/selection.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets: AgentTarget[] = ["agents", "cursor", "claude", "copilot"];

const compactConfig: ArchitectureConfig = {
  version: 1,
  architecture: {
    name: "demo-project",
    pattern: "layered",
    language: "typescript",
    framework: "nodejs",
  },
  agents: {
    targets,
  },
  layers: {
    application: {
      description: "Application layer.",
      path: "src/application/**/*.ts",
      cannot_import: ["src/infrastructure/**"],
    },
  },
};

describe("multi-agent generation", () => {
  it.each(targets)("matches the %s golden file", async (target) => {
    const expected = await readFile(
      path.join(repositoryRoot, "tests", "golden", `${target}-default.md`),
      "utf8",
    );
    const actual = updateManagedBlock(
      `${targetPreamble(target)}\n`,
      renderTargetBlock(target, createInstructionDocument(compactConfig)),
      `${target}-default.md`,
    );

    expect(actual).toBe(expected);
  });

  it.each(targets)("is idempotent and preserves user content for %s", (target) => {
    const block = renderTargetBlock(
      target,
      createInstructionDocument(compactConfig),
    );
    const initial = `${targetPreamble(target)}\n\nUser content before.\n`;
    const first = updateManagedBlock(initial, block, `${target}.md`);
    const withAfter = `${first.trimEnd()}\n\nUser content after.\n`;
    const second = updateManagedBlock(withAfter, block, `${target}.md`);

    expect(second).toBe(withAfter);
    expect(second).toContain("User content before.");
    expect(second).toContain("User content after.");
    expect(second.match(new RegExp(START_MARKER, "g"))).toHaveLength(1);
    expect(second.match(new RegExp(END_MARKER, "g"))).toHaveLength(1);
  });

  it("preserves existing Cursor frontmatter", () => {
    const existing = [
      "---",
      "description: Custom project architecture",
      "globs: src/**/*.ts",
      "alwaysApply: false",
      "---",
      "",
      "# Custom Cursor Rule",
      "",
    ].join("\n");
    const block = renderTargetBlock(
      "cursor",
      createInstructionDocument(compactConfig),
    );
    const result = updateManagedBlock(
      existing,
      block,
      ".cursor/rules/archguard-architecture.mdc",
    );

    expect(result).toContain("description: Custom project architecture");
    expect(result).toContain("alwaysApply: false");
    expect(result).toContain("# Custom Cursor Rule");
  });

  it.each([
    `${START_MARKER}\ncontent`,
    `${END_MARKER}\ncontent`,
    `${START_MARKER}\n${START_MARKER}\n${END_MARKER}`,
    `${END_MARKER}\n${START_MARKER}`,
  ])("rejects malformed managed markers", (content) => {
    expect(() => validateManagedBlock(content, "AGENTS.md")).toThrow();
  });

  it("normalizes line endings when checking managed content", () => {
    const block = renderTargetBlock(
      "agents",
      createInstructionDocument(compactConfig),
    );
    const content = updateManagedBlock("# Instructions\n", block, "AGENTS.md");

    expect(
      managedBlockIsCurrent(
        content.replaceAll("\n", "\r\n"),
        block,
        "AGENTS.md",
      ),
    ).toBe(true);
  });
});

describe("agent target selection", () => {
  it("uses configured targets by default", () => {
    expect(selectAgentTargets(compactConfig, {})).toEqual(targets);
  });

  it("falls back to AGENTS.md for legacy contracts", () => {
    const legacy = structuredClone(compactConfig);
    delete legacy.agents;
    expect(selectAgentTargets(legacy, {})).toEqual(["agents"]);
  });

  it("supports one target and every target", () => {
    expect(selectAgentTargets(compactConfig, { target: "cursor" })).toEqual([
      "cursor",
    ]);
    expect(selectAgentTargets(compactConfig, { all: true })).toEqual(targets);
  });

  it("rejects unknown and conflicting flags", () => {
    expect(() =>
      selectAgentTargets(compactConfig, { target: "unknown" }),
    ).toThrow("Unknown agent target");
    expect(() =>
      selectAgentTargets(compactConfig, { target: "cursor", all: true }),
    ).toThrow("cannot be used together");
  });
});

describe("agent file drift", () => {
  it("reports missing, in-sync, and stale states", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-drift-"));
    const document = createInstructionDocument(compactConfig);

    await expect(checkTargetFile(root, "agents", document)).resolves.toMatchObject({
      status: "missing",
    });

    await generateTargetFile(root, "agents", document);
    await expect(checkTargetFile(root, "agents", document)).resolves.toMatchObject({
      status: "in-sync",
    });

    const agentsPath = path.join(root, "AGENTS.md");
    const current = await readFile(agentsPath, "utf8");
    await writeFile(agentsPath, `User-owned heading.\n\n${current}`);
    await expect(checkTargetFile(root, "agents", document)).resolves.toMatchObject({
      status: "in-sync",
    });

    await writeFile(
      agentsPath,
      `User-owned heading.\n\n${current}`.replace(
        "Pattern: **layered**",
        "Pattern: **changed**",
      ),
    );
    await expect(checkTargetFile(root, "agents", document)).resolves.toMatchObject({
      status: "stale",
    });
  });

  it("does not rewrite files that are already current", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-current-"));
    const document = createInstructionDocument(compactConfig);
    await mkdir(path.join(root, ".cursor", "rules"), { recursive: true });

    await expect(generateTargetFile(root, "cursor", document)).resolves.toMatchObject({
      changed: true,
    });
    await expect(generateTargetFile(root, "cursor", document)).resolves.toMatchObject({
      changed: false,
    });

    const cursorPath = path.join(
      root,
      ".cursor",
      "rules",
      "archguard-architecture.mdc",
    );
    const cursor = await readFile(cursorPath, "utf8");
    await writeFile(
      cursorPath,
      cursor.replace(
        "description: ArchGuard architecture contract",
        "description: User-owned description",
      ),
    );
    await expect(checkTargetFile(root, "cursor", document)).resolves.toMatchObject({
      status: "in-sync",
    });
  });
});
