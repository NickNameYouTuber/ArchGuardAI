import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { ArchGuardError } from "../errors.js";
import {
  AGENT_TARGETS,
  type AgentTarget,
  type ArchitectureConfig,
  type LayerRule,
} from "./types.js";

export const CONFIG_PATH = path.join(".archguard", "architecture.yaml");

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ArchGuardError(`Invalid configuration: "${field}" must be a non-empty string.`);
  }
}

function assertStringArray(value: unknown, field: string): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new ArchGuardError(`Invalid configuration: "${field}" must be an array of strings.`);
  }
}

function validateLayer(value: unknown, field: string): asserts value is LayerRule {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ArchGuardError(`Invalid configuration: "${field}" must be an object.`);
  }

  const layer = value as Record<string, unknown>;
  assertString(layer.description, `${field}.description`);
  if (typeof layer.path !== "string") {
    assertStringArray(layer.path, `${field}.path`);
    if (layer.path.length === 0) {
      throw new ArchGuardError(`Invalid configuration: "${field}.path" must not be empty.`);
    }
  }
  if (layer.can_call !== undefined) assertStringArray(layer.can_call, `${field}.can_call`);
  if (layer.cannot_call !== undefined) assertStringArray(layer.cannot_call, `${field}.cannot_call`);
  if (layer.cannot_import !== undefined) {
    assertStringArray(layer.cannot_import, `${field}.cannot_import`);
  }
}

function validateAgentTargets(
  value: unknown,
  field: string,
): asserts value is AgentTarget[] {
  assertStringArray(value, field);
  if (value.length === 0) {
    throw new ArchGuardError(`Invalid configuration: "${field}" must not be empty.`);
  }

  const supported = new Set<string>(AGENT_TARGETS);
  const seen = new Set<string>();
  for (const target of value) {
    if (!supported.has(target)) {
      throw new ArchGuardError(
        `Invalid configuration: unknown agent target "${target}". Supported targets: ${AGENT_TARGETS.join(", ")}.`,
      );
    }
    if (seen.has(target)) {
      throw new ArchGuardError(
        `Invalid configuration: duplicate agent target "${target}".`,
      );
    }
    seen.add(target);
  }
}

export function validateConfig(value: unknown): ArchitectureConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ArchGuardError("Invalid configuration: root value must be an object.");
  }

  const config = value as Record<string, unknown>;
  if (config.version !== 1) {
    throw new ArchGuardError('Invalid configuration: "version" must be 1.');
  }
  if (!config.architecture || typeof config.architecture !== "object") {
    throw new ArchGuardError('Invalid configuration: "architecture" must be an object.');
  }

  const architecture = config.architecture as Record<string, unknown>;
  assertString(architecture.name, "architecture.name");
  assertString(architecture.pattern, "architecture.pattern");
  assertString(architecture.language, "architecture.language");
  if (architecture.framework !== undefined) {
    assertString(architecture.framework, "architecture.framework");
  }

  if (config.agents !== undefined) {
    if (
      !config.agents ||
      typeof config.agents !== "object" ||
      Array.isArray(config.agents)
    ) {
      throw new ArchGuardError('Invalid configuration: "agents" must be an object.');
    }
    const agents = config.agents as Record<string, unknown>;
    validateAgentTargets(agents.targets, "agents.targets");
  }

  if (!config.layers || typeof config.layers !== "object" || Array.isArray(config.layers)) {
    throw new ArchGuardError('Invalid configuration: "layers" must be an object.');
  }

  const layers = config.layers as Record<string, unknown>;
  if (Object.keys(layers).length === 0) {
    throw new ArchGuardError('Invalid configuration: "layers" must not be empty.');
  }
  for (const [name, layer] of Object.entries(layers)) {
    validateLayer(layer, `layers.${name}`);
  }
  const layerNames = new Set(Object.keys(layers));
  for (const [name, value] of Object.entries(layers)) {
    const layer = value as LayerRule;
    for (const dependency of [...(layer.can_call ?? []), ...(layer.cannot_call ?? [])]) {
      if (!layerNames.has(dependency)) {
        throw new ArchGuardError(
          `Invalid configuration: layer "${name}" references unknown layer "${dependency}".`,
        );
      }
    }
  }

  return value as ArchitectureConfig;
}

export async function loadConfig(projectRoot: string): Promise<ArchitectureConfig> {
  const configPath = path.join(projectRoot, CONFIG_PATH);
  let source: string;
  try {
    source = await readFile(configPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new ArchGuardError(
        `Configuration not found at ${configPath}. Run "archguard init" first.`,
      );
    }
    throw error;
  }

  try {
    return validateConfig(parse(source));
  } catch (error) {
    if (error instanceof ArchGuardError) throw error;
    throw new ArchGuardError(`Could not parse ${configPath}: ${(error as Error).message}`);
  }
}
