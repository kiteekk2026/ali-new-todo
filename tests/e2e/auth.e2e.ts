import { expect, test, type Page } from '@playwright/test';

const email = process.env.TEST_USER_EMAIL!;
const password = process.env.TEST_USER_PASSWORD!;

async function logIn(page: Page, enteredPassword = password) {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(enteredPassword);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
}

test('logs in and opens the dashboard', async ({ page }) => {
  await logIn(page);

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('signs out and loses access to the dashboard', async ({ page }) => {
  await logIn(page);
  await expect(page).toHaveURL('/dashboard');

  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page).toHaveURL('/login');

  await page.goto('/dashboard');
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeVisible();
});

test('rejects the wrong password', async ({ page }) => {
  const wrongPassword = password === 'wrong-password' ? 'another-wrong-password' : 'wrong-password';
  await logIn(page, wrongPassword);

  await expect(page.getByText('Invalid email or password.', { exact: true })).toBeVisible();
  await expect(page).toHaveURL('/login');
});

test('redirects a signed-out visitor from a protected invoices page', async ({ page }) => {
  await page.goto('/dashboard/invoices');

  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeVisible();
});
