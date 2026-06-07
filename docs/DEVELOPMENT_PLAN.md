# ArchGuard AI Development Plan

This document describes how ArchGuard AI will evolve from its current CLI MVP
into a complete architecture governance system for human contributors and AI
coding agents.

It is intentionally more detailed than [ROADMAP.md](../ROADMAP.md). The roadmap
shows the major destinations; this plan explains the order of work, expected
capabilities, technical foundations, and completion criteria for each stage.

The plan is directional rather than calendar-based. Release numbers may change
as the project receives real-world feedback, but stages should generally be
completed in the order shown below.

## Progress overview

Legend:

- `[x]` completed
- `[ ]` planned or in progress

Release and stage progress:

- [x] Stage 1 core: local CLI MVP
- [x] Stage 1 hardening: self-check, diagnostics, and documentation
- [ ] Stage 2: multi-agent instruction generation
- [ ] Stage 3: public npm package and release workflow
- [ ] Stage 4: reusable GitHub Action
- [ ] Stage 5: pull request governance
- [ ] Stage 6: semantic AI architecture review
- [ ] Stage 7: architecture lifecycle management
- [ ] Stage 8: deeper static analysis
- [ ] Stage 9: framework and language expansion
- [ ] Stage 10: stable `1.0`

## Product vision

ArchGuard AI should provide one architecture contract that can be used
throughout the software delivery lifecycle:

1. Teams describe architecture, module boundaries, flows, and engineering rules.
2. ArchGuard turns that contract into instructions for coding agents.
3. Deterministic checks catch structural violations locally and in CI.
4. Semantic AI review evaluates rules that static analysis cannot express well.
5. Pull request governance provides evidence, remediation guidance, and drift
   visibility to maintainers.
6. Architecture decisions and generated instructions remain synchronized as the
   project evolves.

## Development principles

Every stage should follow these principles:

- **Deterministic first.** Use static analysis whenever a rule can be checked
  reliably without an AI model.
- **AI as an optional layer.** Local checks must continue to work without an API
  key, network access, or hosted service.
- **Evidence over opinion.** Every finding should identify the rule, affected
  file, relevant code or dependency, and expected architecture.
- **One source of truth.** Generated instructions and reports must be derived
  from the ArchGuard contract rather than maintained independently.
- **Backward compatibility.** Existing version `1` contracts should continue to
  work unless a documented migration is provided.
- **Safe generation.** Generated output must be deterministic, idempotent, and
  preserve user-owned content.
- **Incremental adoption.** Existing repositories should be able to introduce
  ArchGuard without fixing every historical violation immediately.

## Stage 1: Local CLI MVP

**Status:** Completed in `v0.1.0` source; npm publication is deferred until the
next feature release.

The first stage proves the basic architecture contract workflow.

### Delivered

- [x] TypeScript CLI with Node.js 20+ support.
- [x] `archguard init` starter contract.
- [x] `archguard agents generate` for `AGENTS.md`.
- [x] `archguard check [path]` for TypeScript import boundaries.
- [x] `can_call`, `cannot_call`, and `cannot_import` rules.
- [x] Human-readable and JSON reports.
- [x] Stable exit codes for scripts and CI.
- [x] Good and bad NestJS examples.
- [x] Unit, CLI, integration, and package smoke tests.
- [x] GitHub Actions verification on Node.js 20 and 22.

### Hardening delivered

- [x] Use package metadata as the single source of the CLI version.
- [x] Add the repository's own `.archguard/architecture.yaml` and self-check it in
  CI.
- [x] Improve diagnostics for overlapping layer patterns and unclassified files.
- [x] Document configuration behavior and common troubleshooting cases.

### Completion criteria

- [x] All existing commands remain covered by automated tests.
- [x] The repository passes its own ArchGuard check.
- [x] No public CLI behavior depends on hard-coded release metadata.

## Stage 2: Multi-agent instruction generation

**Target release:** `v0.2.0`

This stage expands ArchGuard from one generated file into a shared instruction
source for the major coding agent environments.

### Capabilities

