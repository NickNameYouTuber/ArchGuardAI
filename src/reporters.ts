import type { CheckResult } from "./checker/types.js";

export function checkFailed(result: CheckResult): boolean {
  return (
    result.violations.length > 0 ||
    result.diagnostics.some((diagnostic) => diagnostic.severity === "error")
  );
}

export function renderHumanReport(result: CheckResult): string {
  const failed = checkFailed(result);
  const warnings = result.diagnostics.filter(
    (diagnostic) => diagnostic.severity === "warning",
  );

  if (!failed && warnings.length === 0) {
    return `ArchGuard check passed. Checked ${result.checkedFiles} TypeScript file(s); no violations or diagnostics found.\n`;
  }

  const violationDetails = result.violations
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

  const diagnosticDetails = result.diagnostics
    .map(
      (diagnostic, index) =>
        [
          `${index + 1}. [${diagnostic.severity}] ${diagnostic.message}`,
          `   Type: ${diagnostic.type}`,
          `   File: ${diagnostic.file}`,
        ].join("\n"),
    )
    .join("\n\n");

  const sections = [
    failed ? "ArchGuard check failed." : "ArchGuard check passed with warnings.",
    "",
  ];
  if (violationDetails) {
    sections.push("Violations:", "", violationDetails, "");
  }
  if (diagnosticDetails) {
    sections.push("Diagnostics:", "", diagnosticDetails, "");
  }
  sections.push(
    `Found ${result.violations.length} violation(s) and ${result.diagnostics.length} diagnostic(s) in ${result.checkedFiles} TypeScript file(s).`,
    "",
  );

  return sections.join("\n");
}

export function renderJsonReport(result: CheckResult): string {
  return `${JSON.stringify(
    {
      ok: !checkFailed(result),
      ...result,
    },
    null,
    2,
  )}\n`;
}
