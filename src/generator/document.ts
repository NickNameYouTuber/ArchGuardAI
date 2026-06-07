import type { ArchitectureConfig } from "../config/types.js";
import type { InstructionDocument } from "./types.js";

export function createInstructionDocument(
  config: ArchitectureConfig,
): InstructionDocument {
  return {
    projectName: config.architecture.name,
    pattern: config.architecture.pattern,
    language: config.architecture.language,
    ...(config.architecture.framework
      ? { framework: config.architecture.framework }
      : {}),
    layers: Object.entries(config.layers).map(([name, rule]) => ({
      name,
      description: rule.description,
      paths: Array.isArray(rule.path) ? rule.path : [rule.path],
      canCall: rule.can_call ?? [],
      cannotCall: rule.cannot_call ?? [],
      cannotImport: rule.cannot_import ?? [],
    })),
  };
}
