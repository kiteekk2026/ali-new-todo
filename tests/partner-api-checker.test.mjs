import { describe, expect, it } from 'vitest';
import { assertInvoiceMatchesRequest } from '../scripts/partner-api-contract.mjs';

const customerId = '11111111-1111-4111-8111-111111111111';

describe('Partner API customer ID validation', () => {
  it('accepts the correct customer ID', () => {
    expect(() => assertInvoiceMatchesRequest({
      customerId,
      amountCents: 1250,
      status: 'pending'
    }, customerId)).not.toThrow();
  });

  it('rejects an invoice belonging to another customer', () => {
    expect(() => assertInvoiceMatchesRequest({
      customerId: '22222222-2222-4222-8222-222222222222',
      amountCents: 1250,
      status: 'pending'
    }, customerId)).toThrow(/customerId/);
  });
});
