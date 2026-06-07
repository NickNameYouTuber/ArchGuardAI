# GitHub Copilot Instructions

<!-- archguard:start -->
## ArchGuard Architecture Contract

_This section is generated for GitHub Copilot by `archguard agents generate`. Edit `.archguard/architecture.yaml` instead._

Project: **agent-generation-demo**
Pattern: **clean-architecture-lite**
Language: **typescript**
Framework: **nestjs**

Follow these dependency boundaries when adding or changing code.

### controller

HTTP request and response mapping.

- Paths: src/**/*.controller.ts
- May call: `use_case`
- Must not call: `repository`
- Must not import: none

### use_case

Application use cases.

- Paths: src/**/*.use-case.ts
- May call: `domain`, `repository_port`
- Must not call: none
- Must not import: none

### domain

Pure business rules.

- Paths: src/domain/**/*.ts
- May call: none
- Must not call: none
- Must not import: `@nestjs/*`, `typeorm`, `src/infrastructure/**`

### repository_port

Application-owned persistence contracts.

- Paths: src/**/*.repository.port.ts
- May call: none
- Must not call: none
- Must not import: none

### repository

Persistence implementations.

- Paths: src/**/*.repository.ts
- May call: `domain`, `repository_port`
- Must not call: none
- Must not import: none
<!-- archguard:end -->
