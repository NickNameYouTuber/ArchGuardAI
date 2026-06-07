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
