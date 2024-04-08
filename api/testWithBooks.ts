//const assert = require('chai').assert; 
import { test } from '@playwright/test';
const BookStoreApi = require('./BookStoreApi');
const AccountApi = require('./AccountApi');
const { default: axios } = require('axios');
const expect = require("chai").expect;
require('dotenv').config({ path: './api/.env' });
const showLog = require('./logger').loggerToExport;
const DataClass = require('./data');
const {testUserData} = require('./credentials');
const HelpingFunctions = require('./helper');

let bookStoreApi = new BookStoreApi(process.env.HOST); //тут ловим то, что передали в командной строке HOST="demoqa.com" npm run ....
let accountApi = new AccountApi(process.env.HOST);
let helpingFunctions = new HelpingFunctions();
test.describe("Book Store API Swagger UI checks", function () { 
  let userId, token, randomIsbn;

test.describe("Receive all results when adding book to the user", function() {
  test.beforeEach(async function() {
    // showLog.info("***Before Test*** - Creating new user");
    ({userId, token} = await helpingFunctions.givenUserWithTokenAndUserId());
  })
  test.afterEach(async function() {
    // showLog.debug("***After Test*** - Deleting current user");
    try {
      const resultOfDeletingUser = await accountApi.deleteUser(userId, token);
      expect(resultOfDeletingUser.status).to.equal(204);
    } catch {
      showLog.error("Invalid user data for test.afterEach hook");
    } 
  })
  test("Add book to the user by isbn book number", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
    let count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex];

    // Add books to the user's collection
    const resultOfAddingBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);
    expect(resultOfAddingBook).to.have.property("status", 201);
  });
  test("Goal is to receive error 401 for Add book to the user by isbn book number", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
    let count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex];
    token = "Oops, replaced token ^_^";

    // Add books to the user's collection
    const resultOfAddingBookForUnauthorizedUser = await bookStoreApi.addBookToTheUserByIsbnWith401Error(userId, token, [randomIsbn]);
    expect(resultOfAddingBookForUnauthorizedUser).to.have.property("status", 401);
  });
  test("Goal is to receive error 400 for Add book to the user by isbn book number", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
    let count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex] + `invalidNumberToSeeError`;

    // Add books to the user's collection
    const resultOfAddingBookWithWrongData = await bookStoreApi.addBookToTheUserByIsbnWith400Error(userId, token, [randomIsbn]);
    expect(resultOfAddingBookWithWrongData).to.have.property("status", 400);
  });
})
test.describe("Receive all results when deleting the book from the user", function() {
  test.beforeEach(async function() {
    ({userId, token} = await helpingFunctions.givenUserWithTokenAndUserId());
  })
  test.afterEach(async function() {
    try {
      const resultOfDeletingUser = await accountApi.deleteUser(userId, token);
      expect(resultOfDeletingUser.status).to.equal(204);
    } catch {
      showLog.error("Invalid user data for test.afterEach hook");
    } 
  })
  test("Delete book from the user by isbn book number", async function () {
    randomIsbn = await helpingFunctions.getAssignedIsbn(userId, token);

    // Delete book from user's collection
    const resultOfDeletingBook = await bookStoreApi.deleteBookFromUserByIsbn(userId, token, [randomIsbn]);
    expect(resultOfDeletingBook).to.have.property("status", 204);
  });
  test("Goal is 400 error for Delete book from the user by isbn book number", async function () {
    randomIsbn = await helpingFunctions.getAssignedIsbn(userId, token);
    let oldRandomIsbn = randomIsbn;

    // Delete book from user's collection
    randomIsbn = "Oops ISBN is chnaged ^_^";
    const resultOfDeletingBook = await bookStoreApi.deleteBookFromUserByIsbn(userId, token, randomIsbn);
    expect(resultOfDeletingBook).to.have.property("status", 400);
    randomIsbn = oldRandomIsbn;
  });
  test("Goal is 401 error for Delete book from the user by isbn book number", async function () {
    randomIsbn = await helpingFunctions.getAssignedIsbn(userId, token);

    //Change token to receive 401 error
    token = "Oops, wrong token ^_^";

    // Delete book from user's collection
    const resultOfDeletingBookForUnauthorizedUser = await bookStoreApi.deleteBookFromUserByIsbn(userId, token, [randomIsbn]);
    expect(resultOfDeletingBookForUnauthorizedUser).to.have.property("status", 401);
  });
})
test.describe("Get information about 1 book by random ISBN", function() {
  test.beforeEach(async function() {
    ({userId, token} = await helpingFunctions.givenUserWithTokenAndUserId());
  })
  test.afterEach(async function() {
    try {
      const resultOfDeletingUser = await accountApi.deleteUser(userId, token);
      expect(resultOfDeletingUser.status).to.equal(204);
    } catch {
      showLog.error("Invalid user data for test.afterEach hook");
    } 
  })
  test("Get information about book by its isbn", async function () {
    randomIsbn = await helpingFunctions.getAssignedIsbn(userId, token);

    const informationAboutBookByIsbn = await bookStoreApi.getBookByIsbn([randomIsbn]);
    expect(informationAboutBookByIsbn).to.have.property("status", 200);
  });
  test("Goal is 400 error for Get information about book by its isbn chosen randomly", async function () {
    randomIsbn = (await helpingFunctions.getAssignedIsbn(userId, token)) + " and unknown ISBN text";

    const informationAboutBookByIsbn400Error = await bookStoreApi.getBookByIsbn([randomIsbn]);
    expect(informationAboutBookByIsbn400Error).to.have.property("status", 400);
  });
})
test.describe("Delete all books from user", function() {
  test.beforeEach(async function() {
    ({userId, token} = await helpingFunctions.givenUserWithTokenAndUserId());
    await helpingFunctions.getUserWithTwoBooks(userId, token);
  })
  test.afterEach(async function() {
    try {
      const resultOfDeletingUser = await accountApi.deleteUser(userId, token);
      expect(resultOfDeletingUser.status).to.equal(204);
    } catch {
      showLog.error("Invalid user data for test.afterEach hook");
    } 
  })
  test("Delete all books from the user by user id", async function() {
    const resultOfDeletingBooks = await bookStoreApi.deleteAllBooksFromUserByUserId(userId, token);
    expect(resultOfDeletingBooks).to.have.property("status", 204);
  });
  test("FIXED!!! Goal is 401 error for Delete all books from the the user by user id", async function() {
    let oldUserId = userId;
    userId = "Oops, user ID is changed ^_^";
    const resultOfDeletingBooks = await bookStoreApi.deleteAllBooksFromUserByUserId(userId, token);
    expect(resultOfDeletingBooks).to.have.property("status", 401);
    userId = oldUserId;
  });
})



