# ArchGuard Configuration Guide

ArchGuard reads its project contract from:

```text
.archguard/architecture.yaml
```

Run `archguard init` to create a starter contract, then adapt its layer names,
paths, and dependency rules to the project.

## Contract structure

```yaml
version: 1
architecture:
  name: example-project
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

  use_case:
    description: Application actions.
    path: src/**/*.use-case.ts
    can_call:
      - domain
      - repository_port

  domain:
    description: Pure business rules.
    path: src/domain/**/*.ts
    cannot_import:
      - "@nestjs/*"
      - typeorm
      - src/infrastructure/**
```

## Required fields

### `version`

The current contract version is `1`. Other values are rejected.

### `architecture`

- `name`: project name used in generated instructions.
- `pattern`: human-readable architecture pattern.
- `language`: project language. The current checker supports TypeScript.
- `framework`: optional framework name.

### `layers`

Each layer requires:

- `description`: purpose and responsibility of the layer.
- `path`: one glob or an array of globs relative to the project root.

Layer names are identifiers referenced by `can_call` and `cannot_call`.
References to unknown layers are rejected while loading the contract.

## Dependency rules

### `can_call`

An allowlist of other configured layers that files in this layer may import.
When present, dependencies on any other classified layer are violations.

Imports within the same layer are allowed.

### `cannot_call`

An explicit denylist of configured layers. When both rules are present, an
explicit `cannot_call` match is reported as `cannot-call`. Other dependencies
outside `can_call` are reported as `not-allowed-call`.

### `cannot_import`

Forbidden external packages, import patterns, or project paths:

```yaml
cannot_import:
  - "@nestjs/*"
  - typeorm
  - src/infrastructure/**
```

ArchGuard checks both the written import specifier and the resolved path of
relative or `src/...` TypeScript imports.

## Layer classification diagnostics

Every scanned TypeScript file is compared with every configured layer path.

### Unclassified files

Files that match no layer produce an `unclassified-file` warning. The command
still exits with `0` when warnings are the only findings. This allows projects
to adopt ArchGuard incrementally.

### Overlapping layers

Files that match more than one layer produce an `overlapping-layers` error and
the command exits with `1`. ArchGuard does not silently select the first layer
because that could apply the wrong dependency rules.

Make layer globs mutually exclusive. Prefer explicit suffixes or directories:

```yaml
layers:
  controller:
    path: src/**/*.controller.ts
  use_case:
    path: src/**/*.use-case.ts
```

Avoid combinations such as `src/**/*.ts` and `src/domain/**/*.ts`.

## Paths and import resolution

- Layer globs use forward slashes and are relative to the project root.
- Windows paths are normalized automatically.
- The checker scans `.ts` and `.tsx` files.
- Declaration files, `node_modules`, and `dist` are ignored.
- Relative imports and imports beginning with `src/` are resolved.
- TypeScript `paths` aliases and workspace package resolution are not yet
  supported.

## Output and exit codes

```bash
archguard check
archguard check src
archguard check --format json
```

| Code | Meaning |
| --- | --- |
| `0` | No violations or error diagnostics. Warnings may exist. |
| `1` | Dependency violations or error diagnostics were found. |
| `2` | Configuration, command, or runtime failure. |

JSON output contains `ok`, `checkedFiles`, `violations`, and `diagnostics`.

## Troubleshooting

### Configuration not found

Run `archguard init` in the project root or execute ArchGuard with the project
root as the current working directory.

### Unknown layer reference

Every name in `can_call` and `cannot_call` must exist under `layers`.

### A dependency was not detected

Confirm that:

- both files use `.ts` or `.tsx`
- both files are inside the project root
- both files match exactly one configured layer
- the import is relative or starts with `src/`

Package aliases and TypeScript `paths` mappings are planned for deeper static
analysis.

### Too many unclassified warnings

Run the check on a narrower path while introducing the contract:

```bash
archguard check src/features
```

Then expand layer globs and the checked path as coverage improves.

### Existing configuration should not be overwritten

`archguard init` refuses to replace `.archguard/architecture.yaml`. Use
`archguard init --force` only when intentionally replacing it with the starter
contract.
