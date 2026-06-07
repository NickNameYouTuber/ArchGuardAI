export const START_MARKER = "<!-- archguard:start -->";
export const END_MARKER = "<!-- archguard:end -->";

function markerCount(content: string, marker: string): number {
  return content.split(marker).length - 1;
}

export function normalizeLineEndings(content: string): string {
  return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

export function validateManagedBlock(content: string, filePath: string): void {
  const normalized = normalizeLineEndings(content);
  const startCount = markerCount(normalized, START_MARKER);
  const endCount = markerCount(normalized, END_MARKER);

  if (startCount === 0 && endCount === 0) return;
  if (startCount !== 1 || endCount !== 1) {
    throw new Error(
      `${filePath} must contain exactly one ArchGuard start marker and one end marker.`,
    );
  }
  if (normalized.indexOf(END_MARKER) < normalized.indexOf(START_MARKER)) {
    throw new Error(`${filePath} has ArchGuard managed markers in the wrong order.`);
  }
}

export function updateManagedBlock(
  existing: string,
  block: string,
  filePath = "instruction file",
): string {
  const normalizedExisting = normalizeLineEndings(existing);
  const normalizedBlock = normalizeLineEndings(block).trim();
  validateManagedBlock(normalizedExisting, filePath);

  const start = normalizedExisting.indexOf(START_MARKER);
  if (start === -1) {
    const prefix = normalizedExisting.trimEnd();
    return `${prefix ? `${prefix}\n\n` : ""}${normalizedBlock}\n`;
  }

  const end = normalizedExisting.indexOf(END_MARKER);
  const before = normalizedExisting.slice(0, start).trimEnd();
  const after = normalizedExisting
    .slice(end + END_MARKER.length)
    .trimStart();
  return `${before ? `${before}\n\n` : ""}${normalizedBlock}${after ? `\n\n${after}` : "\n"}`;
}

export function managedBlockIsCurrent(
  existing: string,
  block: string,
  filePath: string,
): boolean {
  const normalizedExisting = normalizeLineEndings(existing);
  validateManagedBlock(normalizedExisting, filePath);
  const start = normalizedExisting.indexOf(START_MARKER);
  const end = normalizedExisting.indexOf(END_MARKER);
  if (start === -1 || end === -1) return false;

  const current = normalizedExisting
    .slice(start, end + END_MARKER.length)
    .trim();
  return current === normalizeLineEndings(block).trim();
}
