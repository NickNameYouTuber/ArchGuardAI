import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { stringify } from "yaml";
import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../src/config/default-config.js";
import { loadConfig, validateConfig } from "../src/config/load-config.js";

describe("architecture configuration", () => {
  it("validates the default contract", () => {
    expect(validateConfig(DEFAULT_CONFIG)).toEqual(DEFAULT_CONFIG);
  });

  it("rejects unsupported versions", () => {
    expect(() => validateConfig({ ...DEFAULT_CONFIG, version: 2 })).toThrow(
      '"version" must be 1',
    );
  });

  it("rejects references to unknown layers", () => {
    const invalid = structuredClone(DEFAULT_CONFIG);
    invalid.layers.controller!.can_call = ["missing"];

    expect(() => validateConfig(invalid)).toThrow('unknown layer "missing"');
  });

  it("validates configured agent targets", () => {
    expect(validateConfig(DEFAULT_CONFIG).agents?.targets).toEqual([
      "agents",
      "cursor",
      "claude",
      "copilot",
    ]);
  });

  it.each([
    {
      name: "empty",
      targets: [],
      message: '"agents.targets" must not be empty',
    },
    {
      name: "unknown",
      targets: ["agents", "windsurf"],
      message: 'unknown agent target "windsurf"',
    },
    {
      name: "duplicate",
      targets: ["agents", "agents"],
      message: 'duplicate agent target "agents"',
    },
  ])("rejects $name agent targets", ({ targets, message }) => {
    const invalid = structuredClone(DEFAULT_CONFIG) as unknown as Record<
      string,
      unknown
    >;
    invalid.agents = { targets };
    expect(() => validateConfig(invalid)).toThrow(message);
  });

  it("loads YAML from the project contract path", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-config-"));
    await mkdir(path.join(root, ".archguard"));
    await writeFile(
      path.join(root, ".archguard", "architecture.yaml"),
      stringify(DEFAULT_CONFIG),
    );

    await expect(loadConfig(root)).resolves.toEqual(DEFAULT_CONFIG);
  });
});
