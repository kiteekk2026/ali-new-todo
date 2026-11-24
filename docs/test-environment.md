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
