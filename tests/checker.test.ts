import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkProject } from "../src/checker/check-project.js";
import { loadConfig } from "../src/config/load-config.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("checkProject", () => {
  it("accepts the good NestJS example", async () => {
    const root = path.join(repositoryRoot, "examples", "nestjs-good");
    const result = await checkProject(root, ".", await loadConfig(root));

    expect(result.checkedFiles).toBe(4);
    expect(result.violations).toEqual([]);
  });

  it("reports the direct controller to repository dependency", async () => {
    const root = path.join(repositoryRoot, "examples", "nestjs-bad");
    const result = await checkProject(root, ".", await loadConfig(root));

    expect(result.violations).toEqual([
      expect.objectContaining({
        rule: "cannot-call",
        file: "src/users/users.controller.ts",
        sourceLayer: "controller",
        targetLayer: "repository",
      }),
    ]);
  });

  it("matches cannot_import against resolved project paths", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "archguard-forbidden-"));
    await mkdir(path.join(root, "src", "domain"), { recursive: true });
    await mkdir(path.join(root, "src", "infrastructure"), { recursive: true });
    await writeFile(
      path.join(root, "src", "domain", "user.ts"),
      'import { Database } from "../infrastructure/database";\nexport { Database };\n',
    );
    await writeFile(
      path.join(root, "src", "infrastructure", "database.ts"),
      "export class Database {}\n",
    );

    const config = {
      version: 1 as const,
      architecture: {
        name: "relative-import",
        pattern: "layered",
        language: "typescript",
      },
      layers: {
        domain: {
          description: "Domain",
          path: "src/domain/**/*.ts",
          cannot_import: ["src/infrastructure/**"],
        },
        infrastructure: {
          description: "Infrastructure",
          path: "src/infrastructure/**/*.ts",
        },
      },
    };

    const result = await checkProject(root, "src/domain", config);
    expect(result.checkedFiles).toBe(1);
    expect(result.violations[0]).toEqual(
      expect.objectContaining({
        rule: "cannot-import",
        import: "../infrastructure/database",
      }),
    );
  });
});
