import { test, expect } from "@playwright/test";
import axios from "axios";
import { testUserData } from "../api/credentials";
import { AccountApi } from "../api/AccountApi";
import { BookStoreApi } from "../api/BookStoreApi";
import { DataClass } from "../api/data";
import { Table } from "../e2e/Table";
import { LoginPage } from "./LoginFunctions";
import { allure } from "allure-playwright";
  // Needed variables for creating user using in all tests
import { defaultUserName, defaultPassword, defaultFirstName, defaultLastName, defaultAttributeName, defaultBook } from "./Data"; 


let accountApi = new AccountApi("https://demoqa.com");
let bookStoreApi = new BookStoreApi("https://demoqa.com");
let loginPage, userName, password, firstName, lastName, attributeName, book;

function usernameGenerator() {
  let word = "user";  
  let numbers = (Math.floor(100000 + Math.random() * 900000));
  let result = `${word}${numbers}`;
  console.log(result);
  return result;
}
function passGen() {
  const bigLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const smallLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '@#$%&*';
  let result = '';

  for (let i=0; i<4; i++) {
    const randomIndex = Math.floor(Math.random() * bigLetters.length);
    result += bigLetters[randomIndex];
  }
  console.log("The password is = " + result);
  for (let i=0; i<4; i++) {
    const randomIndex = Math.floor(Math.random() * smallLetters.length);
    result += smallLetters[randomIndex];
  }
  console.log("The password is = " + result);
  for (let i=0; i<4; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    result += numbers[randomIndex];
  }
  console.log("The password is = " + result);
  for (let i=0; i<2; i++) {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    result += symbols[randomIndex];
  }
  console.log("The password is = " + result);
  return password;
}
function passwordGenerator() {
  let result = '@A';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for(let i=0; i<8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  console.log(result);
  return result;
}

test("check open", async({ page }) => {
  test.slow();
  loginPage = new LoginPage(page);
  await loginPage.open();
})

test.describe("Tests with Login", async () => {

  test.beforeEach("Create new user via API call", async ({ page }) => {
    // Set default values before each test
    userName = usernameGenerator();
    password = passwordGenerator();
    firstName = defaultFirstName;
    lastName = defaultLastName;
    attributeName = defaultAttributeName;
    book = defaultBook;

    await accountApi.createNewUser(userName, password);
    loginPage = new LoginPage(page);
  });
  // test.afterEach("End of the test", async ({ page }) => {
  // чого в мене автоматично не закривається браузер після тесту
  //   await page.close();
  // });
  test("Login page", {tag: '@positiveTests'}, async ({ page }) => {
    test.slow();
    await loginPage.open();
    await allure.step("Add credentials and click login button", async () => {
      await loginPage.login({userName, password});
    });
    await allure.step("Expect checks", async () => {
      await expect(page).toHaveURL("https://demoqa.com/profile");
      await expect(page.getByText(userName)).toBeVisible();
    })
  });
  test("Login page with empty data", async ({ page }) => {
    test.slow();
    userName = "";
    await allure.step("Open the login page", async () => {
      await loginPage.open();
    });
    await allure.step("Add credentials and click login button", async () => {
      await loginPage.login({userName, password});
    });
    expect(await loginPage.isInvalid(attributeName)).toBeTruthy();    
  });
  test("Register new user", {tag: '@positiveTests'}, async ({ page }) => {
    test.slow();
    await allure.step("Open the login page", async () => {
      await loginPage.open();
    });
    await loginPage.registerNewUser({firstName, lastName, userName, password});
    console.log("New registered user -> " + userName);

    // what expect to add here?
  });
  test("Register existing user", async ({ page }) => {
    test.slow();
    await allure.step("Open the login page", async () => {
      await loginPage.open();
    });
    await loginPage.registerNewUser({firstName, lastName, userName, password});

    expect(await page.getByText('User exists!').isVisible());
    expect(await page.getByRole('heading', { name: 'Register', exact: true }).isVisible());
    // expect(await page.getByText("Register to Book Store")).toBeVisible(); // ТАК ПОКАЗУЄ ЕРРОР. цікаво, тому що ми поза дужок експекту
    // expect(page.locator('//*[@id="name"]')).toBeVisible();
    // expect(page.locator("#name")).toContainText("User exists!");
  });
  test("Register new user with empty data", async ({}) => {
    test.slow();
    await allure.step("Open the login page", async () => {
      await loginPage.open();
    });
    userName = "";
    await loginPage.registerNewUser({firstName, lastName, userName, password});

    expect(await loginPage.isInvalid(attributeName)).toBeTruthy();
  });
  test("Login back button from Registration page", async ({ page }) => {
    test.slow();
    await allure.step("Open the login page", async () => {
      await loginPage.open();
    });
    userName = "";
    await loginPage.registerNewUser({firstName, lastName, userName, password});
    await loginPage.backToLoginFromRegistration();

    expect(await page.getByText("Login in Book Store").isVisible());
    await expect(page).toHaveURL("https://demoqa.com/login");    
  });
  test("Book Store page", {tag: '@positiveTests'}, async ({ page }) => {
    test.slow();
    await allure.step("Open the login page", async () => {
      await loginPage.open();
    });
    await loginPage.navigateToBookStorePage();
    await expect(page).toHaveURL("https://demoqa.com/books");
  });
  test("Search book on Book Store page", {tag: '@positiveTests'}, async ({ page }) => {
    test.slow();
    await allure.step("Open the login page", async () => {
      await loginPage.open();
    });
    await loginPage.navigateToBookStorePage();
    await loginPage.searchBook(book);

    expect(await page.getByRole("link", {name: book}).isVisible());
  });
  test("Login button from Book Store page", {tag: '@positiveTests'}, async ({ page }) => {
    test.slow();
    await allure.step("Open the login page", async () => {
      await loginPage.open();
    });
    await loginPage.navigateToBookStorePage();
    await loginPage.navigateToLoginPage();

    expect(await page.getByText("Login in Book Store").isVisible());
  });
  test("Check not loggin text when open Profile page without logged in", async ({ page }) => {
    test.slow();
    await allure.step("Open the login page", async () => {
      await loginPage.open();
    });
    await loginPage.navigateToProfilePage();

    expect(await page.locator("#notLoggin-label").isVisible());
    expect(await page.getByText("Currently you are not logged into the Book Store application, please visit the ").isVisible());
  });
  test("Check redirection to Login page after logged in", {tag: '@positiveTests'}, async ({ page }) => {
    test.slow();
    await allure.step("Open the login page", async () => {
      await loginPage.open();
    });
    await loginPage.login({userName, password});
    await loginPage.redirectToLoginPage();

    expect(await page.getByText("You are already logged in. View your ").isVisible());
  });
  test("Logout", {tag: '@positiveTests'}, async ({ page }) => {
    test.slow();
    await allure.step("Open the login page", async () => {
      await loginPage.open();
    });
    await loginPage.login({userName, password});
    await loginPage.logout();

    expect(await page.getByText("Login in Book Store").isVisible());
    await expect(page).toHaveURL("https://demoqa.com/login");
  });
});


test.describe("Add books via API call to the created user by another API", async () => {
  //For creating user needed variables:
  let userName = `testUser${Date.now()}`;
  let password = "1qaz@WSX";
  let book = "Speaking JavaScript";
  let isbnNumber = "9781449365035";
  let listOfBooksIsbns =         
  [
    9781449325862, 9781449331818, 9781449337711, 9781449365035,
    9781491904244, 9781491950296, 9781593275846, 9781593277574,
  ];

  //For do actions with books needed variables:
  let createNewUser, userId, token, randomIsbn;

  test.describe("Receive all results when adding book to the user", async () => {
    test.beforeEach("Create new user via API call", async ({ page }) => {
      createNewUser = await accountApi.createNewUser(userName, password);
      token = (await accountApi.generateToken(userName, password)).data.token;
      userId = createNewUser.data.userID;
      loginPage = new LoginPage(page); 
    });
    test("Check added book!!! Add one book to the user by isbn book number", async ({ page }) => {
      const isbnNumberField = isbnNumber;

      // Add book to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        [isbnNumberField]
      );
      expect(addBookToTheUser).toHaveProperty("status", 201);
      // Update data for the created user (to see books)
      createNewUser = await accountApi.getUser(userId, token);
      console.log(createNewUser.data.books);

      await allure.step("Open the login page", async () => {
        await loginPage.open();
      });
      await loginPage.login({userName, password});
      await expect(page).toHaveURL("https://demoqa.com/profile");
      await expect(page.getByRole("link", {name: "Speaking JavaScript"})).toContainText("Speaking JavaScript");
    });

    test("Check added book!!! Add one random book to the user by isbn book number", async ({ page }) => {
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
      createNewUser = await accountApi.getUser(userId, token);
      // Update data for the created user (to see books)
      console.log(createNewUser.data.books);
      console.log("ISBN = " + randomIsbn);

      await allure.step("Open the login page", async () => {
        await loginPage.open();
      });
      await loginPage.login({userName, password});
      await expect(page).toHaveURL("https://demoqa.com/profile");
      await loginPage.isbnsSwitch(randomIsbn);

    });
    test("Check that there are no added books due to invalid token", async ({ page }) => {
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

      await allure.step("Open the login page", async () => {
        await loginPage.open();
      });
      await loginPage.login({userName, password});
      await expect(page).toHaveURL("https://demoqa.com/profile");

      await page.waitForSelector("[role='rowgroup']", { state: 'visible', timeout: 3000});
      const emptyTableRows = await page.locator("[role='rowgroup']").all(); //.allInnerTexts();
      expect(emptyTableRows.length).toBe(5);

      const table = new Table(await page.locator("[role='grid']"));
      let arr = await table.getBookTitle();

      const result = arr.length > 0 ? arr[0] : "The field is empty";
      console.log("The result of the checking first book is -> " + (result !== undefined ? result : "Sorry, there are no added books..."));
      expect(result).toBeUndefined();
    });
    test("Check that there are no added books due to invalid isbn number", async ({ page }) => {
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbn numbers").toBeGreaterThan(0);
      let count = isbnNumbers.length;
      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      randomIsbn = isbnNumbers[randomIsbnIndex] + `invalidNumberToSeeError`;

      // Add books to the user's collection
      const addBookToTheUser = await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        [randomIsbn]
      );
      expect(addBookToTheUser).toHaveProperty("status", 400);

      await allure.step("Open the login page", async () => {
        await loginPage.open();
      });
      await loginPage.login({userName, password});
      await expect(page).toHaveURL("https://demoqa.com/profile");

      await page.waitForSelector("[role='rowgroup']", { state: 'visible', timeout: 3000});
      const emptyTableRows = await page.locator("[role='rowgroup']").all();
      expect(emptyTableRows.length).toBe(5);

      const table = new Table(await page.locator("[role='grid']"));
      let arr = await table.getBookTitle();

      const result = arr.length > 0 ? arr[0] : "The field is empty";
      console.log("The result of the checking first book is -> " + (result !== undefined ? result : "Sorry, there are no added books..."));
      expect(result).toBeUndefined();
    });
    test("Add two random books to the user by isbn book numbers", async ({ page }) => {
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

//       // Add books to the user's collection
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
      
      createNewUser = await accountApi.getUser(userId, token);
      // Update data for the created user (to see books)
      console.log(createNewUser.data.books);
      console.log("ISBN #1 = " + randomFirstIsbn);
      console.log("ISBN #2 = " + randomSecondIsbn);

      await allure.step("Open the login page", async () => {
        await loginPage.open();
      });
      await loginPage.login({userName, password});
      await expect(page).toHaveURL("https://demoqa.com/profile");
      await loginPage.isbnsSwitch(randomFirstIsbn);
      await loginPage.isbnsSwitch(randomSecondIsbn);
    });
  });

  test.describe("Profile page", async () => {
    userName = `testUser${Date.now()}`;
    password = "1qaz@WSX";

    test.beforeEach("Create new user with token & userId by calling API", async ({ page }) => {
        createNewUser = await accountApi.createNewUser(userName, password);
        token = (await accountApi.generateToken(userName, password)).data.token;
        const authorization = await accountApi.authorization(userName, password);
        userId = createNewUser.data.userID;
        loginPage = new LoginPage(page);
      }
    );

    test("Go To Book Store button check", async ({ page }) => {
      test.slow();
      await allure.step("Open the login page", async () => {
        await loginPage.open();
      });
      await loginPage.login({userName, password});

      await page.goto("https://demoqa.com/books");
      await page.waitForSelector('//*[@id="see-book-Git Pocket Guide"]', {
        state: "visible",
        timeout: 5000,
      });
      await page.getByRole("link", { name: "Git Pocket Guide" }).isVisible();
      //Click Go to book store button
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

      await allure.step("Open the login page", async () => {
        await loginPage.open();
      });
      await loginPage.login({userName, password});
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
      await loginPage.deleteBook();
    });
    test('"Delete All Books" button check without books', async ({ page }) => {
      test.slow();
      await allure.step("Open the login page", async () => {
        await loginPage.open();
      });
      await loginPage.login({userName, password});
      await expect(page.getByText("User Name :")).toBeVisible();
      await loginPage.deletAllBooksPopUp();
      await loginPage.confirmButton();
      await page.reload();

      await page.waitForSelector("[role='rowgroup']", {state: "visible", timeout: 3000});
      const emptyTableRows = await page.locator("[role='rowgroup']").all();
      expect(emptyTableRows.length).toBe(5);

      const table = new Table(await page.locator("[role='grid']"));
      let arr = await table.getBookTitle();

      const result = arr.length > 0 ? arr[0] : "The field is empty";
      console.log("The result of the checking first book is -> " + (result !== undefined ? result : "Sorry, there are no added books..."));
      expect(result).toBeUndefined();
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

      await allure.step("Open the login page", async () => {
        await loginPage.open();
      });
      await loginPage.login({userName, password});

      await expect(page.getByText("User Name :")).toBeVisible();
      await page.locator("li").filter({ hasText: "Profile" }).click();

      //Click delete all books button
      await loginPage.deletAllBooksPopUp();
      await loginPage.confirmButton();

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
      // Add manually all books by isbns
      await bookStoreApi.addBookToTheUserByIsbn(
        userId,
        token,
        listOfBooksIsbns
      );

      await allure.step("Open the login page", async () => {
        await loginPage.open();
      });
      await loginPage.login({userName, password});

      await expect(page.getByText("User Name :")).toBeVisible();
      const table = new Table(await page.locator("[role='grid']"));
      let array1 = [];
      array1 = await table.getBookTitle();

      await loginPage.deleteFirstInstanceInRow();
      console.log("- - - - - -");

      // Need to reload page to see changes
      await page. reload();
      await expect(page.getByText("User Name :")).toBeVisible();
      let array2 = [];
      array2 = await table.getBookTitle();

      for (let i=0; i<array2.length; i++) {
        if (array1[i] === array2[i]) {
          throw new Error("The first instance is not deleted!");
        }
      }
    });
    test('"Delete Account" button check', async ({ page }) => {
      await allure.step("Open the login page", async () => {
        await loginPage.open();
      });
      await loginPage.login({userName, password});
      await expect(page.getByText("User Name :")).toBeVisible();

      await page.locator("li").filter({ hasText: "Profile" }).click();
      await expect(
        page.getByRole("textbox", { name: "Type to search" })
      ).toBeVisible();
      await loginPage.deleteAccount();
      await loginPage.confirmButton();
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
