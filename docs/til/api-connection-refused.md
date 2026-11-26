# Keep the local API server running while testing

The test API client reported `ECONNREFUSED` at port 3000. I verified the module
and seeded customer ID, then checked the console history. The Next.js
server had been stopped before the client ran. I started the server in a
separate window and left it running. The client then listed invoices,
created a fixture and cleaned it up.

[Dashboard API documentation](../api.md)
