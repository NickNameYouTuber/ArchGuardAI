#!/usr/bin/env node

import { runProgram } from "./program.js";
import { defaultRuntime } from "./runtime.js";

process.exitCode = await runProgram(process.argv.slice(2), defaultRuntime());
