# Dashboard App test plan

Tracks T4.1 in #10. This document defines planned checks and records no test results.

## Scope and exclusions
Cover Supabase sign-in and sign-out, protected routes, invoices, customers, validation, and accessibility. Exclude load tests, automated third-party consent screens, unimplemented REST endpoints, and production writes.

## Levels and expected results

| Level | Check | Expected result |
| --- | --- | --- |
| Unit | Vitest for currency/date formatting, pagination, and Zod schemas | Valid cases pass and invalid fields report the expected errors |
| Integration | Invoice create/edit/delete with seeded data | Database changes match the action and refreshed lists show the updates |
| Integration | Customer deletion with and without linked invoices | Linked customer is preserved with a clear error. Unlinked customer is removed |
| Integration/API | Future invoice and customer API routes | Check valid requests, validation errors, missing auth, and missing records once implemented |
| E2E | Playwright for sign-in, wrong password, sign-out, and direct dashboard access | Correct login opens the dashboard. Wrong password shows an error. Signed-out access redirects to login |
| E2E | Create, edit, delete, search and paginate invoices, then open a missing invoice | List reflects changes, paging keeps the search, and a missing record shows a friendly 404 |
| Manual | Keyboard and error feedback, OAuth consent on approved preview | Controls are reachable, errors are understandable, and OAuth returns to the intended app |

## Environments and data
Run unit tests locally and in CI. Run writes only against a verified isolated Neon test branch or local Supabase. Use a dedicated test account, linked and unlinked customers, and invoices covering search and pagination. Reset seeded fixtures before each suite. Use localhost or a Vercel preview only after confirming its database target. Keep test credentials in the approved secret store.

## Entry and exit criteria
Before execution, the target revision builds, fixtures are available, and the database is verified as isolated. For S4 exit, at least 10 unit tests pass with pnpm test and no test uses production data. For release, auth and invoice flows pass on the isolated environment, defects have owners, release blockers are resolved, and the review partner approves the evidence.

## Risks and roles
Ali prepares the fixtures, executes checks and records the commit, environment, and results. The review partner reviews this plan and checks reproducibility. The teacher validates acceptance when required. Stop writes if the database target is unclear. If Auth is unavailable, mark the check blocked. Record flaky checks and retain CI logs or traces with secrets removed.

See the test tooling ADR for Vitest, Playwright and accessibility decisions.
