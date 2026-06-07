import type { AgentTarget } from "../config/types.js";

export interface InstructionLayer {
  name: string;
  description: string;
  paths: string[];
  canCall: string[];
  cannotCall: string[];
  cannotImport: string[];
}

export interface InstructionDocument {
  projectName: string;
  pattern: string;
  language: string;
  framework?: string;
  layers: InstructionLayer[];
}

export type AgentFileStatus = "in-sync" | "missing" | "stale";

export interface AgentFileResult {
  target: AgentTarget;
  path: string;
  status: AgentFileStatus;
}

export interface AgentsCheckResult {
  ok: boolean;
  checkedTargets: number;
  results: AgentFileResult[];
}
