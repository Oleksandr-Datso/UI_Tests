export class BaseApi {
    baseURL; 
    headers;
    constructor(baseURL) {
      this.baseURL = baseURL
      this.headers = {
         accept: "application/json",
         "Content-Type": "application/json",
      };
    }
  };  