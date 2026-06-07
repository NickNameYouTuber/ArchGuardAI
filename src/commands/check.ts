import { stat } from "node:fs/promises";
import path from "node:path";
import { checkProject } from "../checker/check-project.js";
import { loadConfig } from "../config/load-config.js";
import { ArchGuardError } from "../errors.js";
import { renderHumanReport, renderJsonReport } from "../reporters.js";
import type { Runtime } from "../runtime.js";

export type OutputFormat = "human" | "json";

export async function checkCommand(
  runtime: Runtime,
  scanPath: string,
  format: OutputFormat,
): Promise<void> {
  const absoluteScanPath = path.resolve(runtime.cwd, scanPath);
  const relativeScanPath = path.relative(runtime.cwd, absoluteScanPath);
  if (relativeScanPath.startsWith("..") || path.isAbsolute(relativeScanPath)) {
    throw new ArchGuardError("The check path must be inside the project.");
  }

  try {
    if (!(await stat(absoluteScanPath)).isDirectory()) {
      throw new ArchGuardError(`Check path is not a directory: ${scanPath}`);
    }
  } catch (error) {
    if (error instanceof ArchGuardError) throw error;
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new ArchGuardError(`Check path does not exist: ${scanPath}`);
    }
    throw error;
  }

  const config = await loadConfig(runtime.cwd);
  const result = await checkProject(runtime.cwd, scanPath, config);
  runtime.stdout.write(format === "json" ? renderJsonReport(result) : renderHumanReport(result));

  if (result.violations.length > 0) {
    throw new ArchGuardError("", 1);
  }
}
