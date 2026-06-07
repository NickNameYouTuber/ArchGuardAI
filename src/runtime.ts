export interface Runtime {
  cwd: string;
  stdout: NodeJS.WritableStream;
  stderr: NodeJS.WritableStream;
}

export function defaultRuntime(): Runtime {
  return {
    cwd: process.cwd(),
    stdout: process.stdout,
    stderr: process.stderr,
  };
}
