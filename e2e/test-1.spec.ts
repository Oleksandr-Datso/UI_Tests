import { test, expect, chromium } from "@playwright/test";
import axios from "axios";
import { testUserData } from "../api/credentials";
import { AccountApi } from "../api/AccountApi";
import { BookStoreApi } from "../api/BookStoreApi";
import { DataClass } from "../api/data";
import { Table } from "../e2e/Table";
import { loginPageCheckWhenLoggedIn, bookStoreCheckWithGetByRole, bookStoreCheck, bookStoreWhenLogin, failedLogin, logoutAfterLogin, successfullyLogin } from "./LoginFunctions";


let accountApi = new AccountApi("https://demoqa.com");
let bookStoreApi = new BookStoreApi("https://demoqa.com");

test.describe("Placeholder for describe", async () => {
  // Needed variables for creating user using in all tests
  let userName = `testUser${Date.now()}`;
  let password = "1qaz@WSX";

  test.beforeEach("Create new user via API call", async () => {
    await accountApi.createNewUser(userName, password);
  });
  // test.afterEach("End of the test", async ( page ) => {
  //   await page.close();
  // });

  test("Successfully Login", async ({ page }) => {
    await successfullyLogin(page, userName, password);
    await page.close();
  });
  test("Login Failed with empty fields", async ({ page }) => {
    await failedLogin(page);
    await page.close();
  });
  test("Log out after successfully Login", async ({ page }) => {
    await logoutAfterLogin(page, userName, password);
    await page.close();
  });
  test("Check book store availability when logged in", async ({ page }) => {
    await bookStoreWhenLogin(page, userName, password);
    await page.close();
  })
  test("Check book store availability", async ({ page }) => {
    await bookStoreCheck(page);
    await page.close();
  });
  test("Check book store availability using getByRoleOrLabel", async ({ page }) => {
    await bookStoreCheckWithGetByRole(page, userName, password);
    await page.close();
  });
  test("Navigate to Login page when successfully Login", async ({ page }) => {
    await loginPageCheckWhenLoggedIn(page, userName, password);
    await page.close();
  });
});

