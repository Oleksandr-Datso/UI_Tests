import { Page, expect } from '@playwright/test';

export async function successfullyLogin(page: Page, userName, password) {
    await page.goto("https://demoqa.com/");
    await page.locator("div:nth-of-type(6)>div>.card-up").click();
    await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
    await page.locator("#userName").fill(userName);
    await page.locator("#password").fill(password);
    await page.locator("#login").click();
    await expect(page.getByText(userName)).toBeVisible();
}

export async function failedLogin(page: Page) {
    await page.goto("https://demoqa.com/");
    await page.locator("div:nth-of-type(6)>div>.card-up").click();
    await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
    await page.getByText("Login");
    await page.locator("#login").click();
    
    const element = await page.locator("#userName");
    const element2 = await element.getAttribute("class");
    // username and password contain is-invalid tag in DevTools
    await expect(element2?.includes("is-invalid")).toBe(true);
}
export async function logoutAfterLogin(page: Page, userName, password) {
    await successfullyLogin(page, userName , password);
    await page.locator('#submit:has-text("Log out")').click();
    await expect(page.locator("#userForm")).toBeVisible();
}
export async function bookStoreWhenLogin(page: Page, userName, password) {
    await successfullyLogin(page, userName, password);
    await page.locator('#gotoStore').last().click();
    // Check that element from the book store is present on UI
    await expect(page.getByText('Richard E. Silverman')).toBeVisible();
}
export async function bookStoreCheck(page: Page) {
    await page.goto("https://demoqa.com/");
    await page.locator("div:nth-of-type(6)>div>.card-up").click();
    // Check that element from the book store is present on UI
    await expect(page.getByText('Nicholas C. Zakas')).toBeVisible();
}
export async function bookStoreCheckWithGetByRole(page: Page, userName, password) {
    await page.goto("https://demoqa.com/");
    await page.getByRole("heading", { name: "Book Store Application" }).click();
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "UserName" }).fill(userName);
    await page.getByRole("textbox", { name: "Password" }).fill(password);
    await page.keyboard.press("Enter");
    await page.waitForSelector("#submit", { state: "visible", timeout: 10000 });
    await expect(page.getByText("User Name :")).toBeVisible();
    //redirected to books
    // await page.locator('#gotoStore').click();
    // await page.getByRole('button', { name: 'Go To Book Store'}).click();
    await expect(
      page.getByRole("link", { name: "Git Pocket Guide" })
    ).toBeVisible();
}
export async function loginPageCheckWhenLoggedIn(page: Page, userName, password) {
    await page.goto("https://demoqa.com/");
    await page.getByRole("heading", { name: "Book Store Application" }).click();
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "UserName" }).fill(userName);
    await page.getByRole("textbox", { name: "Password" }).fill(password);
    await page.keyboard.press("Enter");
    await expect(page.getByText("User Name :")).toBeVisible();
    await page
      .locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)")
      .click();
    await expect(page.locator("#loading-label")).toBeVisible();
    await expect(
      page.getByText("You are already logged in. View your ")
    ).toBeVisible();
}


