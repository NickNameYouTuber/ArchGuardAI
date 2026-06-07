export { checkProject } from "./checker/check-project.js";
export type { CheckResult, Diagnostic, Violation } from "./checker/types.js";
export { loadConfig, validateConfig } from "./config/load-config.js";
export {
  AGENT_TARGETS,
  type AgentConfig,
  type AgentTarget,
  type ArchitectureConfig,
  type LayerRule,
} from "./config/types.js";
export {
  createInstructionDocument,
  managedBlockIsCurrent,
  renderAgentsBlock,
  renderTargetBlock,
  selectAgentTargets,
  updateManagedBlock,
  validateManagedBlock,
} from "./generator/agents.js";
export type {
  AgentFileResult,
  AgentFileStatus,
  AgentsCheckResult,
  InstructionDocument,
  InstructionLayer,
} from "./generator/agents.js";
export { createProgram, runProgram } from "./program.js";
