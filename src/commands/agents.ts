import { loadConfig } from "../config/load-config.js";
import { ArchGuardError } from "../errors.js";
import { createInstructionDocument } from "../generator/document.js";
import {
  checkTargetFile,
  generateTargetFile,
} from "../generator/files.js";
import {
  selectAgentTargets,
  type AgentSelectionOptions,
} from "../generator/selection.js";
import type {
  AgentFileResult,
  AgentsCheckResult,
} from "../generator/types.js";
import type { Runtime } from "../runtime.js";
import type { OutputFormat } from "./check.js";

function renderHumanCheckResult(result: AgentsCheckResult): string {
  if (result.ok) {
    return `Agent instructions are in sync for ${result.checkedTargets} target(s).\n`;
  }

  const details = result.results
    .filter((item) => item.status !== "in-sync")
    .map(
      (item, index) =>
        `${index + 1}. [${item.status}] ${item.target}: ${item.path}`,
    )
    .join("\n");
  return [
    "Agent instructions are out of sync.",
    "",
    details,
    "",
    `Checked ${result.checkedTargets} target(s).`,
    "",
  ].join("\n");
}

function renderJsonCheckResult(result: AgentsCheckResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

function createCheckResult(results: AgentFileResult[]): AgentsCheckResult {
  return {
    ok: results.every((result) => result.status === "in-sync"),
    checkedTargets: results.length,
    results,
  };
}

export async function generateAgentsCommand(
  runtime: Runtime,
  options: AgentSelectionOptions = {},
): Promise<void> {
  const config = await loadConfig(runtime.cwd);
  const targets = selectAgentTargets(config, options);
  const document = createInstructionDocument(config);

  try {
    for (const target of targets) {
      const result = await generateTargetFile(runtime.cwd, target, document);
      runtime.stdout.write(
        `${result.changed ? "Generated" : "Unchanged"} ${result.path}\n`,
      );
    }
  } catch (error) {
    throw new ArchGuardError((error as Error).message);
  }
}

export async function checkAgentsCommand(
  runtime: Runtime,
  options: AgentSelectionOptions & { format: OutputFormat },
): Promise<void> {
  const config = await loadConfig(runtime.cwd);
  const targets = selectAgentTargets(config, options);
  const document = createInstructionDocument(config);
  let results: AgentFileResult[];

  try {
    results = await Promise.all(
      targets.map((target) => checkTargetFile(runtime.cwd, target, document)),
    );
  } catch (error) {
    throw new ArchGuardError((error as Error).message);
  }

  const result = createCheckResult(results);
  runtime.stdout.write(
    options.format === "json"
      ? renderJsonCheckResult(result)
      : renderHumanCheckResult(result),
  );

  if (!result.ok) {
    throw new ArchGuardError("", 1);
  }
}
