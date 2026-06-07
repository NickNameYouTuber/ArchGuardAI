# Contributing to ArchGuard AI

Thank you for helping make architecture rules more useful to human and AI
contributors.

## Development setup

Requirements:

- Node.js 20 or 22
- npm

```bash
git clone https://github.com/NickNameYouTuber/ArchGuardAI.git
cd ArchGuardAI
npm install
npm run check
npm run build
```

## Making changes

1. Open or choose a focused GitHub issue.
2. Create a branch from `master`.
3. Keep behavior and configuration changes backward compatible where possible.
4. Add tests for new behavior and failure cases.
5. Run `npm run check` and `npm run build`.
6. Update README or roadmap documentation when public behavior changes.

## Architecture contracts

The current configuration version is `1`. Changes to its schema must include:

- validation updates
- unit tests
- a documented migration path if existing contracts would break

Generated files must be deterministic and idempotent.

## Pull requests

Keep pull requests small enough to review. Describe the user-facing behavior,
tests performed, and any roadmap issue that the change addresses.

By contributing, you agree that your contributions are licensed under the MIT
License.
