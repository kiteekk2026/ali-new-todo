# Dashboard CI

Dashboard CI runs on pull requests and pushes to main. It installs the pinned lockfile, runs ESLint, checks TypeScript, runs the unit tests, reports coverage for the tested utility and invoice schema modules, and builds Next.js.

## Credentials

The workflow uses placeholder values and requires no GitHub secrets for the current checks. Keep deployment credentials in Vercel and any future integration credentials in GitHub Actions secrets for the isolated test environment. Do not supply production credentials to this workflow.

## Merge requirements and evidence

Use the existing main protection to require the Dashboard CI job after its first successful run. Keep the peer approval requirement. To verify the rule, open a temporary PR with a failing test, capture GitHub showing the merge blocked, fix the test, and verify the checks turn green. Record the CI run and Vercel preview URL on issue #21.
