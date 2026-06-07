export class ArchGuardError extends Error {
  public readonly exitCode: number;

  public constructor(message: string, exitCode = 2) {
    super(message);
    this.name = "ArchGuardError";
    this.exitCode = exitCode;
  }
}
