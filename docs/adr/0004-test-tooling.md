# ADR 0004 — Test tooling

Status: Proposed. Tracks T4.2 in #10.

## Context
The TypeScript dashboard needs fast checks for utilities and Zod schemas, plus browser coverage for Supabase sessions and invoices.

## Options
Vitest provides a lightweight TypeScript and ESM setup. Jest has a mature ecosystem. Playwright provides isolated browser contexts, accessible locators and CI traces. Cypress offers an interactive runner.

## Decision
Use Vitest for unit and integration checks, Playwright for browser journeys, and axe for browser accessibility checks. Keep real OAuth consent and keyboard checks manual.

## Consequences
Run unit tests in CI. Seed an isolated test database before data-changing tests. Browser installation adds CI time. Store credentials securely and redact traces. Implementation is tracked in #20 and #23.
