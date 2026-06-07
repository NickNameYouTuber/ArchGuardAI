import { readFile } from "node:fs/promises";
import path from "node:path";
import fg, { type Options } from "fast-glob";
import { minimatch } from "minimatch";
import type { ArchitectureConfig } from "../config/types.js";
import { collectImports, resolveProjectImport } from "./imports.js";
import { findLayer, normalizePath } from "./layers.js";
import type { CheckResult, Violation } from "./types.js";

function matchesForbiddenImport(importValue: string, patterns: string[] | undefined): boolean {
  return (
    patterns?.some(
      (pattern) =>
        importValue === pattern ||
        minimatch(importValue, pattern) ||
        minimatch(normalizePath(importValue), normalizePath(pattern)),
    ) ?? false
  );
}

export async function checkProject(
  projectRoot: string,
  scanRoot: string,
  config: ArchitectureConfig,
): Promise<CheckResult> {
  const absoluteScanRoot = path.resolve(projectRoot, scanRoot);
  const globOptions: Options = {
    absolute: true,
    ignore: ["**/*.d.ts", "**/node_modules/**", "**/dist/**"],
    onlyFiles: true,
  };
  const [files, projectFiles] = await Promise.all([
    fg(["**/*.ts", "**/*.tsx"], { ...globOptions, cwd: absoluteScanRoot }),
    fg(["**/*.ts", "**/*.tsx"], { ...globOptions, cwd: projectRoot }),
  ]);
  const knownFiles = new Set(
    projectFiles.map((file) => normalizePath(path.resolve(file))),
  );
  const violations: Violation[] = [];

  for (const file of files) {
    const relativeFile = normalizePath(path.relative(projectRoot, file));
    const sourceLayer = findLayer(relativeFile, config);
    if (!sourceLayer) continue;

    const sourceRule = config.layers[sourceLayer];
    if (!sourceRule) continue;

    const imports = collectImports(await readFile(file, "utf8"), file);
    for (const importValue of imports) {
      if (matchesForbiddenImport(importValue, sourceRule.cannot_import)) {
        violations.push({
          rule: "cannot-import",
          file: relativeFile,
          sourceLayer,
          import: importValue,
          message: `Layer "${sourceLayer}" must not import "${importValue}".`,
        });
        continue;
      }

      const targetFile = resolveProjectImport(importValue, file, projectRoot, knownFiles);
      if (!targetFile) continue;
      const relativeTarget = normalizePath(path.relative(projectRoot, targetFile));
      if (matchesForbiddenImport(relativeTarget, sourceRule.cannot_import)) {
        violations.push({
          rule: "cannot-import",
          file: relativeFile,
          sourceLayer,
          import: importValue,
          message: `Layer "${sourceLayer}" must not import "${relativeTarget}".`,
        });
        continue;
      }

      const targetLayer = findLayer(relativeTarget, config);
      if (!targetLayer || targetLayer === sourceLayer) continue;

      if (sourceRule.cannot_call?.includes(targetLayer)) {
        violations.push({
          rule: "cannot-call",
          file: relativeFile,
          sourceLayer,
          import: importValue,
          targetLayer,
          message: `Layer "${sourceLayer}" must not depend on layer "${targetLayer}".`,
        });
      } else if (
        sourceRule.can_call !== undefined &&
        !sourceRule.can_call.includes(targetLayer)
      ) {
        violations.push({
          rule: "not-allowed-call",
          file: relativeFile,
          sourceLayer,
          import: importValue,
          targetLayer,
          message: `Layer "${sourceLayer}" may only depend on: ${sourceRule.can_call.join(", ") || "no other layers"}.`,
        });
      }
    }
  }

  return { checkedFiles: files.length, violations };
}
