# Dashboard test environment

Unit tests use no credentials or database. Run `pnpm test`.

For integration checks, start Supabase locally in a dedicated disposable directory with
`supabase init` and `supabase start`. This requires Docker and the Supabase CLI.
Use the standard ports (API 54321 and Postgres 54322). If another local Supabase stack
occupies these ports, stop it before starting the dedicated test stack.

Copy `.env.test.example` to `.env.test.local`. Fill in the local URLs and keys
reported by `supabase status`, using 127.0.0.1 for both hosts. Set a dedicated
email ending in `@example.test` and a password. Run `pnpm test:seed` from the
project root on Node 22 or later.

The seed replaces rows in the local customers, invoices and revenue tables and
creates or updates the specified local auth user. It refuses cloud endpoints.
The seeded customers cover deletion with and without invoices. Fourteen invoices
provide enough fixtures to exercise pagination. Never point an app running
integration checks at its production database.

## Browser tests

With the local Supabase test stack running and `.env.test.local` filled in as above:

```sh
pnpm test:seed
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright starts its own dashboard server at `http://127.0.0.1:3107`.
The auth suite signs in with the seeded user and checks logout, invalid
credentials, and redirects from protected pages. Failed runs retain traces in
`test-results/`. Use test credentials only and share traces privately.

Reseed before rerunning the suite if the invoice journey was interrupted. The
invoice tests cover search and pagination plus a create, edit and delete journey.
The dashboard and invoice list are scanned with axe for WCAG 2.1 A/AA rules.

GitHub Actions runs the same suite in the `browser` job against its own
disposable Supabase stack. Failed browser tests can leave a
`playwright-traces` artifact on the run for three days. Those traces contain
test data only.
