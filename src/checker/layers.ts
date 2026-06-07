import { minimatch } from "minimatch";
import type { ArchitectureConfig } from "../config/types.js";

export function normalizePath(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

export function findLayers(
  relativeFile: string,
  config: ArchitectureConfig,
): string[] {
  const normalized = normalizePath(relativeFile);

  return Object.entries(config.layers)
    .filter(([, rule]) => {
      const patterns = Array.isArray(rule.path) ? rule.path : [rule.path];
      return patterns.some((pattern) =>
        minimatch(normalized, normalizePath(pattern)),
      );
    })
    .map(([name]) => name);
}

export function findLayer(
  relativeFile: string,
  config: ArchitectureConfig,
): string | undefined {
  return findLayers(relativeFile, config)[0];
}
