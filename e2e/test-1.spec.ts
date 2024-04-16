import { test, expect } from "@playwright/test";
import axios from "axios";
import { testUserData } from "../api/credentials";
import { AccountApi } from "../api/AccountApi";
import { BookStoreApi } from "../api/BookStoreApi";
import { DataClass } from "../api/data";

let accountApi = new AccountApi("https://demoqa.com");
let bookStoreApi = new BookStoreApi("https://demoqa.com");

test.describe("Placeholder for describe", async () => {
  //For creating user needed variables:
  let userName = `testUser${Date.now()}`;
  let password = "1qaz@WSX";

  test.beforeEach("Create new user via API call", async () => {
    const body = JSON.stringify({
      userName,
      password,
    });

    const config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    const { status, data } = await axios.post(
      `https://demoqa.com/Account/v1/User`,
      body,
      config
    );
    console.log("status = " + status + "\nAnd data = " + data);
    console.log("username = " + userName + "\npassword = " + password);
    expect(status).toBe(201);
    expect(data).toBeDefined();
  });
  test("Successfully Login", async ({ page }) => {
    await page.goto("https://demoqa.com/");
    await page.locator("div:nth-of-type(6)>div>.card-up").click();
    await page
      .locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)")
      .click();
    await page.getByText("Login");
    await page.locator("#userName").fill(userName);
    await page.locator("#password").fill(password);
    await page.locator("#login").click();
    await expect(page.getByText("User Name :")).toBeVisible();
  });
  test("Login Failed with empty fields", async ({ page }) => {
    await page.goto("https://demoqa.com/");
    await page.locator("div:nth-of-type(6)>div>.card-up").click();
    await page
      .locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)")
      .click();
    await page.getByText("Login");
    await page.locator("#login").click();
    // Why attribute class is not seen ?!
    const element = await page.locator("#userName");
    const element2 = await element.getAttribute("class");
    // const checkRedBorders = element2?.includes('is-invalid');
    // await expect(checkRedBorders).toBe(true);
    await expect(element2?.includes("is-invalid")).toBe(true);
  });
  test("Log out after successfully Login", async ({ page }) => {
    await page.goto("https://demoqa.com/");
    await page.locator("div:nth-of-type(6)>div>.card-up").click();
    await page
      .locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)")
      .click();
    await page.getByText("Login");
    await page.locator("#userName").fill(userName);
    await page.locator("#password").fill(password);
    await page.locator("#login").click();
    await expect(page.getByText(userName)).toBeVisible();
    await page.locator('#submit:has-text("Log out")').click();
    await expect(page.locator("#userForm")).toBeVisible();
  });
  test("Go to book store", async ({ page }) => {
    await page.goto("https://demoqa.com/");
    await page.locator("div:nth-of-type(6)>div>.card-up").click();
    // await page
    //   .locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)")
    //   .click();
    await page.getByText("Login").click();
    await page.locator("#userName").fill(userName);
    await page.locator("#password").fill(password);
    await page.locator("#login").click();
    await page.locator("#gotoStore").click();
  });
  test("SAME but another wayy -> Go to book store using getByRoleOrLabel", async ({
    page,
  }) => {
    await page.goto("https://demoqa.com/");
    await page.getByRole("heading", { name: "Book Store Application" }).click();
    await page.getByRole("button", { name: "Login"}).click();
    await page.getByRole("textbox", { name: "UserName" }).fill(userName);
    await page.getByRole("textbox", { name: "Password" }).fill(password);
    await page.getByRole("button", { name: "Login" }).click();
    //redirected to books
    await page.locator('#gotoStore').click();
    // await page.getByRole('button', { name: 'Go To Book Store'}).click();
    // await expect(page.getByRole('link', { name: 'Git Pocket Guide'})).toBeVisible();
  });
});

