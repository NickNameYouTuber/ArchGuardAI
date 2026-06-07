import path from "node:path";
import ts from "typescript";
import { normalizePath } from "./layers.js";

export function collectImports(source: string, fileName: string): string[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const imports: string[] = [];

  for (const statement of sourceFile.statements) {
    if (
      (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      imports.push(statement.moduleSpecifier.text);
    }
  }

  return imports;
}

export function resolveProjectImport(
  importValue: string,
  sourceFile: string,
  projectRoot: string,
  knownFiles: Set<string>,
): string | undefined {
  let unresolved: string;
  if (importValue.startsWith(".")) {
    unresolved = path.resolve(path.dirname(sourceFile), importValue);
  } else if (importValue === "src" || importValue.startsWith("src/")) {
    unresolved = path.resolve(projectRoot, importValue);
  } else {
    return undefined;
  }

  const candidates = [
    unresolved,
    `${unresolved}.ts`,
    `${unresolved}.tsx`,
    path.join(unresolved, "index.ts"),
    path.join(unresolved, "index.tsx"),
  ].map((candidate) => normalizePath(path.resolve(candidate)));

  return candidates.find((candidate) => knownFiles.has(candidate));
}
