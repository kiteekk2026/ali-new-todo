# Playwright heading matches during navigation

The local invoice pagination test failed immediately after clicking the
Invoices navigation link. Reading the recorded trace showed that the next
assertion matched two headings still visible on the dashboard: Total Invoices
and Latest Invoices. Playwright raised a strict-mode error before the route
finished loading.

I changed the page object to match the complete heading name, Invoices. The
assertion can now wait for the destination heading without matching similar
text on the previous page. The pagination test also checks the page number,
the preserved search term and a different set of invoice rows.

A second local run showed an unexpected return to the login form during invoice
navigation. Another test had signed out the same seeded account while tests
were running in parallel. The suite now uses one worker so that sign-out
cannot revoke another test's session.

For a failing GitHub Actions run, download the `playwright-traces` artifact
from the run summary and open the relevant zip with
`pnpm exec playwright show-trace path/to/trace.zip`.

[Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
