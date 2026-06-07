# Multi-agent generation example

This example generates architecture instructions for Codex-compatible agents,
Cursor, Claude Code, and GitHub Copilot from one contract.

Build ArchGuard from the repository root, then run:

```bash
cd examples/agent-generation
node ../../dist/cli.js agents generate
node ../../dist/cli.js agents check
```

Generated files:

```text
AGENTS.md
CLAUDE.md
.cursor/rules/archguard-architecture.mdc
.github/copilot-instructions.md
```

To see drift detection, change text inside an ArchGuard managed block:

```bash
node ../../dist/cli.js agents check --format json
```

The check returns exit code `1` and reports the changed target as `stale`.
Content outside the managed markers is ignored by drift detection and preserved
by subsequent generation.
