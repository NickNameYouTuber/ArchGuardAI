import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../src/config/default-config.js";
import {
  END_MARKER,
  renderAgentsBlock,
  START_MARKER,
  updateManagedBlock,
} from "../src/generator/agents.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("AGENTS.md generation", () => {
  it("matches the golden generated block", async () => {
    const expected = await readFile(
      path.join(repositoryRoot, "tests", "golden", "agents-default.md"),
      "utf8",
    );
    expect(`${renderAgentsBlock(DEFAULT_CONFIG)}\n`).toBe(expected);
  });

  it("is idempotent and preserves user-owned content", () => {
    const block = renderAgentsBlock(DEFAULT_CONFIG);
    const first = updateManagedBlock("# Team instructions\n", block);
    const second = updateManagedBlock(first, block);

    expect(second).toBe(first);
    expect(second).toContain("# Team instructions");
    expect(second.match(new RegExp(START_MARKER, "g"))).toHaveLength(1);
    expect(second.match(new RegExp(END_MARKER, "g"))).toHaveLength(1);
  });
});
