import { type Page, type Locator, expect } from '@playwright/test';

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
    logoutButton;

    constructor(private page: Page) { //щоб не передавати кожен раз page у методи, стає атрібутом класа, який можно переюзати
        this.userNameField = this.page.locator("#userName");
        this.passwordField = this.page.locator("#password");
        this.loginButton = this.page.locator("#login");
        this.newUserButton = this.page.locator("#newUser");
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
    async isInvalid(attributeName) {
        // let element = await this.userNameField.fill(userCredential.userName); no need to fill empty string
        let usernameFieldValue = await this.userNameField.getAttribute(attributeName);
        // let element2 = await element.getAttribute("class");
        // username and password contain is-invalid tag in DevTools
        // await expect(element2?.includes("is-invalid")).toBe(true);
        return usernameFieldValue.includes("is-invalid"); // true if tag exists, false - if not
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
