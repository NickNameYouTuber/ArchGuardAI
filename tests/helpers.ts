import { Writable } from "node:stream";
import type { Runtime } from "../src/runtime.js";

export interface CapturedRuntime {
  runtime: Runtime;
  stdout: () => string;
  stderr: () => string;
}

function capture(): { stream: Writable; value: () => string } {
  let output = "";
  return {
    stream: new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      },
    }),
    value: () => output,
  };
}

export function createCapturedRuntime(cwd: string): CapturedRuntime {
  const stdout = capture();
  const stderr = capture();
  return {
    runtime: {
      cwd,
      stdout: stdout.stream,
      stderr: stderr.stream,
    },
    stdout: stdout.value,
    stderr: stderr.value,
  };
}
