import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../src/config/default-config.js";
import { findLayer, findLayers } from "../src/checker/layers.js";

describe("findLayer", () => {
  it("matches normalized source paths", () => {
    expect(findLayer("src\\users\\users.controller.ts", DEFAULT_CONFIG)).toBe(
      "controller",
    );
    expect(findLayer("src/users/create-user.use-case.ts", DEFAULT_CONFIG)).toBe(
      "use_case",
    );
  });

  it("returns undefined for files outside configured layers", () => {
    expect(findLayer("scripts/release.ts", DEFAULT_CONFIG)).toBeUndefined();
  });

  it("returns every matching layer for overlap diagnostics", () => {
    const config = structuredClone(DEFAULT_CONFIG);
    config.layers.all_source = {
      description: "All source files",
      path: "src/**/*.ts",
    };

    expect(findLayers("src/users/users.controller.ts", config)).toEqual([
      "controller",
      "all_source",
    ]);
  });
});
