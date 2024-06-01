import { Page, expect } from '@playwright/test';

export class LoginPage {
    userNameField; 
    passwordField; 
    loginButton; 
    newUserButton;
    firstNameField;
    lastNameField;
    registerButton;
    backToLoginButton;
    searchBoxField;
    logoutButton

    constructor(private page) {//щоб не передавати кожен раз page у методи, стає атрібутом класа, який можно переюзати
        this.userNameField = this.page.locator("#userName");
        this.passwordField = this.page.locator("#password");
        this.loginButton = this.page.locator("#login");
        this.newUserButton = this.page.locator("#newUSer");
        this.firstNameField = this.page.locator("#firstname");
        this.lastNameField = this.page.locator("#lastname");
        this.registerButton = this.page.locator("#register");
        this.backToLoginButton = this.page.locator("#gotologin");
        this.searchBoxField = this.page.locator("#searchBox");
        this.logoutButton = this.page.getByText("Log out");
        }    
    async open() {
        await this.page.goto("https://demoqa.com/");
        await this.page.locator("div:nth-of-type(6)>div>.card-up").click();
        await this.page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
    }
    async login(userCredential: {userName, password}) {
        await this.userNameField.fill(userCredential.userName);
        await this.passwordField.fill(userCredential.password);
        await this.loginButton.click();
    }
    async registerNewUser(userCredentials: {firstName, lastName, userName, password}) {
        await this.newUserButton.click();
        await this.firstNameField.fill(userCredentials.firstName);
        await this.lastNameField.fill(userCredentials.lastName);
        await this.userNameField.fill(userCredentials.userName);
        await this.passwordField.fill(userCredentials.password);
        await this.page.locator("#recaptcha-anchor").click();
        await this.registerButton.click();
    }
    async backToLoginFromRegistration() {
        await this.backToLoginButton.click();
    }
    async isInvalid(userCredential: {userName, attributeName}) {
        let element = await this.userNameField.fill(userCredential.userName);
        let element2 = await element.getAttribute("`${attributeName}`");
        // let element2 = await element.getAttribute("class");
        // username and password contain is-invalid tag in DevTools
        await expect(element2?.includes("is-invalid")).toBe(true);
    }
    async navigateToBookStorePage() {
        await this.page.goto("https://demoqa.com/books");
    }
    async searchBook(bookName) {
        await this.searchBoxField.fill(bookName);
    }
    async navigateToLoginPage() {
        await this.loginButton.click();
    }
    //Do I need to add here open Login page from Book Store page if button exists ? 
    async navigateToProfilePage() {
        await this.page.goto("https://demoqa.com/profile");
    }
    async logout() {
        await this.logoutButton.click();
    }
    // додати по аналогії строінки з profile, bookstore, і тд
    // 1 page = 1 сторінка
    // загальні елементи (for ex. header, footer) винести в окремі компоненти і підключати їх і загальному коді
}


/*
export async function login(page: Page, userCredential: {userName, password}) { //коли більше ніж 1 аргумент, то краще використовувати Object 
    // прибрати дві нистрічки нижче  і винести в beforeEach. Навігація окремо, авторизація окрето
    await page.goto("https://demoqa.com/");
    await page.locator("div:nth-of-type(6)>div>.card-up").click();
    await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
    await page.locator("#userName").fill(userCredential.userName);
    await page.locator("#password").fill(userCredential.password);
    await page.locator("#login").click();
}
   
    // зробити окремий метод на is-invalid нижче - expectUsernameErrorStyle
    const element = await page.locator("#userName");
    const element2 = await element.getAttribute("class");
    // username and password contain is-invalid tag in DevTools
    await expect(element2?.includes("is-invalid")).toBe(true);

export async function logout(page: Page) {
    // await successfullyLogin(page, userName , password);
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


*/