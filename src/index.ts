export { checkProject } from "./checker/check-project.js";
export type { CheckResult, Diagnostic, Violation } from "./checker/types.js";
export { loadConfig, validateConfig } from "./config/load-config.js";
export type { ArchitectureConfig, LayerRule } from "./config/types.js";
export { renderAgentsBlock, updateManagedBlock } from "./generator/agents.js";
export { createProgram, runProgram } from "./program.js";
