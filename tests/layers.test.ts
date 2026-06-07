import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../src/config/default-config.js";
import { findLayer } from "../src/checker/layers.js";

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
});