test.describe("Add books via API call to the created user by another API", async () => {
  //For creating user needed variables:
  let userName = `testUser${Date.now()}`;
  let password = "1qaz@WSX";

  //For do actions with books needed variables:
  let createNewUser, userId, token, randomIsbn;

  test.describe("Receive all results when adding book to the user", async () => {
    test.beforeEach(
      "Create user with token & userId by calling API",
      async () => {
        createNewUser = await accountApi.createNewUser(userName, password);
        token = (await accountApi.generateToken(userName, password)).data.token;
        const authorization = await accountApi.authorization(
          userName,
          password
        );
        userId = createNewUser.data.userID;
        console.log(createNewUser.data);
      }
    );

    test("Add one random book to the user by isbn book number", async ({
      page,
    }) => {
      test.slow();
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;
      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      randomIsbn = isbnNumbers[randomIsbnIndex];

      // Add books to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        [randomIsbn]
      );
      expect(addBookToTheUser).toHaveProperty("status", 201);
      console.log(createNewUser.data.books); //If I add book, it is not shown, why?!

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
      // await expect(page.getByRole('link', { name: 'Speaking JavaScript'})).toBeVisible();
    });
    test("Goal is to receive error 401 for Add book to the user by isbn book number", async ({
      page,
    }) => {
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;
      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      randomIsbn = isbnNumbers[randomIsbnIndex];
      token = "Oops, replaced token ^_^";

      // Add books to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        [randomIsbn]
      );
      expect(addBookToTheUser).toHaveProperty("status", 401);

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
    test("Goal is to receive error 400 for Add book to the user by isbn book number", async ({
      page,
    }) => {
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;
      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      randomIsbn = isbnNumbers[randomIsbnIndex] + `invalidNumberToSeeError`;
      console.log(randomIsbn);

      // Add books to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        [randomIsbn]
      );
      expect(addBookToTheUser).toHaveProperty("status", 400);

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
    test("Add two random books to the user by isbn book numbers", async ({
      page,
    }) => {
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;

      let randomFirstIsbnIndex = await DataClass.generateIsbnIndex(count);
      let randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
      while (randomSecondIsbnIndex === randomFirstIsbnIndex) {
        console.log("Oops, the isbn is the same. Another isbn will be given");
        randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
      }
      const randomFirstIsbn = isbnNumbers[randomFirstIsbnIndex];
      const randomSecondIsbn = isbnNumbers[randomSecondIsbnIndex];

      // Add books to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        [randomFirstIsbn]
      );
      expect(addBookToTheUser).toHaveProperty("status", 201);
      const addAnotherBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        [randomSecondIsbn]
      );
      expect(addAnotherBookToTheUser).toHaveProperty("status", 201);

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
      // await expect(page.getByRole('link', { name: 'Speaking JavaScript'})).toBeVisible();
    });
  });

  test.describe("Profile page", async () => {
    userName = `testUser${Date.now()}`;
    password = "1qaz@WSX";

    test.beforeEach(
      "Create user with token & userId by calling API",
      async () => {
        createNewUser = await accountApi.createNewUser(userName, password);
        token = (await accountApi.generateToken(userName, password)).data.token;
        const authorization = await accountApi.authorization(
          userName,
          password
        );
        userId = createNewUser.data.userID;
        // console.log(createNewUser.data);
      }
    );

    test("Go To Book Store button check", async ({ page }) => {
      test.slow();
      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      // await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
      await page.getByRole("button", { name: "Login" }).click();
      await page.getByText("Login");
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();

      await page.goto("https://demoqa.com/books");
      await page.waitForSelector('//*[@id="see-book-Git Pocket Guide"]', {
        state: "visible",
        timeout: 10000,
      });
      await page.getByRole("link", { name: "Git Pocket Guide" }).isVisible();
      //Click Go to book store button
      // await page.locator('#gotoStore').click();
      await expect(page).toHaveURL("https://demoqa.com/books");
    });

    test("Add random book by ISBN, check its title and delete it", async ({
      page,
    }) => {
      test.slow();
      // Add book by random ISBN
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;
      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      randomIsbn = isbnNumbers[randomIsbnIndex];
      await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        [9781449325862, 9781449337711]
      );
      // await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);

      await page.goto("https://demoqa.com/login");
      await page.getByText("Login");
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();

      await expect(page).toHaveURL("https://demoqa.com/profile");
      await page.waitForSelector("#searchBox", {
        state: "visible",
        timeout: 10000,
      });

      const table = new Table(await page.locator("[role='grid']"));
      const returnedTitle = await table.getBookTitleToBeReturned();
      console.log("Returned title from method -> " + returnedTitle);

      // Put returned value into quotes to use it in further checks with page.getByText
      const returnedTitleIntoQuotes = `"` + returnedTitle[0] + `"`;

      await page.getByText(returnedTitleIntoQuotes).isVisible();
      // Delete book flow
      await page
        .getByRole("gridcell", { name: "Delete" }).first()
        .locator("path")
        .click();
      expect(await page.getByText("Delete Book").isVisible());
      expect(await page.getByText("Do you want to delete this").isVisible());
      await page.getByRole("button", { name: "Cancel" }).click();
      await page
        .getByRole("gridcell", { name: "Delete" }).first()
        .locator("path")
        .click();
      await page.getByRole("button", { name: "OK" }).click();
    });

    test('Add random book by ISBN and delete it by clicking "delete" icon on UI', async ({
      page,
    }) => {
      test.slow();
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;
      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      randomIsbn = isbnNumbers[randomIsbnIndex];

      // Add books to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        [randomIsbn]
      );
      expect(addBookToTheUser).toHaveProperty("status", 201);

      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      await page.getByRole("button", { name: "Login" }).click();
      await page.getByText("Welcome").isVisible();
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.keyboard.press("Enter");
      // await page.locator("#login").click();
      await page.waitForSelector("#userName-label", {
        state: "visible",
        timeout: 10000,
      });
      await page
        .locator(".collapse.element-list.show > .menu-list > li:nth-of-type(3)")
        .click();
      await expect(page.getByText("Books :")).toBeVisible();

      //Click delete any available book
      await page.locator("#delete-record-undefined").click();
      await expect(page.getByText("Delete Book")).toBeVisible();
      await expect(
        page.getByText("Do you want to delete this book?")
      ).toBeVisible();
      await page.locator("#closeSmallModal-ok").click();
    });
    test('"Delete All Books" button check without books', async ({ page }) => {
      test.slow();
      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      // await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
      await page.getByRole("button", { name: "Login" }).click();
      await page.getByText("Login");
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();
      await expect(page.getByText("User Name :")).toBeVisible();

      await page.locator("li").filter({ hasText: "Profile" }).click();
      // await page.locator("//div[@id='app']/div[@class='body-height']/div[@class='container playgound-body']/div[@class='row']//div[@class='accordion']/div[6]/div/ul[@class='menu-list']/li[3]/span[@class='text']").click();
      //Click delete all books button
      await expect(
        page.getByRole("textbox", { name: "Type to search" })
      ).toBeVisible();
      await page.getByRole("button", { name: "Delete All Books" }).click();
      await page.getByText("Do you want to delete all books?").isVisible();
    });
    test('"Delete All Books" button check with books', async ({ page }) => {
      test.slow();

      await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        [
          9781449325862, 9781449331818, 9781449337711, 9781449365035,
          9781491904244, 9781491950296, 9781593275846, 9781593277574,
        ]
      );

      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();

      //Login with user credentials
      await page.getByRole("button", { name: "Login" }).click();
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();
      await expect(page.getByText("User Name :")).toBeVisible();
      await page.locator("li").filter({ hasText: "Profile" }).click();

      //Click delete all books button
      await expect(
        page.getByRole("textbox", { name: "Type to search" })
      ).toBeVisible();
      await page.getByRole("button", { name: "Delete All Books" }).click();
      await page.getByText("Do you want to delete all books?").isVisible();
      await page.locator("#closeSmallModal-ok").click();

      //Check that rows do not contain any data
      await page.reload();
      await expect(page.getByText("User Name :")).toBeVisible();

      const emptyTableRows = await page
        .locator("[role='rowgroup']")
        .allInnerTexts();
      expect(emptyTableRows.length).toBe(5);

      const table = new Table(await page.locator("[role='grid']"));
      let arr = await table.getBookPublisher();

      // let arr = emptyTableRows.includes(' '); //тут false, як тоді зробити норм перевірку?
      console.log(arr);
      expect(arr).toHaveLength(0);
    });
    test("Delete first book from the list of all books", async ({ page }) => {
      test.slow();

      // Add manually all books by isbns
      await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        [
          9781449325862, 9781449331818, 9781449337711, 9781449365035,
          9781491904244, 9781491950296, 9781593275846, 9781593277574,
        ]
      );

      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      // await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();

      //Login with user credentials
      await page.getByRole("button", { name: "Login" }).click();
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();
      await expect(page.getByText("User Name :")).toBeVisible();
      await page.locator("li").filter({ hasText: "Profile" }).click();

      await expect(page.getByText("User Name :")).toBeVisible();

      const table = new Table(await page.locator("[role='grid']"));
      await table.getBookTitle();

      await page.locator("#delete-record-undefined").first().click(); //The saem as -> await page.locator('#delete-record-undefined').nth(0).click();
      await page.getByText("Do you want to delete this book?").isVisible();
      await page.locator("#closeSmallModal-ok").click();

      // Need to reload page to see changes
      await page.reload();
      await expect(page.getByText("User Name :")).toBeVisible();
      console.log("- - - - - -");
      await table.getBookTitle();
    });
    test('"Delete Account" button check', async ({ page }) => {
      test.slow();
      await page.goto("https://demoqa.com/");
      await page.locator("div:nth-of-type(6)>div>.card-up").click();
      // await page.locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)").click();
      await page.getByRole("button", { name: "Login" }).click();
      await page.getByText("Login");
      await page.locator("#userName").fill(userName);
      await page.locator("#password").fill(password);
      await page.locator("#login").click();
      await expect(page.getByText("User Name :")).toBeVisible();

      await page.locator("li").filter({ hasText: "Profile" }).click();
      await expect(
        page.getByRole("textbox", { name: "Type to search" })
      ).toBeVisible();
      await page.getByRole("button", { name: "Delete Account" }).click();
      await page.getByText("Do you want to delete your account?").isVisible();
      await page.getByRole("button", { name: "Cancel" }).click();
      await page.getByRole("button", { name: "Delete Account" }).click();
      await page.getByRole("button", { name: "OK" }).click();
      await page.getByText("Welcome").isVisible();
    });
  });

  test.describe("Show images, titles, authors, publishers", async () => {
    test("Shows titles of all available books", async ({ page }) => {
      test.slow();
      await page.goto("https://demoqa.com/books");
      const table = new Table(await page.locator("[role='grid']"));
      await table.getBookTitle();
    });
    test("Shows authors of all available books", async ({ page }) => {
      test.slow();
      await page.goto("https://demoqa.com/books");
      const table = new Table(await page.locator("[role='grid']"));
      await table.getBookAuthor();
    });
    test("Shows books publishers", async ({ page }) => {
      test.slow();
      await page.goto("https://demoqa.com/books");
      const table = new Table(await page.locator("[role='grid']"));
      await table.getBookPublisher();
    });
  });
});

