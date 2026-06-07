export {
  END_MARKER,
  START_MARKER,
  managedBlockIsCurrent,
  normalizeLineEndings,
  updateManagedBlock,
  validateManagedBlock,
} from "./managed-block.js";
export { createInstructionDocument } from "./document.js";
export { renderTargetBlock, targetPreamble } from "./renderers.js";
export { selectAgentTargets } from "./selection.js";
export type {
  AgentFileResult,
  AgentFileStatus,
  AgentsCheckResult,
  InstructionDocument,
  InstructionLayer,
} from "./types.js";

import type { ArchitectureConfig } from "../config/types.js";
import { createInstructionDocument } from "./document.js";
import { renderTargetBlock } from "./renderers.js";

export function renderAgentsBlock(config: ArchitectureConfig): string {
  return renderTargetBlock("agents", createInstructionDocument(config));
}
