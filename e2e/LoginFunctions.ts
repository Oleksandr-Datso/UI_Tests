import { type Page, type Locator, expect } from '@playwright/test';

type UserCredentials = {userName: string; password: string}; // тип UserCredentials з обов'язковими пропертіс userName і password, які будуть приймати тільки тип string

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
    loginURL;
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
        this.loginURL = "https://demoqa.com/login";
        }    
    async open() {
        await this.page.goto("https://demoqa.com/");
        await this.page.locator("div:nth-of-type(6)>div>.card-up").click();
        await this.page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
    }
    async login(userCredential: UserCredentials) { //як аргумент приймаємо один об'єкт userCredential типу UserCredentials
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
        await this.page.locator("#g-recaptcha").click(); //locator("#recaptcha-anchor").click(); 
        await this.page.waitForTimeout(3000);
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
    async redirectToLoginPage() {
      await this.page.goto(this.loginURL);
    }
    //Do I need to add here open Login page from Book Store page if button exists ? 
    async navigateToProfilePage() {
        await this.page.goto("https://demoqa.com/profile");
    }
    async deleteBook() {
      await this.page
        .getByRole("gridcell", { name: "Delete" }).first()
        .locator("path")
        .click();
      expect(await this.page.getByText("Delete Book").isVisible());
      expect(await this.page.getByText("Do you want to delete this").isVisible());
      await this.page.getByRole("button", { name: "Cancel" }).click();
      await this.page
        .getByRole("gridcell", { name: "Delete" }).first()
        .locator("path")
        .click();
      await this.page.getByRole("button", { name: "OK" }).click();
    }
    async deletAllBooksPopUp() {
      await this.page.locator("li").filter({ hasText: "Profile" }).click();
      await expect(this.page.getByRole("textbox", { name: "Type to search" })).toBeVisible();
      await this.page.getByRole("button", { name: "Delete All Books" }).click();
      await this.page.getByText("Do you want to delete all books?").isVisible();
    }
    async confirmButton() {
      await this.page.getByRole("button", { name: "OK" }).click();
    }
    async cancelButton() {
      await this.page.getByRole("button", {name: "Cancel"});
    }
    async deleteFirstInstanceInRow() {
      await this.page.locator("#delete-record-undefined").first().click(); //The saem as -> await page.locator('#delete-record-undefined').nth(0).click();
      await this.page.getByText("Do you want to delete this book?").isVisible();
      await this.page.locator("#closeSmallModal-ok").click();
    }
    async deleteAccount() {
      await this.page.getByRole("button", { name: "Delete Account" }).click();
      await this.page.getByText("Do you want to delete your account?").isVisible();
    }
    async logout() {
        await this.logoutButton.click();
    }
    // додати по аналогії строінки з profile, bookstore, і тд
    // 1 page = 1 сторінка
    // загальні елементи (for ex. header, footer) винести в окремі компоненти і підключати їх і загальному коді
    async isbnsSwitch(randomIsbn) {
        switch(randomIsbn) {
            case '9781449325862':
              await expect(this.page.getByRole("link", {name: "Git Pocket Guide"})).toContainText("Git Pocket Guide");
              console.log("case #1");
              break;
            case '9781449331818':
              await expect(this.page.getByRole("link", {name: "Learning JavaScript Design Patterns"})).toContainText("Learning JavaScript Design Patterns");
              console.log("case #2");
              break;
            case '9781449337711':
              await expect(this.page.getByRole("link", {name: "Designing Evolvable Web APIs with ASP.NET"})).toContainText("Designing Evolvable Web APIs with ASP.NET");
              console.log("case #3");
              break;
            case '9781449365035':
              await expect(this.page.getByRole("link", {name: "Speaking JavaScript"})).toContainText("Speaking JavaScript");
              console.log("case #4");
              break;
            case '9781491904244':
              await expect(this.page.getByRole("link", {name: "You Don't Know JS"})).toContainText("You Don't Know JS");
              console.log("case #5");
              break;
            case '9781491950296':
              await expect(this.page.getByRole("link", {name: "Programming JavaScript Applications"})).toContainText("Programming JavaScript Applications");
              console.log("case #6");
              break;
            case '9781593275846':
              await expect(this.page.getByRole("link", {name: "Eloquent JavaScript, Second Edition"})).toContainText("Eloquent JavaScript, Second Edition");
              console.log("case #7");
              break;
            case '9781593277574':
              await expect(this.page.getByRole("link", {name: "Understanding ECMAScript 6"})).toContainText("Understanding ECMAScript 6");
              console.log("case #8");
              break;
          }
    }
}
