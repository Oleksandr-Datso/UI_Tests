import { test, expect } from "@playwright/test";
import axios from "axios";
import { testUserData } from "../api/credentials";
import { AccountApi } from "../api/AccountApi";
import { BookStoreApi } from "../api/BookStoreApi";
import { DataClass } from "../api/data";
import { Table } from "../e2e/Table";
import { LoginPage } from "./LoginFunctions";


let accountApi = new AccountApi("https://demoqa.com");
let bookStoreApi = new BookStoreApi("https://demoqa.com");
let loginPage;

test.describe("Tests with Login", async () => {
  // Needed variables for creating user using in all tests
  let userName = `testUser${Date.now()}`;
  let password = "1qaz@WSX";
  let firstName = "testing first name";
  let lastName = "testing last name";
  let attributeName = "class";
  let book = "Speaking JavaScript";

  test.beforeEach("Create new user via API call", async ({ page }) => {
    await accountApi.createNewUser(userName, password);
    loginPage = new LoginPage(page);
  });
  // test.afterEach("End of the test", async ({ page }) => {
  // чого в мене автоматично не закривається браузер після тесту
  //   await page.close();
  // });
  test("Login page", async ({ page }) => {
    // const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login({userName, password});
    
    await expect(page).toHaveURL("https://demoqa.com/profile");
    await expect(page.getByText(userName)).toBeVisible();
  });
  test("Login page with empty data", async ({ page }) => {
    userName = "";
    await loginPage.open();
    await loginPage.login({userName, password});
    // Expect is present in method, need to find way to add it here instead
    expect(await loginPage.isInvalid(attributeName)).toBeTruthy();    
  });
  test("Register new user", async ({ page }) => {
    await loginPage.open();
    await loginPage.registerNewUser({firstName, lastName, userName, password});
    console.log("New registered user -> " + userName);

    // what expect to add here?
  });
  test("Register existing user", async ({ page }) => {
    await loginPage.open();
    await loginPage.registerNewUser({firstName, lastName, userName, password});

    expect(page.locator("#name")).toBeVisible();
    expect(page.getByText("User exists!")).toBeVisible();
  });
  test("Register new user with empty data", async ({ page }) => {
    await loginPage.open();
    userName = "";
    await loginPage.registerNewUser({firstName, lastName, userName, password});

    expect(await loginPage.isInvalid({userName, attributeName})).toBeTruthy();
  });
  test("Login back button from Registration page", async ({ page }) => {
    await loginPage.open();
    userName = "";
    await loginPage.registerNewUser({firstName, lastName, userName, password});
    await loginPage.backToLoginFromRegistration();

    expect(page).toHaveURL("https://demoqa.com/login");    
  });
  test("Book Store page", async ({ page }) => {
    await loginPage.open();
    await loginPage.navigateToBookStorePage();
    await expect(page).toHaveURL("https://demoqa.com/books");
  });
  test("Search book on Book Store page", async ({ page }) => {
    await loginPage.open();
    await loginPage.navigateToBookStorePage();
    await loginPage.searchBook(book);

    expect(await page.getByRole("link", {name: book})).toBeVisible();
  });
  test("Login button from Book Store page", async ({ page }) => {
    await loginPage.open();
    await loginPage.navigateToBookStorePage();
    await loginPage.navigateToLoginPage();

    expect(await page.getByText("Welcome,")).toBeVisible();
  });
  test("Check not loggin text when open Profile page without logged in", async ({ page }) => {
    await loginPage.open();
    await loginPage.navigateToProfilePage();

    expect(await page.locator("#notLoggin-label")).toBeVisible();
    expect(await page.getByText("Currently you are not logged into the Book Store application, please visit the ")).toBeVisible();
  });
  test("Check redirection to Login page after logged in", async ({ page }) => {
    await loginPage.open();
    await loginPage.login({userName, password});
    await loginPage.navigateToLoginPage();

    expect(await page.getByText("You are already logged in. View your ")).toBeVisible();
  });
  test("Logout", async ({ page }) => {
    await loginPage.open();
    await loginPage.login({userName, password});
    await loginPage.logout();

    expect(page).toHaveURL("https://demoqa.com/login");
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
      "Create user with token & userId by calling API", async () => {
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

    test("NEED UPDATE -> check added book!!! Add one random book to the user by isbn book number", async ({ page }) => {
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

      // await successfullyLogin(page, userName, password);

      // await page.goto("https://demoqa.com/");
      // await page.locator("div:nth-of-type(6)>div>.card-up").click();
      // await page
      //   .locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)")
      //   .click();
      // await page.getByText("Login");
      // await page.locator("#userName").fill(userName);
      // await page.locator("#password").fill(password);
      // await page.locator("#login").click();
      // await expect(page.getByText("User Name :")).toBeVisible();
      // // await expect(page.getByRole('link', { name: 'Speaking JavaScript'})).toBeVisible();
    });
    test("Why this test at all ? -> Goal is to receive error 401 for Add book to the user by isbn book number", async ({ page }) => {
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

      // await successfullyLogin(page, userName, password);
      // await page.goto("https://demoqa.com/");
      // await page.locator("div:nth-of-type(6)>div>.card-up").click();
      // await page
      //   .locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)")
      //   .click();
      // await page.getByText("Login");
      // await page.locator("#userName").fill(userName);
      // await page.locator("#password").fill(password);
      // await page.locator("#login").click();
      // await expect(page.getByText("User Name :")).toBeVisible();
    });
    test("why this test ? -> Goal is to receive error 400 for Add book to the user by isbn book number", async ({ page }) => {
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

      // await successfullyLogin(page, userName, password);
      // await page.goto("https://demoqa.com/");
      // await page.locator("div:nth-of-type(6)>div>.card-up").click();
      // await page
      //   .locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)")
      //   .click();
      // await page.getByText("Login");
      // await page.locator("#userName").fill(userName);
      // await page.locator("#password").fill(password);
      // await page.locator("#login").click();
      // await expect(page.getByText("User Name :")).toBeVisible();
    });
    test("Where is check books on UI? -> Add two random books to the user by isbn book numbers", async ({ page }) => {
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

      // await successfullyLogin(page, userName, password);
      // await page.goto("https://demoqa.com/");
      // await page.locator("div:nth-of-type(6)>div>.card-up").click();
      // await page
      //   .locator(".collapse.element-list.show > .menu-list > li:nth-of-type(1)")
      //   .click();
      // await page.getByText("Login");
      // await page.locator("#userName").fill(userName);
      // await page.locator("#password").fill(password);
      // await page.locator("#login").click();
      // await expect(page.getByText("User Name :")).toBeVisible();
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

    test("Add random book by ISBN, check its title and delete it", async ({ page }) => {
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
