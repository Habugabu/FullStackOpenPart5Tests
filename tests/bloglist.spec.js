const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
        data: {
            username: 'foo',
            name: 'bar',
            password: 'foobar'
        }
    })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {

    const locator = await page.getByText('login to application')
    await expect(locator).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    await expect(page.getByText('login', { exact: true })).toBeVisible()
  })
  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
        await page.getByRole('textbox').first().fill('foo')    
        await page.getByRole('textbox').last().fill('foobar')    
        await page.getByRole('button', { name: 'login' }).click()      
        await expect(page.getByText('log out')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
        await page.getByRole('textbox').first().fill('foo')    
        await page.getByRole('textbox').last().fill('foobar')    
        await page.getByRole('button', { name: 'login' }).click()      
        await expect(page.getByText('login', { exact: true })).toBeVisible()
    })
  })
})