test.describe("Add books via API call to the created user by another API", async () => {
  //For creating user needed variables:
  let userName = `testUser${Date.now()}`;
  let password = "1qaz@WSX";

  //For do actions with books needed variables:
  let createNewUser, userId, token, randomIsbn;

  test.describe("Receive all results when adding book to the user", async () => {
    test.beforeEach("Create user with token & userId by calling API", async () => {
      createNewUser = await accountApi.createNewUser(userName, password);
      token = (await accountApi.generateToken(userName, password)).data.token;
      const authorization = await accountApi.authorization(userName, password);
      userId = createNewUser.data.userID;
      console.log(createNewUser.data);
    });
  
    test("Add one random book to the user by isbn book number", async ({ page }) => {
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;
      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      randomIsbn = isbnNumbers[randomIsbnIndex];
  
      // Add books to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);
      expect(addBookToTheUser).toHaveProperty("status", 201);
      console.log(createNewUser.data.books); //If I add book, it is not shown, why?!
  
      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
      await page.getByText("Login");
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();
      await expect(page.getByText("User Name :")).toBeVisible();
      // await expect(page.getByRole('link', { name: 'Speaking JavaScript'})).toBeVisible();
    });
    test("Goal is to receive error 401 for Add book to the user by isbn book number", async ({ page }) => {
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;
      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      randomIsbn = isbnNumbers[randomIsbnIndex];
      token = "Oops, replaced token ^_^";
  
      // Add books to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);
      expect(addBookToTheUser).toHaveProperty("status", 401);
  
      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
      await page.getByText("Login");
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();
      await expect(page.getByText("User Name :")).toBeVisible();
    });
    test("Goal is to receive error 400 for Add book to the user by isbn book number", async ({ page }) => {
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;
      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      randomIsbn = isbnNumbers[randomIsbnIndex] + `invalidNumberToSeeError`;
      console.log(randomIsbn);
  
      // Add books to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);
      expect(addBookToTheUser).toHaveProperty("status", 400);
  
      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
      await page.getByText("Login");
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();
      await expect(page.getByText("User Name :")).toBeVisible();
    });
    test("Add two random books to the user by isbn book numbers", async ({ page }) => {
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;

      let randomFirstIsbnIndex = await DataClass.generateIsbnIndex(count);
      let randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
      while(randomSecondIsbnIndex === randomFirstIsbnIndex) {
        console.log("Oops, the isbn is the same. Another isbn will be given");
        randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
      }
      const randomFirstIsbn = isbnNumbers[randomFirstIsbnIndex];
      const randomSecondIsbn = isbnNumbers[randomSecondIsbnIndex];
  
      // Add books to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomFirstIsbn]);
      expect(addBookToTheUser).toHaveProperty("status", 201);
      const addAnotherBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomSecondIsbn]);
      expect(addAnotherBookToTheUser).toHaveProperty("status", 201);
  
      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
      await page.getByText("Login");
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();
      await expect(page.getByText("User Name :")).toBeVisible();
      // await expect(page.getByRole('link', { name: 'Speaking JavaScript'})).toBeVisible();
    });
  });

  test.describe("Profile page", async () => {
    test.beforeEach("Create user with token & userId by calling API", async () => {
      createNewUser = await accountApi.createNewUser(userName, password);
      token = (await accountApi.generateToken(userName, password)).data.token;
      const authorization = await accountApi.authorization(userName, password);
      userId = createNewUser.data.userID;
      console.log(createNewUser.data);
    });
    test('Go To Book Store button check', async ({ page }) => {
      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      // await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
      await page.getByRole('button', { name: 'Login' }).click();
      await page.getByText("Login");
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();
      
      await page.goto("https://demoqa.com/books");
      //Click Go to book store button
      // await page.locator('#gotoStore').click();
      await expect(page).toHaveURL('https://demoqa.com/books');
    });
    test('Delete one book from the list check', async ({ page }) => {
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;
      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      randomIsbn = isbnNumbers[randomIsbnIndex];
  
      // Add books to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);
      expect(addBookToTheUser).toHaveProperty("status", 201);

      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      // await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
      await page.getByRole('button', { name: 'Login' }).click();
      await page.getByText("Login");
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();

      //Click delete any available book
      await page.locator('#delete-record-undefined').click();
      await expect(page.getByText('Delete Book')).toBeVisible();
      await expect(page.getByText('Do you want to delete this book?')).toBeVisible();
    });
    test('Delete All Books button check', async ({ page }) => {
      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      // await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
      await page.getByRole('button', { name: 'Login' }).click();
      await page.getByText("Login");
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();

      //Click delete all books button
      await page.getByRole('button', { name: "Delete All Books" }).click();
      await page.getByText('Do you want to delete all books?').isVisible();
      await expect(page).toHaveURL('https://demoqa.com/profile');
    });
  });
});
/*delete flow
      await page.locator("#delete-record-undefined").click();
      await expect(page.getByText("Do you want to delete this book?")).toBeVisible();
      await page.getByRole('button', { name: 'OK'}).click();
      await expect(page.getByText("User Name :")).toBeVisible();
*/

/*
test('test', async ({ page }) => {
  await page.goto('https://demoqa.com/');
  await page.locator('div').filter({ hasText: /^Book Store Application$/ }).nth(2).click();
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByPlaceholder('UserName').click();
  await page.getByPlaceholder('UserName').fill('testUser1712771922098');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('1qaz@WSX');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByText('Profile').click();
  await page.getByRole('gridcell', { name: 'O\'Reilly Media' }).first().click();
  await page.getByRole('button', { name: 'Go To Book Store' }).click();
  await page.locator('li').filter({ hasText: 'Profile' }).click();
  await page.getByRole('row', { name: 'image Learning JavaScript' }).locator('path').click();
  await page.getByText('Delete Book×Close').click();
  await page.getByText('Do you want to delete this').click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('row', { name: 'image Learning JavaScript' }).locator('path').click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByRole('button', { name: 'Delete All Books' }).click();
  await page.getByLabel('Delete All Books').getByText('Delete All Books', { exact: true }).click();
  await page.getByText('Do you want to delete all').click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Delete All Books' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByRole('button', { name: 'Delete Account' }).click();
  await page.getByLabel('Delete Account').getByText('Delete Account').click();
  await page.getByText('Do you want to delete your').click();
  await page.getByText('Do you want to delete your').click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'OK' }).click();
  await page.goto('https://demoqa.com/login');
});
*/