- [x] Generate `AGENTS.md` for Codex-compatible agents.
- [ ] Generate Cursor project rules under `.cursor/rules/`.
- [ ] Generate `CLAUDE.md` for Claude Code.
- [ ] Generate `.github/copilot-instructions.md` for GitHub Copilot.
- [ ] Select one target or generate every configured target.
- [ ] Detect missing, stale, or manually modified generated content without
  rewriting it.

### CLI evolution

```bash
archguard agents generate
archguard agents generate --target cursor
archguard agents generate --all
archguard agents check
archguard agents check --format json
```

`agents check` will use the standard exit code contract:

- `0`: generated files match the architecture contract.
- `1`: one or more files are missing or out of date.
- `2`: configuration or runtime error.

### Configuration evolution

Add an optional, backward-compatible agent section:

```yaml
agents:
  targets:
    - agents
    - cursor
    - claude
    - copilot
```

Contracts without this section will retain the current behavior and generate
only `AGENTS.md`.

### Technical work

- [ ] Introduce a shared intermediate instruction model.
- [ ] Implement one renderer per target format.
- [ ] Generalize managed-content handling while respecting each target's format.
- [ ] Validate target names and duplicate target declarations.
- [ ] Add golden fixtures for every generated file.
- [ ] Add a complete generation demo.

### Completion criteria

- [ ] Every target is deterministic and idempotent.
- [x] User content outside managed regions is preserved for `AGENTS.md`.
- [ ] User content is preserved for every additional target.
- [x] Damaged managed regions produce a clear error for `AGENTS.md`.
- [ ] Damaged or ambiguous managed regions are handled for every target.
- [ ] Drift detection works locally and in CI.
- [ ] Existing `v0.1` contracts and commands remain compatible.

## Stage 3: Public package and release workflow

**Target release:** Included in `v0.2.0`

Once multi-agent generation is stable, ArchGuard should become installable
without cloning the repository.

### Capabilities and process

- [ ] Publish `archguard-ai` to npm.
- [ ] Support local development installation with:

  ```bash
  npm install --save-dev archguard-ai
  npx archguard init
  ```

- [ ] Add `CHANGELOG.md` and release notes.
- [ ] Create signed or documented git tags and GitHub Releases.
- [ ] Add a release workflow with npm provenance when repository and npm
  permissions are configured.
- [x] Verify the packed CLI in a clean temporary project.
- [ ] Verify the published CLI in a clean temporary project.

### Completion criteria

- [ ] `npm install archguard-ai` installs a working `archguard` binary.
- [x] Packed package contents are limited to runtime files and public documentation.
- [ ] The published version matches CLI output, git tag, and release notes.
- [ ] Installation and upgrade instructions are documented.

## Stage 4: Reusable GitHub Action

**Target release:** `v0.3.0`

This stage makes deterministic architecture checks easy to adopt in pull
requests without copying project-specific scripts.

### Capabilities

- [ ] Reusable action for `archguard check`.
- [ ] Configurable project directory, scan path, and report format.
- [ ] JSON report artifact.
- [ ] GitHub Job Summary with a concise architecture result.
- [ ] Monorepo support through repeated action invocations.
- [ ] Optional generated-file drift check.
- [ ] Clear behavior for warnings, violations, and runtime errors.

### Technical work

- [ ] Package the action runtime so consumers do not install repository
  dependencies manually.
- [ ] Test the action in clean and violating fixture repositories.
- [x] Pin external actions and runtime dependencies in the project's own CI.
- [ ] Document minimal, monorepo, and pull request examples.

### Completion criteria

- [ ] A consumer can add ArchGuard to CI with one documented workflow step.
- [ ] Clean projects pass and violating projects fail predictably.
- [ ] Reports remain available after a failed job.
- [ ] The action does not require an AI provider or API key.

## Stage 5: Pull request governance

**Target release:** `v0.4.0`

This stage turns raw check results into maintainer-friendly pull request
feedback.

### Capabilities

- [ ] Publish one stable pull request summary comment.
- [ ] Update the existing comment instead of creating duplicates.
- [ ] Group findings by blocking, warning, and informational severity.
- [ ] Include rule, file, dependency or evidence, explanation, and suggested next
  step.
