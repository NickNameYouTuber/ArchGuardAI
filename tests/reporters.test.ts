import { describe, expect, it } from "vitest";
import {
  checkFailed,
  renderHumanReport,
  renderJsonReport,
} from "../src/reporters.js";

describe("check reporters", () => {
  it("keeps unclassified-file warnings non-blocking", () => {
    const result = {
      checkedFiles: 1,
      violations: [],
      diagnostics: [
        {
          type: "unclassified-file" as const,
          severity: "warning" as const,
          file: "src/orphan.ts",
          message: 'File "src/orphan.ts" does not match any configured layer.',
        },
      ],
    };

    expect(checkFailed(result)).toBe(false);
    expect(renderHumanReport(result)).toContain("passed with warnings");
    expect(JSON.parse(renderJsonReport(result))).toMatchObject({ ok: true });
  });

  it("treats overlapping layers as a failed check", () => {
    const result = {
      checkedFiles: 1,
      violations: [],
      diagnostics: [
        {
          type: "overlapping-layers" as const,
          severity: "error" as const,
          file: "src/user.ts",
          layers: ["source", "user"],
          message: 'File "src/user.ts" matches multiple layers: source, user.',
        },
      ],
    };

    expect(checkFailed(result)).toBe(true);
    expect(renderHumanReport(result)).toContain("[error]");
    expect(JSON.parse(renderJsonReport(result))).toMatchObject({ ok: false });
  });
});
