import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadConfig } from "../config/load-config.js";
import { ArchGuardError } from "../errors.js";
import { renderAgentsBlock, updateManagedBlock } from "../generator/agents.js";
import type { Runtime } from "../runtime.js";

export async function generateAgentsCommand(runtime: Runtime): Promise<void> {
  const config = await loadConfig(runtime.cwd);
  const agentsPath = path.join(runtime.cwd, "AGENTS.md");
  let existing = "";

  try {
    existing = await readFile(agentsPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  let generated: string;
  try {
    generated = updateManagedBlock(existing, renderAgentsBlock(config));
  } catch (error) {
    throw new ArchGuardError((error as Error).message);
  }

  await writeFile(agentsPath, generated, "utf8");
  runtime.stdout.write("Generated AGENTS.md\n");
}
