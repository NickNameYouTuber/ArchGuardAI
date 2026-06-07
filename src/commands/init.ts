import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";
import { DEFAULT_CONFIG } from "../config/default-config.js";
import { CONFIG_PATH } from "../config/load-config.js";
import { ArchGuardError } from "../errors.js";
import type { Runtime } from "../runtime.js";

export async function initCommand(runtime: Runtime, force: boolean): Promise<void> {
  const configPath = path.join(runtime.cwd, CONFIG_PATH);
  await mkdir(path.dirname(configPath), { recursive: true });

  try {
    await writeFile(configPath, stringify(DEFAULT_CONFIG), {
      encoding: "utf8",
      flag: force ? "w" : "wx",
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new ArchGuardError(
        `${CONFIG_PATH} already exists. Use --force to replace it.`,
      );
    }
    throw error;
  }

  runtime.stdout.write(`Created ${CONFIG_PATH}\n`);
}
