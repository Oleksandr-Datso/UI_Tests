import { chromium } from "@playwright/test";
// const {chromium} = require('@playwright/test');

//Async block
(async () => {
    //Create browser instance
    const browser = await chromium.launch({
        headless: false
    });

    //Browser instance
    const browserInstance = await browser.newContext();

    //Page
    const page = await browserInstance.newPage();

    //navigate google
    await page.goto("https://google.com");

})();