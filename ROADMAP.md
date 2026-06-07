# Roadmap

ArchGuard AI is currently at the first working CLI MVP. Roadmap items are
ordered by the value they add to a usable open-source workflow.

## MVP: local architecture contract

- [x] npm-ready TypeScript CLI
- [x] `archguard init`
- [x] `archguard agents generate` for `AGENTS.md`
- [x] TypeScript import boundary checker
- [x] Human-readable and JSON reports
- [x] Good and bad NestJS examples
- [x] Automated tests and Node.js CI

## Next: broader agent support

- [ ] Cursor rules generator
- [ ] Claude Code instructions generator
- [ ] GitHub Copilot instructions generator
- [ ] Generated-file drift check

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
- [ ] Additional languages and frameworks

Roadmap items should be discussed in a GitHub issue before large
implementations begin.
