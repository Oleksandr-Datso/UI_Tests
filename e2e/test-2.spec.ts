import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://demoqa.com/profile');
  await page.getByRole('link', { name: 'login' }).click();
  await page.getByPlaceholder('UserName').click();
  await page.getByPlaceholder('UserName').fill('testUser1714322199040');
  await page.getByPlaceholder('UserName').press('Tab');
  await page.getByPlaceholder('Password').fill('1qaz@WSX');
  await page.getByPlaceholder('Password').press('Enter');

  await page.getByRole('gridcell', { name: 'Programming JavaScript' }).click();
  await page.getByRole('link', { name: 'Programming JavaScript' }).click();
  await page.getByText('Programming JavaScript').click();
  await page.getByText('Title :', { exact: true }).click();
  await page.getByText('9781491950296').click();
  await page.getByText('ISBN :').click();
  
  await page.getByRole('button', { name: 'Back To Book Store' }).click();

  await page.getByRole('gridcell', { name: 'Delete' }).locator('path').click();
  await page.getByText('Delete Book').click();
  await page.getByText('Do you want to delete this').click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('gridcell', { name: 'Delete' }).locator('path').click();
  await page.getByRole('button', { name: 'OK' }).click();
});