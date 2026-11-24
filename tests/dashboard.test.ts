import { describe, expect, it } from 'vitest';
import { invoiceInput } from '../app/lib/invoice-schema';
import { formatCurrency, formatDateToLocal, generatePagination } from '../app/lib/utils';

describe('dashboard utilities', () => {
  it.each([[0, '$0.00'], [125099, '$1,250.99'], [-50, '-$0.50']])(
    'formats %i cents', (amount, expected) => expect(formatCurrency(amount)).toBe(expected),
  );
  it('formats a date using the chosen locale', () => {
    expect(formatDateToLocal('2026-11-24T12:00:00', 'en-GB')).toBe('24 Nov 2026');
  });
  it.each([
    { page: 1, total: 3, expected: [1, 2, 3] },
    { page: 2, total: 10, expected: [1, 2, 3, '...', 9, 10] },
    { page: 5, total: 10, expected: [1, '...', 4, 5, 6, '...', 10] },
    { page: 9, total: 10, expected: [1, 2, '...', 8, 9, 10] },
  ])('paginates page $page of $total', ({ page, total, expected }) => {
    expect(generatePagination(page, total)).toEqual(expected);
  });
});

describe('invoice validation', () => {
  const valid = { customerId: 'customer-1', amount: '12.50', status: 'paid' };
  it('accepts valid details and coerces the amount', () => {
    expect(invoiceInput.parse(valid)).toEqual({ ...valid, amount: 12.5 });
  });
  it.each([
    ['customerId', '', 'Please select a customer.'],
    ['amount', '0', 'Please enter an amount greater than $0.'],
    ['status', undefined, 'Please select an invoice status.'],
  ] as const)('rejects invalid %s', (field, value, message) => {
    const result = invoiceInput.safeParse({ ...valid, [field]: value });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors[field]).toContain(message);
  });
});