// describe.only("Not working :( - Get information about all books", async function() {
//   test.beforeEach(async function() {
//     ({userId, token} = await helpingFunctions.givenUserWithTokenAndUserId());
//   })
//   test.afterEach(async function() {
//     try {
//       const resultOfDeletingUser = await accountApi.deleteUser(userId, token);
//       expect(resultOfDeletingUser.status).to.equal(204);
//     } catch {
//       showLog.error("Invalid user data for test.afterEach hook");
//     } 
//   })
//   test("all results", async function() {
//     const informationAboutBookByIsbn = await helpingFunctions.getAssignedAllIsbns(userId, token);
//     showLog.warn(informationAboutBookByIsbn)
//     expect(informationAboutBookByIsbn).to.have.property("status", 200);
//   })
// })
  test.skip("Error on demoqa ?! Looks like yes (checked) - (Put) Edit book by isbn book number for current user", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomFirstIsbnIndex = await DataClass.generateIsbnIndex(count);
    let randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    while(randomSecondIsbnIndex === randomFirstIsbnIndex) {
      showLog.error("Oops, the isbn is the same");
      randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    }
    const randomFirstIsbn = isbnNumbers[randomFirstIsbnIndex];
    const randomSecondIsbn = isbnNumbers[randomSecondIsbnIndex];

    // Add books to the user's collection
    const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomFirstIsbn]);
    showLog.error(userWithAddedBook.data); 
    expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);

    const result = await bookStoreApi.editBookByIsbnForUser(userId, token, [randomFirstIsbn], [randomSecondIsbn]);

    showLog.info(result.data); //if showLog.info(result); тогда мы увидим { status: 201, data: { books: [ [Object], [Object] ] } }, а если showLog.info(result.data), то isbns 
    expect(result).to.have.property("status", 201);
  });
});