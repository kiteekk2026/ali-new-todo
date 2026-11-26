# Dashboard test report

## Test results

| Level | Coverage | Result |
| --- | --- | --- |
| Unit and API handler | Formatting, pagination, invoice validation, API authentication and handler responses | 43 passed |
| Browser | Session flows, invoice changes, search, pagination and axe checks | 9 passed |
| Manual peer interoperability | Read and create an invoice through the partner's test API | Client verified locally. Partner run pending. |
| Exploratory | Invoice charter on the live partner app | Pending. |

The browser results come from [PR #31](https://github.com/kiteekk2026/ali-new-todo/pull/31)
and its [CI run](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45509583132).
CI used a disposable Supabase stack. Vitest reported **75% lines, 70.37% statements,
100% branches and 66.66% functions** for the two measured utility and invoice-schema
modules. The coverage figures apply to those modules.

## Last ten Dashboard CI runs

| Run ID | Result |
| --- | --- |
| [45509583132](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45509583132) | Passed, including the 9 browser tests |
| [45509428037](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45509428037) | Passed |
| [45508445316](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45508445316) | Passed |
| [45496340319](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45496340319) | Passed |
| [45496119077](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45496119077) | Passed |
| [45496028932](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45496028932) | Passed |
| [45495913615](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45495913615) | Failed during the production build |
| [45494927982](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45494927982) | Passed |
| [45494354748](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45494354748) | Passed |
| [45493498256](https://github.com/kiteekk2026/ali-new-todo/actions/runs/45493498256) | Passed |

The failing build tried to import `PostgresError` as a named export. The
following API revisions passed. The ten runs show one deterministic build
failure and no observed CI test flakiness. Only the latest run in this
sample included the new browser job.

## Authorization follow-up

The local branch passed 41 Vitest tests, including nine checks for the
dashboard session guard and retired legacy routes. Browser results above
apply to PR #31. The authorization changes require review and a preview run.

## Release recommendation

Hold release evidence sign-off until the browser PR is reviewed, the partner
runs are captured, and production authorization controls are verified.
Track peer API evidence in [issue #22](https://github.com/kiteekk2026/ali-new-todo/issues/22)
and exploratory results in [issue #23](https://github.com/kiteekk2026/ali-new-todo/issues/23).
See the [security review](security-review.md) for database policy and
deployment verification gaps.
