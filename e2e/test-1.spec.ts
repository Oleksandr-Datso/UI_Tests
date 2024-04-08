import { test, expect } from '@playwright/test';
import axios from 'axios';
import { testUserData } from '../api/credentials';
const AccountApi = require('../api/AccountApi');
// import { AccountApi } from '../api/AccountApi';
// const createUser = require('../api/functions');
// const MyFunctions = require('../api/functions');
// import { createUser } from ('../api/functions');

let accountApi = new AccountApi();
// let myFunctionsVariable = new createUser();
// let myFunctionsVariableFull = new MyFunctions();
test.describe('Placeholder for describe', async () => {
  let userName = `testUser${Date.now()}`; 
  let password = "1qaz@WSX";

  test.beforeEach("Create new user via API call", async () => {
    const body = JSON.stringify({
      userName,
      password,
    });

    const config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      }
    };
    const { status, data } = await axios.post( 
      `https://demoqa.com/Account/v1/User`,
      body,
      config
    );
    console.log("status = " + status + "\nAnd data = " + data);
    console.log("username = " + userName + "\npassword = " + password);
    expect(status).toBe(201);
    expect(data).toBeDefined();

    return {userName, password};
  })
  test('Successfully Login', async ({ page }) => {
    await page.goto('https://demoqa.com/');
    await page.locator('div:nth-of-type(6)>div>.card-up').click();
    await page.locator('.collapse.element-list.show > .menu-list > li:nth-of-type(1)').click();
    await page.getByText('Login');
    await page.locator('#userName').fill(userName);
    await page.locator('#password').fill(password);
    await page.locator('#login').click();
    await expect(page.getByText('User Name :')).toBeVisible();
  });
  test('Login Failed with empty fields', async ({ page }) => {
    await page.goto('https://demoqa.com/');
    await page.locator('div:nth-of-type(6)>div>.card-up').click();
    await page.locator('.collapse.element-list.show > .menu-list > li:nth-of-type(1)').click();
    await page.getByText('Login');
    await page.locator('#login').click();
    // Why attribute class is not seen ?! 
    const element = await page.locator('#userName');
    const element2 = await element.getAttribute('class');
    // const checkRedBorders = element2?.includes('is-invalid');
    // await expect(checkRedBorders).toBe(true);
    await expect(element2?.includes('is-invalid')).toBe(true);
  });
  test('Log out after successfully Login', async ({ page }) => {
    await page.goto('https://demoqa.com/');
    await page.locator('div:nth-of-type(6)>div>.card-up').click();
    await page.locator('.collapse.element-list.show > .menu-list > li:nth-of-type(1)').click();
    await page.getByText('Login');
    await page.locator('#userName').fill(userName);
    await page.locator('#password').fill(password);
    await page.locator('#login').click();
    await expect(page.getByText(userName)).toBeVisible();
    await page.locator('#submit:has-text("Log out")').click();
    await expect(page.locator('#userForm')).toBeVisible();
  });
  test('Go to book store', async ({ page }) => {
    await page.goto('https://demoqa.com/');
    await page.locator('div:nth-of-type(6)>div>.card-up').click();
    await page.locator('.collapse.element-list.show > .menu-list > li:nth-of-type(1)').click();
    await page.getByText('Login');
    await page.locator('#userName').fill(userName);
    await page.locator('#password').fill(password);
    await page.locator('#login').click();
    await page.locator('#gotoStore').click();
  });
  test('Go to book store using getByRoleOrLabel', async ({ page }) => {
    test.slow();
    await page.goto('https://demoqa.com/');
    await page.getByRole('heading', { name: 'Book Store Application'}).click();
    await page.getByRole('button', { name: 'Login'}).click();
    await page.getByRole('textbox', { name: 'UserName'}).fill(userName);
    await page.getByRole('textbox', { name: 'Password'}).fill(password);
    await page.getByRole('button', {name: 'Login'}).click();
    // await page.locator('#gotoStore').click();
    // await page.getByRole('button', { name: 'Go To Book Store'}).click();
    // await expect(page.getByRole('link', { name: 'Git Pocket Guide'})).toBeVisible();
  })
});



/*
test('Add book to the user', async ({page}) => {
  //add via api
  test.slow();
  await page.goto('https://demoqa.com/');
  await page.locator('div:nth-of-type(6)>div>.card-up').click();
  await page.locator('.collapse.element-list.show > .menu-list > li:nth-of-type(1)').click();
  await page.getByText('Login');
  await page.locator('#userName').fill('testUser1qaz');
  await page.locator('#password').fill('1qaz@WSX');
  await page.locator('#login').click();
  await expect(page.getByText('User Name :')).toBeVisible();
  await page.locator('#gotoStore').click();
  await expect(page.getByText("O'Reilly Media")).toBeVisible();
  //error on demoqa when selecting books
});
test('Check list of all available books', async ({page}) => {
  test.slow();
  await page.goto('https://demoqa.com/');
  await page.locator('div:nth-of-type(6)>div>.card-up').click();
  await page.locator('.collapse.element-list.show > .menu-list > li:nth-of-type(1)').click();
  await page.getByText('Login');
  await page.locator('#userName').fill('testUser1qaz');
  await page.locator('#password').fill('1qaz@WSX');
  await page.locator('#login').click();
  await page.locator('#gotoStore').click();
  await expect(page.locator('span#see-book-Git\ Pocket\ Guide > a')).toBeVisible();
  await expect(page.getByTitle('Learning JavaScript Design Patterns')).toBeVisible();
})
*/