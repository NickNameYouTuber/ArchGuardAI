import type { AgentTarget } from "../config/types.js";

export interface AgentTargetDefinition {
  target: AgentTarget;
  path: string;
}

export const TARGET_DEFINITIONS: Record<AgentTarget, AgentTargetDefinition> = {
  agents: {
    target: "agents",
    path: "AGENTS.md",
  },
  cursor: {
    target: "cursor",
    path: ".cursor/rules/archguard-architecture.mdc",
  },
  claude: {
    target: "claude",
    path: "CLAUDE.md",
  },
  copilot: {
    target: "copilot",
    path: ".github/copilot-instructions.md",
  },
};