/*
test('test', async ({ page }) => {
  await page.goto('https://demoqa.com/books');
  await page.getByPlaceholder('Type to search').click();
  await page.locator('.ReactTable').click();
  await page.getByRole('row', { name: 'image Git Pocket Guide' }).getByRole('img').click();
  await page.getByRole('gridcell', { name: 'Git Pocket Guide' }).click();
  await page.getByRole('gridcell', { name: 'Richard E. Silverman' }).click();
  await page.getByRole('row', { name: 'image Git Pocket Guide' }).getByRole('gridcell').nth(3).click();
  await page.getByText('Image', { exact: true }).click({
    button: 'right'
  });
  await page.getByRole('columnheader', { name: 'Image' }).click();
  await page.getByRole('columnheader', { name: 'Image' }).click();
  await page.getByText('Image', { exact: true }).click();
  await page.getByRole('columnheader', { name: 'Title' }).click();
  await page.getByText('Title').click();
  await page.getByRole('columnheader', { name: 'Author' }).click();
  await page.getByText('Author').click();
  await page.getByRole('columnheader', { name: 'Publisher' }).click();
  await page.getByText('Publisher').click();
});


  await page.goto('https://demoqa.com/');
  await page.locator('div').filter({ hasText: /^Book Store Application$/ }).nth(2).click();
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByPlaceholder('UserName').click();
  await page.getByPlaceholder('UserName').fill('testUser1713340108738');
  await page.getByPlaceholder('UserName').press('Tab');
  await page.getByPlaceholder('Password').fill('1qaz@WSX');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByPlaceholder('Type to search').click();
  await page.locator('li').filter({ hasText: 'Login' }).click({
    button: 'right'
  });
  await page.locator('li').filter({ hasText: 'Login' }).click();
  await page.locator('li').filter({ hasText: 'Profile' }).click();
  await page.getByRole('rowgroup').first().click();
  await page.getByText('Book Store', { exact: true }).click();
  await page.getByText('Author').click();
  await page.locator('li').filter({ hasText: 'Profile' }).click();
  await page.getByPlaceholder('Type to search').click();
  await page.locator('li').filter({ hasText: /^Book Store$/ }).click();
  await page.getByText('User Name :').click({
    button: 'right'
  });
*/
