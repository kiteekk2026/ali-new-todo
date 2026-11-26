import { expect, type Page } from '@playwright/test';

export class InvoicesPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.getByRole('link', { name: 'Invoices', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Invoices', exact: true })).toBeVisible();
    await expect(this.page.getByRole('table')).toBeVisible();
  }

  row(amount: string) {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: amount, exact: true }),
    });
  }

  async create(amount: string) {
    await this.page.getByRole('link', { name: 'Create Invoice' }).click();
    await this.page.getByRole('combobox', { name: 'Choose customer' })
      .selectOption({ label: 'Unlinked customer' });
    await this.page.getByRole('spinbutton', { name: 'Choose an amount' }).fill(amount);
    await this.page.getByRole('radio', { name: 'Pending' }).check();
    await this.page.getByRole('button', { name: 'Create Invoice' }).click();
    await expect(this.page).toHaveURL('/dashboard/invoices');
  }

  async edit(currentAmount: string, newAmount: string) {
    await this.row(currentAmount).getByRole('link', { name: 'Edit invoice' }).click();
    await this.page.getByRole('spinbutton', { name: 'Choose an amount' }).fill(newAmount);
    await this.page.getByRole('radio', { name: 'Paid' }).check();
    await this.page.getByRole('button', { name: 'Edit Invoice' }).click();
    await expect(this.page).toHaveURL('/dashboard/invoices');
  }

  async remove(amount: string) {
    await this.row(amount).getByRole('button', { name: 'Delete' }).click();
    await expect(this.row(amount)).toHaveCount(0);
  }

  async search(term: string) {
    await this.page.getByRole('textbox', { name: 'Search' }).fill(term);
    await expect(this.page).toHaveURL((url) => url.searchParams.get('query') === term);
  }

  async nextPage() {
    await this.page.getByRole('link', { name: 'Next page' }).click();
    await expect(this.page).toHaveURL((url) => url.searchParams.get('page') === '2');
  }
}
