# NestJS bad example

The controller imports a concrete repository directly, violating the configured
`controller -> repository` boundary.

Run `archguard check` with this directory as the working directory. The expected
exit code is `1`, with a `cannot-call` violation for `users.controller.ts`.