- [ ] Support changed-files mode for faster and more relevant checks.
- [ ] Handle fork pull requests and restricted token permissions gracefully.
- [ ] Provide render-only mode for local testing.

### Configuration evolution

- Add optional rule severity and reporting behavior.
- Allow repositories to decide which severities fail CI.
- Keep the default compatible with current behavior: deterministic violations
  are blocking.

### Completion criteria

- [ ] Re-running CI updates the same pull request report.
- [ ] Comment rendering is covered by fixtures and snapshots.
- [ ] Missing write permissions degrade to Job Summary output rather than losing
  the report.
- [ ] Results link back to the architecture rule that produced them.

## Stage 6: Semantic AI architecture review

**Target release:** Experimental `v0.5.0`

This stage adds review for architecture concerns that cannot be expressed as
reliable import or file-pattern rules.

### Initial semantic rules

- [ ] Business logic placed in controllers or transport adapters.
- [ ] Use cases handling multiple unrelated business intents.
- [ ] Side effects occurring before validation or authorization.
- [ ] Domain decisions leaking into infrastructure code.
- [ ] New functionality placed in an inconsistent module.
- [ ] Architectural changes that may require documentation or an ADR.

### Review workflow

1. Collect the changed files and deterministic findings.
2. Resolve relevant architecture rules and project documentation.
3. Build a bounded evidence pack.
4. Send the evidence pack through a provider-neutral review interface.
5. Validate the structured response.
6. Report only findings with concrete repository evidence.

### Public interface

```bash
archguard review
archguard review --base origin/master
archguard review --format json
```

The static `archguard check` command will remain unchanged and fully offline.

### Provider architecture

- [ ] Define a provider-neutral `ReviewProvider` interface.
- [ ] Implement OpenAI as the first provider adapter.
- [ ] Read credentials only from environment variables or explicit secret
  integrations.
- [ ] Never write credentials or raw secrets into reports.
- [ ] Keep model selection and provider-specific options outside the core evidence
  and finding models.

### Finding model

Each finding should contain:

- [ ] stable rule identifier
- [ ] severity
- [ ] affected file and line evidence
- [ ] explanation
- [ ] confidence
- [ ] expected architecture behavior
- [ ] suggested remediation

### Completion criteria

- [ ] Model responses are schema-validated.
- [ ] Fixture and evaluation tests run without live API calls.
- [ ] Token and file limits are enforced before provider invocation.
- [ ] Findings without concrete evidence are rejected or clearly marked.
- [ ] Provider failure never prevents deterministic checks from completing.

## Stage 7: Architecture lifecycle management

**Target release:** `v0.6.0`

This stage helps teams keep architecture contracts, decisions, documentation,
and code synchronized over time.

### Capabilities

- [ ] Detect dependency or contract changes that require an ADR.
- [ ] Check required architecture and feature documentation.
- [ ] Produce repository-wide architecture drift reports.
- [ ] Report unclassified files and rules that match no files.
- [ ] Compare current results with an explicit baseline.
- [ ] Prevent baselines from hiding newly introduced violations.
- [ ] Suggest contract updates when the implementation intentionally changes.

### Incremental adoption

- [ ] Generate an initial baseline for an existing repository.
- [ ] Fail only on new violations when baseline mode is enabled.
- [ ] Provide progress metrics for reducing historical drift.
- [ ] Make suppression explicit, documented, and reviewable.

### Completion criteria

- [ ] ADR and documentation requirements are configurable.
- [ ] Drift reports are available in human and JSON formats.
- [ ] Baseline creation and comparison are deterministic.
- [ ] Teams can distinguish accepted legacy debt from new regressions.

## Stage 8: Deeper static analysis

**Target release:** `v0.7.0`

The first checker focuses on imports. This stage expands deterministic analysis
before adding more AI-dependent behavior.

### Capabilities

