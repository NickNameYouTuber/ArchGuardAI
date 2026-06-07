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

export interface ArchitectureConfig {
  version: number;
  architecture: ArchitectureMetadata;
  layers: Record<string, LayerRule>;
}
