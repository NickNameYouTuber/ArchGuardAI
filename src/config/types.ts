export interface ArchitectureMetadata {
  name: string;
  pattern: string;
  language: string;
  framework?: string;
}

export interface LayerRule {
  description: string;
  path: string | string[];
  can_call?: string[];
  cannot_call?: string[];
  cannot_import?: string[];
}

export const AGENT_TARGETS = [
  "agents",
  "cursor",
  "claude",
  "copilot",
] as const;

export type AgentTarget = (typeof AGENT_TARGETS)[number];

export interface AgentConfig {
  targets: AgentTarget[];
}

export interface ArchitectureConfig {
  version: number;
  architecture: ArchitectureMetadata;
  layers: Record<string, LayerRule>;
  agents?: AgentConfig;
}
