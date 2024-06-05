import axios from "axios";
import { BaseApi } from "./BaseApi";
// const BaseApi = require("./BaseApi");
// const credentials = require("./credentials");

export class AccountApi extends BaseApi {
    constructor(baseURL) {
      super(baseURL);
    }

    async createNewUser(userName, password) {
      const body = JSON.stringify({
        userName,
        password,
      });
  
      const config = {
        headers: this.headers,
      };
      const { status, data } = await axios.post( 
        `${this.baseURL}/Account/v1/User`,
        body,
        config
      );
      //console.log(status, JSON.stringify(data, null, 4)); // 4 пробела вместо таба
      // console.log("status = " + status + "\nAnd data = " + data);
      console.log("username = " + userName + "\npassword = " + password);
      return { status, data };
    }
    async createAlreadyCreatedUser(userName, password) {
      const data = JSON.stringify({
        userName: userName,
        password: password,
      });
  
      const config = {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        validateStatus: (status) => status === 406, //error is NOT shown ONLY if 406 status code is shown
        //validateStatus: () => true, //If you never want axios to throw an error, you can have the function always return true
      };
      const response = axios.post( //REMOVED AWAIT, WHY ?
        `${this.baseURL}/Account/v1/User`,
        data,
        config
      );
      return response;
    }
    async createUserWithInvalidData(userName, password) {
      const data = JSON.stringify({
        userName: userName,
        password: password,
      });
  
      const config = {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        validateStatus: (status) => status === 400,
      };
      const response = await axios.post(
        `${this.baseURL}/Account/v1/User`,
        data,
        config
      );
      return response;
    }
    async generateToken(userName, password) {
        const body = JSON.stringify({
            userName,
            password,
        });

        const config = {
            headers: this.headers,
            validateStatus: (status) => status <= 500,
        };
        const { status, data} = await axios.post(
            `${this.baseURL}/Account/v1/GenerateToken`,
            body,
            config
        );
        //console.log(status, JSON.stringify(data, null, 4));
        return {status, data };
    }
    async authorization(userName, password) {
        const body = JSON.stringify({
            userName,
            password,
        });
        const config = {
            headers: this.headers,
            validateStatus: (status) => status <= 500,
        };
        const {status, data} = await axios.post(
            `${this.baseURL}/Account/v1/Authorized`,
            body,
            config
        );
        return { status, data };
    }
    async authorization400Error(userName, password) {
      const body = JSON.stringify({
          userName,
          password,
      });
      const config = {
          headers: this.headers,
          validateStatus: (status) => status === 400,
      };
      const {status, data} = await axios.post(
          `${this.baseURL}/Account/v1/Authorized`,
          body,
          config
      );
      return { status, data };
    }
    async authorization404Error(userName, password) {
      const body = JSON.stringify({
          userName,
          password,
      });
      const config = {
          headers: this.headers,
          validateStatus: (status) => status === 404,
      };
      const {status, data} = await axios.post(
          `${this.baseURL}/Account/v1/Authorized`,
          body,
          config
      );
      return { status, data };
    }
    async getUser(userID, token) {
        const config = {
            headers: {...this.headers, Authorization: `Bearer ${token}`},
            validateStatus: (status) => (status === 200 || status === 401),
        }

        const {status, data} = await axios.get(`${this.baseURL}/Account/v1/User/${userID}`, config);
        return {status, data};
    }
    async deleteUser401Error(userID, token) {
      const config = {
        headers: {...this.headers, Authorization: `Bearer ${token}`},
        validateStatus: (status) => status === 401,
      }

      const {status, data} = await axios.delete(`${this.baseURL}/Account/v1/User/${userID}`, config);
      return {status, data};
    }
    async deleteUser(userID, token) {
      const config = {
        headers: {...this.headers, Authorization: `Bearer ${token}`},
        validateStatus: (status) => status === 204 || status === 401,
      }

      const {status, data} = await axios.delete(`${this.baseURL}/Account/v1/User/${userID}`, config);
      return {status, data};
    }
  };