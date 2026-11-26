import { expect, test } from '@playwright/test';
import { InvoicesPage } from '../pages/InvoicesPage';
import { LoginPage } from '../pages/LoginPage';

test.beforeEach(async ({ page }) => {
  await new LoginPage(page).signIn();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('creates, edits and deletes a test invoice', async ({ page }) => {
  const invoices = new InvoicesPage(page);
  await invoices.open();

  await invoices.create('73.25');
  await expect(invoices.row('$73.25')).toContainText('Pending');

  await invoices.edit('$73.25', '74.25');
  await expect(invoices.row('$74.25')).toContainText('Paid');
  await expect(invoices.row('$73.25')).toHaveCount(0);

  await invoices.remove('$74.25');
  await page.reload();
  await expect(invoices.row('$74.25')).toHaveCount(0);
});

test('searches invoices by the seeded customer name', async ({ page }) => {
  const invoices = new InvoicesPage(page);
  await invoices.open();

  await invoices.search('No such customer');
  await expect(page.getByRole('row')).toHaveCount(1);

  await invoices.search('Linked customer');
  await expect(invoices.row('$14.00')).toContainText('Linked customer');
});

test('paginates filtered invoices and preserves the search term', async ({ page }) => {
  const invoices = new InvoicesPage(page);
  await invoices.open();
  await invoices.search('Linked customer');
  await expect(invoices.row('$14.00')).toBeVisible();

  await invoices.nextPage();
  expect(new URL(page.url()).searchParams.get('query')).toBe('Linked customer');
  await expect(page.getByRole('link', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  await expect(invoices.row('$8.00')).toBeVisible();
  await expect(invoices.row('$14.00')).toHaveCount(0);
});
