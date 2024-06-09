import axios from "axios";
import { AccountApi } from "./AccountApi";
// const AccountApi = require("./AccountApi");
import { BaseApi } from "./BaseApi";
// const BaseApi = require("./BaseApi");

export class BookStoreApi extends BaseApi {
  constructor(baseURL) {
    super(baseURL);
  }

  async getAllBooks() {
    const config = {
      headers: this.headers,
    };
    const response = await axios.get(
      `${this.baseURL}/BookStore/v1/Books`,
      config
    );
    return response.data;
  }
  async addBookToTheUserByIsbn(userId, token, isbns) {
    const body = {
      userId: userId,
      collectionOfIsbns: isbns.map((isbn) => {
        return { isbn: isbn };
      }),
    };

    const config = {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status === 201 || status === 401 || status === 400,
    };

    const { status, data } = await axios.post(
      `${this.baseURL}/BookStore/v1/Books`,
      body,
      config
    );
    return { status, data };
  }
  async addBookToTheUserByIsbnWith401Error(userId, token, isbns) {
    const body = {
      userId: userId,
      collectionOfIsbns: isbns.map((isbn) => {
        return { isbn: isbn };
      }),
    };

    const config = {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status === 401,
    };

    const { status, data } = await axios.post(
      `${this.baseURL}/BookStore/v1/Books`,
      body,
      config
    );
    return { status, data };
  }
  async addBookToTheUserByIsbnWith400Error(userId, token, isbns) {
    const body = {
      userId: userId,
      collectionOfIsbns: isbns.map((isbn) => {
        return { isbn: isbn };
      }),
    };

    const config = {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status === 400,
    };

    const { status, data } = await axios.post(
      `${this.baseURL}/BookStore/v1/Books`,
      body,
      config
    );
    return { status, data };
  }
  async editBookByIsbnForUser(userId, token, isbnBeforeChange, isbnAfterChange) {
    let data = JSON.stringify({
      userId: userId,
      isbn: isbnBeforeChange
    });
    
    let config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: `https://demoqa.com/BookStore/v1/Books/${isbnAfterChange}`,
      headers: { 
        'accept': 'application/json', 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      },
      data : data
    };

    return await axios.request(
      config
    );
    //return { status, data: {userId, username: userId, books: [isbnAfterChange]} };

  }
  async getBookByIsbn(isbn) {
    const config = {
      headers: this.headers,
      validateStatus: (status) => status < 500,
    };
    const response = await axios.get(
      `${this.baseURL}/BookStore/v1/Book?ISBN=${isbn}`,
      config
    );
    return response;

    /* Version from postman, also works
    const config = {
      method: "get",
      url: `${this.baseURL}/BookStore/v1/Book?ISBN=${isbn}`,
      headers: this.headers,
    };
    const response = await axios.request(
      config
    );
    return response;
    */
  }
  async getBookByIsbnWith400Error(isbn) {
    const config = {
      headers: this.headers,
      validateStatus: (status) => status === 400,
    };
    const response = await axios.get(
      `${this.baseURL}/BookStore/v1/Book?ISBN=${isbn}`,
      config
    );
    return response;
  }
  async deleteBookFromUserByIsbn(userId, token, isbns) {
    const body_str = JSON.stringify({
      isbn: String(isbns),
      userId: userId,
      //collectionOfIsbns: isbns.map((isbn) => {return {isbn: isbn}}),
    });

    const body_obj = {
      isbn: String(isbns),
      userId: userId,
      //collectionOfIsbns: isbns.map((isbn) => {return {isbn: isbn}}),
    };

    let config = {
      method: "delete",
      url: `${this.baseURL}/BookStore/v1/Book`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status < 500,
      data: body_str,
    };

    const { status, data } = await axios.request(config);

    return { status, data };
  }
  async deleteBookFromUserByIsbnWith401Error(userId, token, isbns) {
    const body_str = JSON.stringify({
      isbn: String(isbns),
      userId: userId,
    });

    const body_obj = {
      isbn: String(isbns),
      userId: userId,
    };

    let config = {
      method: "delete",
      url: `${this.baseURL}/BookStore/v1/Book`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status === 401,
      data: body_str,
    };

    const { status, data } = await axios.request(config);

    return { status, data };
  }
  async deleteBookFromUserByIsbnWith400Error(userId, token, isbns) {
    const body_str = JSON.stringify({
      isbn: String(isbns),
      userId: userId,
    });

    const body_obj = {
      isbn: String(isbns),
      userId: userId,
    };

    let config = {
      method: "delete",
      url: `${this.baseURL}/BookStore/v1/Book`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status === 400,
      data: body_str,
    };

    const { status, data } = await axios.request(config);

    return { status, data };
  }
  //next method can be deleted
  async deleteAllBooksFromUserByIsbn(userId, token) {
    const body_str = {
      userId: userId,
    };

    let config = {
      method: "delete",
      url: `${this.baseURL}/BookStore/v1/Books?UserId=${userId}`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      //params: body_str,
    };

    const { status, data } = await axios.request(config);

    return { status, data };
  }
  async deleteAllBooksFromUserByUserId(userId, token) {
    const body_str = JSON.stringify({
      userId: userId,
      //collectionOfIsbns: isbns.map((isbn) => {return {isbn: isbn}}),
    });

    let config = {
      method: "delete",
      url: `${this.baseURL}/BookStore/v1/Books?UserId=${userId}`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status === 204 || status === 401,
    };

    const { status, data } = await axios.request(config);

    return { status, data };
  }
  async getAllIsbns() {
    const getAllBooksResult = await this.getAllBooks();
    //Extract ISBNs from the list of all books
    const books = getAllBooksResult.books;
    const isbnNumbers = books.map(book => book.isbn); // const isbnNumbers = []; to check if test can be failed
    
    return isbnNumbers;
  }
  async getAllIsbnsForEditFlow() {
    const getAllBooksResult = await this.getAllBooks();
    // console.log(getAllBooksResult)
    //Extract ISBNs from the list of all books
    const isbnNumbers = getAllBooksResult.data.map(book => book.isbn); // const isbnNumbers = []; to check if test can be failed
    return isbnNumbers;
  }
};