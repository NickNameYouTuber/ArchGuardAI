# ArchGuard AI

**ArchGuard AI** is an open-source architecture governance system for modern software teams and AI coding agents.

It turns a project’s architecture, coding conventions, feature flows, documentation requirements, and semantic engineering rules into a single source of truth. From that contract, ArchGuard generates instructions for AI coding tools such as Cursor, Codex, Claude Code, GitHub Copilot, and other agent-based development workflows. It also reviews pull requests to ensure that new code follows the project’s architecture.

## Why ArchGuard AI exists

Modern codebases are increasingly written by a mix of humans, contributors, contractors, and AI agents. Even when a team agrees on an architecture, those rules often live in outdated documentation, tribal knowledge, or scattered prompts.

Over time, this causes architecture drift:

* controllers start containing business logic
* repositories are called from the wrong layer
* domain code depends on frameworks
* new features use inconsistent folder structures
* documentation and ADRs are not updated
* AI agents generate code that works, but does not fit the project

ArchGuard AI helps prevent this by making architecture executable, reviewable, and usable by both humans and AI tools.

## What ArchGuard AI does

ArchGuard AI provides four main capabilities:

1. **Architecture Contract**

   Defines the architecture of a project in a machine-readable format.

   Examples:

   * layers
   * allowed and forbidden dependencies
   * feature structure
   * naming conventions
   * required documentation
   * testing expectations
   * flow rules
   * semantic architecture rules

2. **AI Agent Skills Generator**

   Generates project-specific instructions and skills for AI coding tools.

   Supported targets planned:

   * Cursor rules
   * AGENTS.md for Codex-compatible agents
   * CLAUDE.md for Claude Code
   * GitHub Copilot custom instructions
   * reusable AI coding skills for common project tasks

3. **AI Architecture Linter**

   Reviews code not only with static rules, but also with semantic AI-based checks.

   It can detect problems such as:

   * business logic inside controllers
   * unclear responsibility boundaries
   * incorrect feature flow
   * side effects before validation or authorization
   * code that technically compiles but violates the intended architecture
   * missing documentation for architectural changes
   * new dependencies that should require an ADR

4. **Pull Request Governance Bot**

   Runs in CI and comments on pull requests with an architecture report.

   Example output:

   ```text
   ArchGuard AI Report

   Score: 72/100

   Blocking issues:
   - Controller contains business logic
   - New endpoint is missing API documentation
   - Payment module introduces a dependency on user infrastructure

   Warnings:
   - Use case handles multiple business intents
   - Agent instructions are out of sync with architecture.yaml

   Suggested fix:
   Move invite logic into InviteUserUseCase and keep the controller responsible only for request/response mapping.
   ```

## Example architecture contract

```yaml
architecture:
  pattern: clean-architecture-lite
  language: typescript
  framework: nestjs

layers:
  controller:
    description: "HTTP layer. No business logic."
    path: "src/**/*.controller.ts"
    can_call:
      - use_case
    cannot_call:
      - repository
      - database
      - external_api

  use_case:
    description: "Application logic layer."
    path: "src/**/*.use-case.ts"
    can_call:
      - domain
      - repository_port
      - service_port

  domain:
    description: "Pure business rules."
    path: "src/domain/**"
    cannot_import:
      - "@nestjs/*"
      - "typeorm"
      - "axios"
      - "src/infrastructure/**"
```

## Example semantic rule

```yaml
semantic_rules:
  - id: no-business-logic-in-controller
    severity: error
    description: >
      Controllers should only parse input, call a use case, and map the result
      to an HTTP response. They must not contain business decisions, transaction
      orchestration, repository calls, or external side effects.

  - id: side-effects-after-validation
    severity: error
    description: >
      External side effects such as emails, payments, webhooks, and events
      should happen only after input validation and authorization.
```

## Example workflow

```bash
archguard init
archguard agents generate
archguard check
```

Generated files may include:

```text
.archguard/
  architecture.yaml
  semantic-rules.yaml
  flows.yaml
  docs-policy.yaml

.cursor/rules/
AGENTS.md
CLAUDE.md
.github/copilot-instructions.md

docs/
  architecture/
  adr/
  templates/
```

## How it helps AI coding agents

ArchGuard AI does not replace Cursor, Codex, Claude Code, or Copilot. Instead, it gives them better project-specific context.

Before code is written, ArchGuard generates instructions that teach AI agents:

* where to place new code
* which architecture pattern the project uses
* which layers may depend on each other
* what a correct feature flow looks like
* which files and docs must be created
* which anti-patterns are forbidden
* what examples of good and bad code look like

After code is written, ArchGuard checks whether the AI or human developer followed those rules.

## Roadmap

* [ ] TypeScript import boundary checker
* [ ] Feature structure checker
* [ ] GitHub Action integration
* [ ] Cursor rules generator
* [ ] AGENTS.md generator
* [ ] CLAUDE.md generator
* [ ] GitHub Copilot instructions generator
* [ ] AI semantic architecture review
* [ ] PR comment reporter
* [ ] ADR update detector
* [ ] Architecture drift report
* [ ] Refactor plan generator

## Project status

ArchGuard AI is an early-stage open-source project. The goal is to build a practical architecture governance layer for teams that use both human contributors and AI coding agents.

## Contributing

Contributions are welcome.

Useful areas for contribution:

* architecture rule design
* TypeScript AST parsing
* import graph analysis
* GitHub Actions integration
* AI agent instruction formats
* semantic review prompts
* documentation templates
* examples for real-world project architectures

## License

MIT
