# Roadmap

ArchGuard AI is currently at the first working CLI MVP. Roadmap items are
ordered by the value they add to a usable open-source workflow.

For the detailed product and engineering sequence, see
[docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md).

## MVP: local architecture contract

- [x] npm-ready TypeScript CLI
- [x] `archguard init`
- [x] `archguard agents generate` for `AGENTS.md`
- [x] TypeScript import boundary checker
- [x] Human-readable and JSON reports
- [x] Good and bad NestJS examples
- [x] Automated tests and Node.js CI

## Next: broader agent support

- [x] Repository self-check and CLI hardening
- [x] Cursor rules generator
- [x] Claude Code instructions generator
- [x] GitHub Copilot instructions generator
- [x] Generated-file drift check
- [ ] Public npm release

## CI and pull request governance

- [ ] Reusable GitHub Action
- [ ] Pull request report and inline evidence
- [ ] Configurable blocking, warning, and informational severities
- [ ] Changed-files mode for faster pull request checks

## Semantic architecture review

- [ ] Evidence-pack builder for diffs, contracts, docs, and dependency graphs
- [ ] AI review for responsibility and feature-flow violations
- [ ] Structured findings with evidence and confidence
- [ ] Refactor plan suggestions

## Architecture lifecycle

- [ ] ADR update detector
- [ ] Architecture drift reports
- [ ] Feature structure and required-document checks
- [ ] Baseline and incremental adoption mode
- [ ] Deeper TypeScript and monorepo analysis
- [ ] Additional languages and frameworks

Roadmap items should be discussed in a GitHub issue before large
implementations begin.
