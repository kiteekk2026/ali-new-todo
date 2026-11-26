import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { InvoicesPage } from '../pages/InvoicesPage';
import { LoginPage } from '../pages/LoginPage';

for (const route of ['dashboard', 'invoices'] as const) {
  test(route + ' passes automated WCAG A and AA checks', async ({ page }) => {
    await new LoginPage(page).signIn();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    if (route === 'invoices') await new InvoicesPage(page).open();
    else await expect(page.getByText('Collected', { exact: true })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violations = results.violations.flatMap((rule) =>
      rule.nodes.map((node) => ({ id: rule.id, target: node.target, summary: node.failureSummary })),
    );
    expect(violations).toEqual([]);
  });
}
