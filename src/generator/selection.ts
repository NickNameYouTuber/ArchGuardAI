import {
  AGENT_TARGETS,
  type AgentTarget,
  type ArchitectureConfig,
} from "../config/types.js";
import { ArchGuardError } from "../errors.js";

export interface AgentSelectionOptions {
  target?: string;
  all?: boolean;
}

export function parseAgentTarget(value: string): AgentTarget {
  if ((AGENT_TARGETS as readonly string[]).includes(value)) {
    return value as AgentTarget;
  }
  throw new ArchGuardError(
    `Unknown agent target "${value}". Supported targets: ${AGENT_TARGETS.join(", ")}.`,
  );
}

export function selectAgentTargets(
  config: ArchitectureConfig,
  options: AgentSelectionOptions,
): AgentTarget[] {
  if (options.target !== undefined && options.all) {
    throw new ArchGuardError("--target and --all cannot be used together.");
  }
  if (options.target !== undefined) return [parseAgentTarget(options.target)];
  if (options.all) return [...AGENT_TARGETS];
  return config.agents?.targets ?? ["agents"];
}
