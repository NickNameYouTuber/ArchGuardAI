import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AgentTarget } from "../config/types.js";
import {
  managedBlockIsCurrent,
  normalizeLineEndings,
  updateManagedBlock,
} from "./managed-block.js";
import { renderTargetBlock, targetPreamble } from "./renderers.js";
import { TARGET_DEFINITIONS } from "./targets.js";
import type {
  AgentFileResult,
  InstructionDocument,
} from "./types.js";

async function readOptional(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

export async function generateTargetFile(
  projectRoot: string,
  target: AgentTarget,
  document: InstructionDocument,
): Promise<{ path: string; changed: boolean }> {
  const relativePath = TARGET_DEFINITIONS[target].path;
  const absolutePath = path.join(projectRoot, relativePath);
  const existing = await readOptional(absolutePath);
  const initial = existing ?? `${targetPreamble(target)}\n`;
  const generated = updateManagedBlock(
    initial,
    renderTargetBlock(target, document),
    relativePath,
  );

  if (
    existing !== undefined &&
    generated === normalizeLineEndings(existing)
  ) {
    return { path: relativePath, changed: false };
  }

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, generated, "utf8");
  return { path: relativePath, changed: true };
}

export async function checkTargetFile(
  projectRoot: string,
  target: AgentTarget,
  document: InstructionDocument,
): Promise<AgentFileResult> {
  const relativePath = TARGET_DEFINITIONS[target].path;
  const existing = await readOptional(path.join(projectRoot, relativePath));
  if (existing === undefined) {
    return { target, path: relativePath, status: "missing" };
  }

  return {
    target,
    path: relativePath,
    status: managedBlockIsCurrent(
      existing,
      renderTargetBlock(target, document),
      relativePath,
    )
      ? "in-sync"
      : "stale",
  };
}
