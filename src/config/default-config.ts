import type { ArchitectureConfig } from "./types.js";

export const DEFAULT_CONFIG: ArchitectureConfig = {
  version: 1,
  architecture: {
    name: "my-nestjs-project",
    pattern: "clean-architecture-lite",
    language: "typescript",
    framework: "nestjs",
  },
  layers: {
    controller: {
      description: "HTTP layer. Parses input, calls use cases, and maps responses.",
      path: "src/**/*.controller.ts",
      can_call: ["use_case"],
      cannot_call: ["repository", "infrastructure"],
    },
    use_case: {
      description: "Application logic. Coordinates domain rules through ports.",
      path: "src/**/*.use-case.ts",
      can_call: ["domain", "repository_port"],
      cannot_call: ["controller", "repository"],
    },
    domain: {
      description: "Pure business rules with no framework dependencies.",
      path: "src/domain/**/*.ts",
      cannot_import: ["@nestjs/*", "typeorm", "axios", "src/infrastructure/**"],
    },
    repository_port: {
      description: "Repository contracts owned by the application layer.",
      path: "src/**/*.repository.port.ts",
      can_call: ["domain"],
    },
    repository: {
      description: "Infrastructure implementations of repository ports.",
      path: "src/**/*.repository.ts",
      can_call: ["domain", "repository_port"],
    },
    infrastructure: {
      description: "Framework, database, and external service adapters.",
      path: "src/infrastructure/**/*.ts",
      can_call: ["domain", "repository_port"],
    },
  },
};
