import type { AgentTarget } from "../config/types.js";
import { END_MARKER, START_MARKER } from "./managed-block.js";
import type { InstructionDocument } from "./types.js";

function inlineList(values: string[]): string {
  return values.length > 0
    ? values.map((value) => `\`${value}\``).join(", ")
    : "none";
}

function renderLayers(document: InstructionDocument): string {
  return document.layers
    .map((layer) =>
      [
        `### ${layer.name}`,
        "",
        layer.description,
        "",
        `- Paths: ${layer.paths.join(", ")}`,
        `- May call: ${inlineList(layer.canCall)}`,
        `- Must not call: ${inlineList(layer.cannotCall)}`,
        `- Must not import: ${inlineList(layer.cannotImport)}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function renderArchitectureBlock(
  document: InstructionDocument,
  targetLabel: string,
): string {
  return [
    START_MARKER,
    "## ArchGuard Architecture Contract",
    "",
    `_This section is generated for ${targetLabel} by \`archguard agents generate\`. Edit \`.archguard/architecture.yaml\` instead._`,
    "",
    `Project: **${document.projectName}**`,
    `Pattern: **${document.pattern}**`,
    `Language: **${document.language}**`,
    document.framework ? `Framework: **${document.framework}**` : undefined,
    "",
    "Follow these dependency boundaries when adding or changing code.",
    "",
    renderLayers(document),
    END_MARKER,
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

export function renderTargetBlock(
  target: AgentTarget,
  document: InstructionDocument,
): string {
  const labels: Record<AgentTarget, string> = {
    agents: "Codex-compatible agents",
    cursor: "Cursor",
    claude: "Claude Code",
    copilot: "GitHub Copilot",
  };
  return renderArchitectureBlock(document, labels[target]);
}

export function targetPreamble(target: AgentTarget): string {
  const preambles: Record<AgentTarget, string> = {
    agents: "# Repository Instructions",
    cursor: [
      "---",
      "description: ArchGuard architecture contract",
      "globs:",
      "alwaysApply: true",
      "---",
      "",
      "# Repository Architecture",
    ].join("\n"),
    claude: "# Claude Code Instructions",
    copilot: "# GitHub Copilot Instructions",
  };
  return preambles[target];
}
