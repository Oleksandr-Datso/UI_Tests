import { test, expect } from '@playwright/test';
import { timeLog } from 'console';
import { TIMEOUT } from 'dns';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test('self test', async ({page}) => {
  await page.goto('https://www.google.com/');
  await page.getByTitle('Пошук').fill('xpath or css');
  await page.getByTitle('Пошук').press('Enter');
});

