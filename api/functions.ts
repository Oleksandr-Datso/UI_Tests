import axios from "axios";
// import { expect } from 'chai';  require() also no okay here
const BookStoreApi = require('./BookStoreApi');
const AccountApi = require('./AccountApi');
require('dotenv').config({ path: './.env' });
const showLog = require('./logger').loggerToExport;
const DataClass = require('./data');
const {testUserData} = require('./credentials');
const HelpingFunctions = require('./helper');

let bookStoreApi = new BookStoreApi(process.env.HOST); //тут ловим то, что передали в командной строке HOST="demoqa.com" npm run ....
let accountApi = new AccountApi(process.env.HOST);
let helpingFunctions = new HelpingFunctions();

module.exports = {
    createUser: async (accountApi, testUserData) => {
      let userName = testUserData.userName();
      let password = testUserData.password;
  
      let userIsCreated = await accountApi.createNewUser(userName, password);
      return userIsCreated;
    }
  };

module.exports = class myFunctions {
    async registerNewUser() {
        let userName, password, userId, token, userIsCreated;

        userName = testUserData.userName();
        password = testUserData.password;
        userIsCreated = await accountApi.createNewUser(userName, password);
        // expect(userIsCreated).to.have.property("status", 201);
    }
}