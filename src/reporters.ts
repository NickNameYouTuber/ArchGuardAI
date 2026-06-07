import type { CheckResult } from "./checker/types.js";

export function renderHumanReport(result: CheckResult): string {
  if (result.violations.length === 0) {
    return `ArchGuard check passed. Checked ${result.checkedFiles} TypeScript file(s); no violations found.\n`;
  }

  const details = result.violations
    .map(
      (violation, index) =>
        [
          `${index + 1}. ${violation.message}`,
          `   Rule: ${violation.rule}`,
          `   File: ${violation.file}`,
          `   Import: ${violation.import}`,
        ].join("\n"),
    )
    .join("\n\n");

  return [
    "ArchGuard check failed.",
    "",
    details,
    "",
    `Found ${result.violations.length} violation(s) in ${result.checkedFiles} TypeScript file(s).`,
    "",
  ].join("\n");
}

export function renderJsonReport(result: CheckResult): string {
  return `${JSON.stringify(
    {
      ok: result.violations.length === 0,
      ...result,
    },
    null,
    2,
  )}\n`;
}
