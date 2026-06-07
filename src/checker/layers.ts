import { minimatch } from "minimatch";
import type { ArchitectureConfig } from "../config/types.js";

export function normalizePath(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

export function findLayer(
  relativeFile: string,
  config: ArchitectureConfig,
): string | undefined {
  const normalized = normalizePath(relativeFile);

  for (const [name, rule] of Object.entries(config.layers)) {
    const patterns = Array.isArray(rule.path) ? rule.path : [rule.path];
    if (patterns.some((pattern) => minimatch(normalized, normalizePath(pattern)))) {
      return name;
    }
  }

  return undefined;
}
