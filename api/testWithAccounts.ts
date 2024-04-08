import axios from "axios";
import { expect } from 'chai';
import { test } from '@playwright/test';
const BookStoreApi = require('./BookStoreApi');
const AccountApi = require('./AccountApi');
// const { default: axios } = require('axios');
require('dotenv').config({ path: './api/.env' });
const showLog = require('./logger').loggerToExport;
const DataClass = require('./data');
const {testUserData} = require('./credentials');
const HelpingFunctions = require('./helper');

// Use dynamic import for Chai
// import('chai').then(chai => {
//     const expect = chai.expect;
//   });

let accountApi = new AccountApi(process.env.HOST);
let bookStoreApi = new BookStoreApi(process.env.HOST);
let helpingFunctions = new HelpingFunctions();

test.describe("User creation endpoint", function() {
  let userName, password, userId, token, userIsCreated;

  test.beforeEach(async function() {
    userName = testUserData.userName();
    password = testUserData.password;
  })
  test.afterEach(async function() {
    try {
      if (userIsCreated === 201) {
        token = (await accountApi.generateToken(userName, password)).data.token;
        userId = userIsCreated.data.userID;
        const deleteCreatedUser = await accountApi.deleteUser(userId, token);
        expect(deleteCreatedUser).to.have.property("status", 204);
      }
    }
    catch {
      showLog.error("Catch is shown in afterEach hook -> User is not existing and cannot be deleted");
    }
  })
  test.only("Returns 201 status for creating new user", async function () {
    userIsCreated = await accountApi.createNewUser(userName, password);
    showLog.info(userIsCreated.data);
    // expect(userIsCreated).to.have.property("status", 201);
    // expect(userIsCreated.status).to.equal(201);
  });
  test("Returns 400 status with invalid data for creating new user", async function () {
    userIsCreated = await accountApi.createUserWithInvalidData("", "");
    expect(userIsCreated).to.have.property("status", 400);
  });
  test("Returns 406 status for creating already existing user", async function () {
    userIsCreated = await accountApi.createNewUser(userName, password);
    const creatingTheSameUser = await accountApi.createAlreadyCreatedUser(userName, password);
    expect(creatingTheSameUser).to.have.property("status", 406);
  });
})
test.describe("Authorization endpoint", function() {
  let userName, password, userId, token, createNewUser;

  test.beforeEach(async function() {  
    ({userName, password, createNewUser, token} = await helpingFunctions.givenUserWithToken());    
    // ({userId, token} = await helpingFunctions.givenUserWithTokenAndUserId());
  })
  test.afterEach(async function() {
    userId = createNewUser.data.userID;
    await helpingFunctions.deleteUser(userId, token);
  })
  test("Returns code 200 for authorization", async function () {
    const authorization = await accountApi.authorization(userName, password);
    expect(authorization).to.have.property("status", 200);
  });
  test("Returns code 400 for authorization", async function () {
    // Creating new variables to have an option to delete user in afterEach hook
    let userNameOld = userName;
    let passwordOld = password;
    userName = "";
    password = "";
    const authorization = await accountApi.authorization(userName, password);
    expect(authorization).to.have.property("status", 400);
    // Assigned created correct values before moving into afterEach hook
    userName = userNameOld;
    password = passwordOld;
  });
  test("Returns code 404 for authorization", async function () {      
      let passwordOld = password;      
      password = "12345";
      const authorization = await accountApi.authorization(userName, password);
      expect(authorization).to.have.property("status", 404);
      password = passwordOld;
  });
})
test.describe("Check token creation endpoint", function() {
  let userName, password, userId, token, createNewUser;

  test.beforeEach(async function() {      
    ({userName, password, createNewUser} = await helpingFunctions.givenUser());
  })
  test.afterEach(async function() {
    userId = createNewUser.data.userID;
    const deleteCreatedUser = await accountApi.deleteUser(userId, token.data.token);
    expect(deleteCreatedUser.status).to.equal(204);
  })
  test("Create new auth token for user", async function () {
    token = await accountApi.generateToken(userName, password);
    expect(token).to.have.property("status", 200);
  });
  test("Create new auth token for user 400 error", async function () {
    // Creating new variable to have an option to delete user in afterEach hook
    let passwordOld = password;
    password = "";
    token = await accountApi.generateToken(userName, password);
    expect(token).to.have.property("status", 400);
    // Assigned created value and receiving correct token before moving into afterEach hook
    password = passwordOld;
    token = await accountApi.generateToken(userName, password);
  });
})
test.describe("Get user by userID endpoint", async function() {
  let userId, token;

  test.beforeEach(async function() {
    // Use received userId & token further in the tests
    ({userId, token} = await helpingFunctions.givenUserWithTokenAndUserId());
  })
  test.afterEach(async function() {
    const deleteCreatedUser = await accountApi.deleteUser(userId, token);
    expect(deleteCreatedUser).to.have.property("status", 204);
  })
  test("Returns 200 for user without book", async function () {
    const getUserByIsbn = await accountApi.getUser(userId, token);
    expect(getUserByIsbn).to.have.property("status", 200);
    //Why objects instead of books in output? - logger properties. use result.data or JSON.stringify(result)
    //showLog.info(JSON.stringify(getUserByIsbn, null, 4));
  });
  test("Returns 200 for user with book", async function () {
    await helpingFunctions.getAssignedIsbn(userId, token);

    const getUserByIsbn = await accountApi.getUser(userId, token);
    expect(getUserByIsbn).to.have.property("status", 200);
  });
  test("Returns 401 error", async function () { 
    const tokenOld = token;
    token = "Oops, something went wrong!";
    const getUserByIsbn = await accountApi.getUser(userId, token);
    expect(getUserByIsbn).to.have.property("status", 401);
    token = tokenOld;
  });
})
test.describe("Delete user endpoint", async function() {
  let userName, password, userId, token, tokenOld, createNewUser, authorization;

  test.beforeEach(async function() {
    // DataClass.givenAuthorizedUser(userName, password);
    ({userId, token} = await helpingFunctions.givenExistingUserWithTokenAndUserId());
  })
  test("Delete user flow 204", async function(){
    const resultOfDeletingUser = await accountApi.deleteUser(userId, token);
    expect(resultOfDeletingUser).to.have.property("status", 204);
    expect(resultOfDeletingUser.status).to.equal(204);
  })
  test("Delete user flow 401 error", async function(){
    tokenOld = token;
    token = "Token is changed!";
    const resultOfDeletingUser = await accountApi.deleteUser(userId, token);
    expect(resultOfDeletingUser).to.have.property("status", 401);
    expect(resultOfDeletingUser.status).to.equal(401);
    token = tokenOld;
  })
})