- [ ] Feature and module structure rules.
- [ ] Required file and test patterns.
- [ ] Naming conventions.
- [ ] Circular dependency detection.
- [ ] Public API and module boundary checks.
- [ ] Endpoint, job, event, and side-effect inventory.
- [ ] TypeScript path alias and workspace-aware resolution.
- [ ] First-class monorepo package boundaries.

### Completion criteria

- [ ] Rules expose stable identifiers and structured evidence.
- [ ] Large repositories can limit analysis to affected packages or files.
- [ ] Performance benchmarks protect common CI use cases.
- [ ] New checks remain independently configurable.

## Stage 9: Framework and language expansion

**Target releases:** `v0.8.x` and later

Expansion should be driven by adopter demand and contributor ownership rather
than adding shallow support for many ecosystems.

### TypeScript ecosystem

- [ ] Express and Fastify.
- [ ] Next.js application and route boundaries.
- [ ] React frontend feature boundaries.
- [ ] Workspace support for npm, pnpm, and Yarn monorepos.

### Additional languages

Candidate ecosystems include Python, Java, C#, and Go. Each language requires:

- a reliable parser or compiler API
- import or dependency resolution
- representative example projects
- dedicated maintainers or contributors
- compatibility and performance tests

### Completion criteria

- [ ] A language or framework is documented as supported only when it has real
  parsing, fixtures, examples, and CI coverage.
- [ ] Shared reporting and contract concepts remain consistent across adapters.

## Stage 10: Stable `1.0`

`1.0` means the core architecture contract and deterministic workflow are
stable enough for production adoption.

### Required before `1.0`

- [ ] Stable configuration schema with documented migration policy.
- [ ] Stable CLI commands, exit codes, and JSON report schemas.
- [ ] npm distribution and automated release process.
- [ ] Multi-agent generation and drift detection.
- [ ] Reusable GitHub Action and pull request reporting.
- [ ] Incremental adoption and baseline support.
- [ ] Security policy and responsible disclosure process.
- [ ] Maintainer documentation and release process.
- [ ] At least two real external adopter case studies or equivalent production
  validation.

Semantic AI review may remain marked experimental at `1.0` if its provider or
evaluation contracts are still evolving.

## Continuous work across all stages

Some work does not belong to one release and should continue throughout the
project.

### Quality and security

- Maintain unit, integration, end-to-end, and package smoke tests.
- Keep dependencies updated and review supply-chain risk.
- Add a security policy before accepting external production use.
- Avoid uploading files not required for semantic review.
- Redact secrets and sensitive values from evidence and logs.

### Documentation and examples

- Keep README behavior aligned with released capabilities.
- Add one focused example for every major feature.
- Document configuration errors and migration steps.
- Maintain a short quick start and separate in-depth guides.

### Open-source project health

- Convert roadmap work into focused GitHub issues.
- Label issues by area, release, difficulty, and contribution readiness.
- Add pull request templates and contributor-facing architecture notes.
- Publish release notes and maintain a changelog.
- Track real adopter feedback before finalizing broad abstractions.

### Product validation

- Test ArchGuard against real TypeScript repositories.
- Measure false positives, false negatives, CI runtime, and report usefulness.
- Prefer improvements that reduce maintainer review effort.
- Revisit priorities when real usage contradicts this plan.

## Release gates

Every feature release should meet the following minimum bar:

- [ ] Typecheck, lint, tests, build, and package smoke tests pass.
- [ ] New public behavior has CLI and end-to-end coverage.
- [ ] Generated files have golden and idempotency tests.
- [ ] README, roadmap, and this development plan reflect the release.
- [ ] Breaking changes include migration guidance.
- [ ] The release is tested in a clean consumer project.
- [ ] GitHub issues completed by the release are closed with links to the
  implementation.

## Current priority order

The next development work should follow this sequence:

1. Harden and self-host the existing CLI.
2. Implement multi-agent generation and drift detection.
3. Publish `v0.2.0` to npm.
4. Build the reusable GitHub Action.
5. Add pull request governance.
6. Introduce experimental semantic AI review.
7. Add lifecycle, baseline, and deeper static-analysis capabilities.
8. Expand to other frameworks and languages based on real demand.
