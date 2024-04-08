import axios from "axios";
const credentials = require("./credentials");
const AccountApi = require("./AccountApi");


module.exports = class DataClass {
    static async generateIsbnIndex(count:number) {
        const isbnToUse = parseInt((Math.random() * (count-1)).toString());  //parseInt equal to Number or MAth.round()
        // showLog.info(isbnToUse);
        return isbnToUse;
    }
};