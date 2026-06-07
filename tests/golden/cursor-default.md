---
description: ArchGuard architecture contract
globs:
alwaysApply: true
---

# Repository Architecture

<!-- archguard:start -->
## ArchGuard Architecture Contract

_This section is generated for Cursor by `archguard agents generate`. Edit `.archguard/architecture.yaml` instead._

Project: **demo-project**
Pattern: **layered**
Language: **typescript**
Framework: **nodejs**

Follow these dependency boundaries when adding or changing code.

### application

Application layer.

- Paths: src/application/**/*.ts
- May call: none
- Must not call: none
- Must not import: `src/infrastructure/**`
<!-- archguard:end -->
