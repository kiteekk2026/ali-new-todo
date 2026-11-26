# Dashboard security review

Reviewed the source at main commit `2488c2f` and the changes in this branch.

| Area | Finding and disposition |
| --- | --- |
| Legacy course routes | `GET /seed` could write fixtures using the application's database credentials. `GET /query` could return invoice amounts and customer names. Both routes now return 404. Use the isolated `pnpm test:seed` script for fixtures and the documented API for data access. |
| Server Actions | The six invoice and customer mutations previously relied on the protected page flow. They now validate the Supabase user before processing input or accessing the database. The login action authenticates credentials, and the sign-out action ends the current session. |
| REST routes | The shared handler checks the server-only API key before validation and database access. The key grants access to the shared dashboard data. |
| Authentication routes | The Supabase OAuth callback exchanges the provider code. Legacy NextAuth handlers still coexist with the Supabase login flow and need a deployment review. |
| Database policies | Production Supabase RLS settings and deployed grants were unavailable to this review. Supabase supplies sessions and the app uses a direct Postgres connection. Check the deployed role and policy behavior before relying on RLS as a boundary. |
| Secrets | Inspected tracked environment templates and checked for common live connection-string and Supabase secret-key patterns in the reviewed tree. The templates use empty values. Historical commits and deployed configuration remain outside this check. |

Local regression tests verify the legacy endpoints return 404 and the six
mutations redirect unauthenticated users before database access. Verify the
preview after review. Include the existing login, invoice and API checks in the release
evidence.
