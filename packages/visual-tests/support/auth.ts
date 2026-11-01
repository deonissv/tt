import { expect, type Page } from '@playwright/test';
import type { PlayerLogin } from '../fixtures/dataset';

export async function signIn(page: Page, login: PlayerLogin): Promise<void> {
  await page.goto('/login', { waitUntil: 'commit' });
  await page.getByPlaceholder('Email', { exact: true }).fill(login.email);
  await page.getByPlaceholder('Password', { exact: true }).fill(login.password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page).toHaveURL(/\/games\/?$/);
}
