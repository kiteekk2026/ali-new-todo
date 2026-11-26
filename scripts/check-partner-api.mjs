import { assertInvoiceMatchesRequest } from './partner-api-contract.mjs';
const [base, customerId] = process.argv.slice(2);
const key = process.env.DASHBOARD_API_KEY;
if (!base || !customerId || !key) {
  throw new Error('Provide the test base URL, seeded customer UUID and DASHBOARD_API_KEY.');
}
const url = new URL('/api/v1/invoices', base);
if (url.protocol !== 'https:' && url.origin !== 'http://127.0.0.1:3000' &&
    url.origin !== 'http://localhost:3000') {
  throw new Error('Use HTTPS or the local test server.');
}
const headers = { 'x-api-key': key, 'content-type': 'application/json' };
const options = { headers, redirect: 'error', signal: AbortSignal.timeout(15000) };
const list = await fetch(url, options);
if (list.status !== 200 || !Array.isArray((await list.json()).items)) {
  throw new Error('The invoice list did not match the contract.');
}
const created = await fetch(url, {
  ...options,
  method: 'POST',
  body: JSON.stringify({ customerId, amountCents: 1250, status: 'pending' }),
});
if (created.status !== 201) throw new Error('Invoice creation returned ' + created.status);
const invoice = await created.json();
if (typeof invoice.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(invoice.id)) {
  throw new Error('Response did not contain a valid invoice ID. Check the test database for the fixture.');
}
try {
  if (invoice.customerId !== customerId || invoice.amountCents !== 1250 || invoice.status !== 'pending') {
    throw new Error('Created invoice did not match the contract.');
  }
} finally {
  const cleanup = await fetch(new URL(url.pathname + '/' + invoice.id, url), { ...options, method: 'DELETE' });
  if (cleanup.status !== 204) throw new Error('Fixture cleanup returned ' + cleanup.status);
}
console.log('Partner invoice list, create and cleanup matched the contract.');

