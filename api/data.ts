// import axios from "axios";
// import { AccountApi } from '../api/AccountApi';
// import { BookStoreApi } from '../api/BookStoreApi';


export class DataClass {
    static async generateIsbnIndex(count:number) {
        const isbnToUse = parseInt((Math.random() * (count-1)).toString());  //parseInt equal to Number or MAth.round()
        // showLog.info(isbnToUse);
        return isbnToUse;
    }
};