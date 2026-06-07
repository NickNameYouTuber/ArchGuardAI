# NestJS good example

This example follows the dependency flow:

```text
controller -> use_case -> repository_port
```

After building the CLI from the repository root:

```bash
cd examples/nestjs-good
node ../../dist/cli.js check
```

The expected exit code is `0`.
