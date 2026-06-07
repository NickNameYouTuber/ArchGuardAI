import { Command, CommanderError, InvalidArgumentError } from "commander";
import { generateAgentsCommand } from "./commands/agents.js";
import { checkCommand, type OutputFormat } from "./commands/check.js";
import { initCommand } from "./commands/init.js";
import { ArchGuardError } from "./errors.js";
import type { Runtime } from "./runtime.js";
import { VERSION } from "./version.js";

function parseFormat(value: string): OutputFormat {
  if (value !== "human" && value !== "json") {
    throw new InvalidArgumentError('Allowed formats are "human" and "json".');
  }
  return value;
}

export function createProgram(runtime: Runtime): Command {
  const program = new Command();
  program
    .name("archguard")
    .description("Architecture contracts and dependency checks for human and AI contributors.")
    .version(VERSION)
    .exitOverride()
    .configureOutput({
      writeOut: (value) => runtime.stdout.write(value),
      writeErr: (value) => runtime.stderr.write(value),
    });

  program
    .command("init")
    .description("Create a starter .archguard/architecture.yaml contract.")
    .option("-f, --force", "replace an existing contract")
    .action(async (options: { force?: boolean }) => {
      await initCommand(runtime, options.force ?? false);
    });

  const agents = program.command("agents").description("Manage AI coding agent instructions.");
  agents
    .command("generate")
    .description("Generate the ArchGuard-managed section in AGENTS.md.")
    .action(async () => {
      await generateAgentsCommand(runtime);
    });

  program
    .command("check")
    .description("Check TypeScript imports against the architecture contract.")
    .argument("[path]", "directory to scan", ".")
    .option("--format <format>", "output format: human or json", parseFormat, "human")
    .action(async (scanPath: string, options: { format: OutputFormat }) => {
      await checkCommand(runtime, scanPath, options.format);
    });

  return program;
}

export async function runProgram(args: string[], runtime: Runtime): Promise<number> {
  try {
    await createProgram(runtime).parseAsync(args, { from: "user" });
    return 0;
  } catch (error) {
    if (error instanceof ArchGuardError) {
      if (error.message) runtime.stderr.write(`Error: ${error.message}\n`);
      return error.exitCode;
    }
    if (error instanceof CommanderError) {
      return error.exitCode === 0 ? 0 : 2;
    }

    runtime.stderr.write(`Error: ${(error as Error).message}\n`);
    return 2;
  }
}
