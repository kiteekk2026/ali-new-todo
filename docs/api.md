# Dashboard REST API

The [OpenAPI contract](openapi.yaml) describes CRUD, search and pagination under
`/api/v1/invoices` and `/api/v1/customers`. Invoice amounts are integer cents.
List responses contain items, page, pageSize and total.

## Authentication decision

Use a server-issued API key so a partner client can connect without a browser
session. The key grants access to the dashboard records in that deployment, so
provide it only to trusted clients. Set a unique random `DASHBOARD_API_KEY`
in the isolated test environment, and send it in the `x-api-key` header.
The API rejects requests when a key is missing, invalid or unconfigured.
Store the key server-side and use HTTPS outside localhost.

## Peer interoperability check

On the partner's isolated test deployment, obtain a test API key and a seeded
customer UUID. From Node 22+, run the client with a private env file containing
`DASHBOARD_API_KEY`. Pass the base URL and UUID as positional arguments.

```text
node --env-file=.env.test.local scripts/check-partner-api.mjs https://test-dashboard.example CUSTOMER_UUID
```

The client lists invoices, creates a 1250-cent pending invoice, verifies the
response and deletes that fixture. Record the partner deployment, result and
any spec mismatches on issue #22. Use a database reserved for integration testing.
