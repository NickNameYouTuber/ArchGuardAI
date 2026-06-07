import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

interface PackageMetadata {
  version?: unknown;
}

function loadVersion(): string {
  const packagePath = fileURLToPath(new URL("../package.json", import.meta.url));
  const metadata = JSON.parse(readFileSync(packagePath, "utf8")) as PackageMetadata;

  if (typeof metadata.version !== "string" || metadata.version.trim() === "") {
    throw new Error('package.json must contain a non-empty "version" string.');
  }

  return metadata.version;
}

export const VERSION = loadVersion();
