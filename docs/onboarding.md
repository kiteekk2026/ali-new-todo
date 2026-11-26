# Dashboard developer onboarding

1. Install Git, Node.js 22, pnpm 10.33 and Docker. Get access to the
   GitHub repository. Vercel and hosted database access are needed only
   for deployment work.
2. Clone the repo and install the locked dependencies.

   ```sh
   git clone https://github.com/kiteekk2026/ali-new-todo.git
   cd ali-new-todo
   pnpm install --frozen-lockfile
   pnpm test
   ```

3. Install the Supabase CLI and start Docker. In a separate disposable
   folder, run `supabase init` and `supabase start`. Follow
   [the local test environment guide](test-environment.md) to fill in
   `.env.test.local` and seed the account and data with `pnpm test:seed`.
4. For a manual session, add the same local database URL and auth URL to
   `.env.local`. Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the public key
   printed by the local stack. Run `pnpm dev`, open the Local URL shown
   in the terminal and sign in with your seeded test account. Use the
   test credentials locally.
5. With the Playwright changes from [PR #31](https://github.com/kiteekk2026/ali-new-todo/pull/31),
   install Chromium using `pnpm exec playwright install chromium` and run
   `pnpm test:e2e`. Playwright starts a separate dashboard on port 3107.
6. Run `pnpm lint` and `pnpm exec next typegen && pnpm exec tsc --noEmit`
   before opening a pull request. See [the CI guide](ci.md) and
   [OpenAPI contract](openapi.yaml) for the review checks and API.

## Setup issues that occurred

- If `docker version` shows only a Client section, wait for Docker's
  Server section before starting Supabase.
- If `test:seed` receives an empty URL, fill in the test env file from
  the running local stack. The example file contains blanks.
- An API client reaching `ECONNREFUSED` needs the app server running.
  Keep the dev server open while using a second terminal for the client.
