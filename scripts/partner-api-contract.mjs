export function assertInvoiceMatchesRequest(invoice, customerId) {
  if (
    invoice.customerId !== customerId ||
    invoice.amountCents !== 1250 ||
    invoice.status !== 'pending'
  ) {
    throw new Error(
      'Created invoice did not match the contract (customerId, amountCents or status).'
    );
  }
}
