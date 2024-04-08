/*
import axios from "axios";
import { expect } from 'chai';
const BookStoreApi = require('./BookStoreApi');
const AccountApi = require('./AccountApi');
const DataClass = require('./data');
const showLog = require('./logger').loggerToExport;
const {testUserData} = require('./credentials');

let bookStoreApi = new BookStoreApi(process.env.HOST);
let accountApi = new AccountApi(process.env.HOST);

module.exports = class helpingFunctions {
    async givenUserWithToken() {
        const userName = testUserData.userName();
        const password = testUserData.password;
        const createNewUser = await accountApi.createNewUser(userName, password);
        const token = (await accountApi.generateToken(userName, password)).data.token;
        return {userName, password, createNewUser, token};
    }
    async givenUser() {
        const userName = testUserData.userName();
        const password = testUserData.password;
        const createNewUser = await accountApi.createNewUser(userName, password);
        return {userName, password, createNewUser};
    }
    async givenUserWithTokenAndUserId() {
        const userName = testUserData.userName();
        const password = testUserData.password;
        const createNewUser = await accountApi.createNewUser(userName, password);
        const token = (await accountApi.generateToken(userName, password)).data.token;
        const authorization = await accountApi.authorization(userName, password);
        const userId = createNewUser.data.userID;

        return {userId, token};
    }
    async givenExistingUserWithTokenAndUserId() {
        const userName = testUserData.userName();
        const password = testUserData.password;
        const createNewUser = await accountApi.createNewUser(userName, password);
        const token = (await accountApi.generateToken(userName, password)).data.token;
        const authorization = await accountApi.authorization(userName, password);
        const userId = createNewUser.data.userID;
        const userExist = await accountApi.getUser(userId, token);
        expect(userExist).to.have.property("status", 200);

        return {userId, token};
    }
    
    // async givenUserId() {
    //     return userId = createNewUser.data.userID;
    // }
    async getAssignedIsbn(userId, token) {
        const isbnNumbers = await bookStoreApi.getAllIsbns();
        expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
        let count = isbnNumbers.length;
        const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
        const randomIsbn = isbnNumbers[randomIsbnIndex];
        const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]); 
        expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);

        return randomIsbn;
    }
    // async getAssignedAllIsbns(userId, token) {
    //     const isbnNumbers = await bookStoreApi.getAllBooks();
    //     showLog.info(isbnNumbers);
    //     expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
    //     const userWithAllAddedBooks = await bookStoreApi.addBookToTheUserByIsbn(userId, token, isbnNumbers);
    //     expect(userWithAllAddedBooks, "The list of books for current user is empty").to.be.not.equal(null);
    //     return userWithAllAddedBooks.data;
    // }
    async getUserWithTwoBooks(userId, token) {
        const isbnNumbers = await bookStoreApi.getAllIsbns();
        expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
        const count = isbnNumbers.length;
        let randomFirstIsbnIndex = await DataClass.generateIsbnIndex(count);
        let randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
        while(randomSecondIsbnIndex === randomFirstIsbnIndex) {
            showLog.info("First isbn index = " + randomFirstIsbnIndex + ", sceond isbn index = " + randomSecondIsbnIndex);
            showLog.warn("Oops, the isbn is the same, another one is being given");
        randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
        }
        const randomFirstIsbn = isbnNumbers[randomFirstIsbnIndex];
        const randomSecondIsbn = isbnNumbers[randomSecondIsbnIndex];

        // Add books to the user's collection
        const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomFirstIsbn, randomSecondIsbn]);
        expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);
    }
    async getInformationAboutAllBooks() {
        const isbnNumbers = await bookStoreApi.getAllIsbns();
        expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
      
        let count = isbnNumbers.length;
        showLog.info(isbnNumbers);
        showLog.error(`Number of isbns in the list is ${count}`);
    }
    async deleteUser(userId, token) {
        const deleteCreatedUser = await accountApi.deleteUser(userId, token);
        expect(deleteCreatedUser.status).to.equal(204);
    }
};
*/