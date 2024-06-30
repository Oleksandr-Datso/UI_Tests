// import { test, expect } from '@playwright/test';

// test('Text Box', async ({ page }) => {
//     test.slow();
//     await page.goto('https://demoqa.com/');
//     await page.locator("//div[@id='app']/div[@class='body-height']/div[@class='home-content']//div[@class='category-cards']/div[1]/div").click();
//     await expect(page.getByText('Please select an item from left to start practice.')).toBeVisible();
//     await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
//     await expect (page.locator('[class="text-center"]')).toBeVisible();
//     await page.locator('[placeholder="Full Name"]').fill('Alejandro The Great');
//     await page.locator('input#userEmail').fill('testuser@test.com');
//     await page.locator('#currentAddress').fill('place with peace');
//     await page.locator('#permanentAddress').fill('near Atlantic ocean to have an option to surf');
//     await page.getByRole('button', { name: 'Submit' }).click();
    
//     await expect(page.getByText('p#name')).toBeTruthy();
//     await expect(page.getByText('p#email')).toBeTruthy();
//     await expect(page.getByText('p#currentAddress')).toBeTruthy();
//     await expect(page.getByText('p#permanentAddress')).toBeTruthy();
// });
// test('Check Box', async ({ page }) => {
//     test.slow();
//     await page.goto('https://demoqa.com/');
//     await page.locator("//div[@id='app']/div[@class='body-height']/div[@class='home-content']//div[@class='category-cards']/div[1]/div").click();
//     await expect(page.getByText('Please select an item from left to start practice.')).toBeVisible();
//     await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(2)").click();
//     await page.getByRole('button', { name: 'Expand all'}).click();
//     await page.locator("#tree-node > ol > li > ol > li:nth-child(2) > ol").isVisible();
//     await page.getByRole('button', { name: 'Collapse all' }).click();
//     await page.locator("#tree-node > ol > li > ol > li:nth-child(2) > ol").isHidden();
// });