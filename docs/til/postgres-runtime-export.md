# Check runtime exports when type checking passes

The API change passed the type check and failed the production build.
I opened the CI build log and found that Turbopack could not resolve the
named `PostgresError` import at runtime. The follow-up used the driver's
error code rather than depending on that named runtime export, and the
next CI run passed.

[Failing CI run](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45495913615)
