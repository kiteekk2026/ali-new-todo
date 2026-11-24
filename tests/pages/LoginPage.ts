import type { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async signIn(password = process.env.TEST_USER_PASSWORD!) {
    await this.page.goto('/login');
    await this.page.getByLabel('Email', { exact: true }).fill(process.env.TEST_USER_EMAIL!);
    await this.page.getByLabel('Password', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: 'Log in', exact: true }).click();
  }
}
