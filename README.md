# ArchGuard AI

ArchGuard AI is an early-stage, open-source architecture contract and dependency
checker for software teams that work with both human contributors and AI coding
agents.

It keeps architectural rules in `.archguard/architecture.yaml`, turns those
rules into instructions for coding agents, and checks TypeScript imports against
the declared layer boundaries.

> [!IMPORTANT]
> The current MVP is a local, deterministic TypeScript checker. Semantic AI
> review, pull request comments, and hosted integrations are planned, not yet
> implemented.

## What works today

- `archguard init` creates a starter NestJS clean architecture contract.
- `archguard agents generate` creates or updates an ArchGuard-managed section
  in `AGENTS.md`.
- `archguard check [path]` checks TypeScript imports against `can_call`,
  `cannot_call`, and `cannot_import` rules.
- Human-readable and JSON reports.
- Stable exit codes for CI and scripts.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Install from this repository

```bash
git clone https://github.com/NickNameYouTuber/ArchGuardAI.git
cd ArchGuardAI
npm install
npm run build
npm link
```

The package is npm-ready, but version `0.1.0` has not been published to npm yet.

## Quick start

Run these commands in the TypeScript project that you want to guard:

```bash
archguard init
archguard agents generate
archguard check
```

`archguard init` creates:

```text
.archguard/
  architecture.yaml
```

The generated contract describes layers with glob paths and their allowed or
forbidden dependencies:

```yaml
version: 1
architecture:
  name: my-nestjs-project
  pattern: clean-architecture-lite
  language: typescript
  framework: nestjs

layers:
  controller:
    description: HTTP request and response mapping.
    path: src/**/*.controller.ts
    can_call:
      - use_case
    cannot_call:
      - repository

  domain:
    description: Pure business rules.
    path: src/domain/**/*.ts
    cannot_import:
      - "@nestjs/*"
      - typeorm
      - src/infrastructure/**
```

Use `--force` to replace an existing starter contract:

```bash
archguard init --force
```

See the [configuration guide](docs/CONFIGURATION.md) for the complete contract
reference, layer diagnostics, path behavior, and troubleshooting.

## Generate agent instructions

```bash
archguard agents generate
```

ArchGuard writes a marked section to `AGENTS.md`. Content outside
`<!-- archguard:start -->` and `<!-- archguard:end -->` is preserved. Repeated
runs are idempotent.

The MVP generates only `AGENTS.md`. Cursor, Claude Code, and GitHub Copilot
targets are tracked in the [roadmap](ROADMAP.md).

## Check a project

```bash
archguard check
archguard check src
archguard check --format json
```

Exit codes:

| Code | Meaning |
| --- | --- |
| `0` | No violations or error diagnostics. Warnings may exist. |
| `1` | Violations or error diagnostics were found. |
| `2` | The command, configuration, or runtime failed. |

Example violation:

```text
ArchGuard check failed.

Violations:

1. Layer "controller" must not depend on layer "repository".
   Rule: cannot-call
   File: src/users/users.controller.ts
   Import: ./user.repository

Found 1 violation(s) and 0 diagnostic(s) in 3 TypeScript file(s).
```

## Demo projects

The repository contains two small NestJS-style TypeScript examples:

- [`examples/nestjs-good`](examples/nestjs-good) follows
  `controller -> use_case -> repository_port`.
- [`examples/nestjs-bad`](examples/nestjs-bad) imports a repository directly
  from a controller.

Try both after building:

```bash
cd examples/nestjs-good
node ../../dist/cli.js check

cd ../nestjs-bad
node ../../dist/cli.js check --format json
```

The good example exits with `0`; the bad example exits with `1`.

Files that match no configured layer are reported as non-blocking warnings.
Files that match multiple layers are reported as errors because their
dependency rules would be ambiguous.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
npm run self-check
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and
[ROADMAP.md](ROADMAP.md) for the short roadmap. The full staged product and
engineering plan is in
[docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md).

## Project direction

ArchGuard AI aims to become a shared architecture contract for people and
coding agents:

1. Describe project boundaries once.
2. Generate tool-specific instructions before code is written.
3. Run deterministic checks after code is written.
4. Add evidence-based semantic AI review where static analysis is insufficient.
5. Report architecture drift in pull requests.

The later AI and GitHub governance stages remain future work.

## License

[MIT](LICENSE)
