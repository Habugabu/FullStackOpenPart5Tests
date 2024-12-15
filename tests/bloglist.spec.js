const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
        data: {
            username: 'foo',
            name: 'foo',
            password: 'foobar'
        }
    })
    await request.post('http://localhost:3003/api/users', {
        data: {
            username: 'bar',
            name: 'bar',
            password: 'foobar'
        }
    })
    await page.goto('http://localhost:5173')
    page.on('dialog', dialog => dialog.accept());
  })

  test('Login form is shown', async ({ page }) => {

    const locator = page.getByText('login to application')
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
        await expect(page.getByRole('button', { name: 'log out' })).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
        await page.getByRole('textbox').first().fill('wrongusername')    
        await page.getByRole('textbox').last().fill('wrongpassword')    
        await page.getByRole('button', { name: 'login' }).click()      
        await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
    })
  })
  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
        await page.getByRole('textbox').first().fill('foo')    
        await page.getByRole('textbox').last().fill('foobar')    
        await page.getByRole('button', { name: 'login' }).click()
    })
  
    test('a new blog can be created', async ({ page }) => {
        await page.getByRole('button', { name: 'new blog' }).click()
        await page.getByRole('textbox').first().fill('test title')
        await page.getByRole('textbox').nth(1).fill('test author')
        await page.getByRole('textbox').last().fill('test url')
        await page.getByRole('button', { name: 'create' }).click()
        await expect(page.getByText('test title test author')).toBeVisible()
    })
    describe('with existing blogs', () => {
      beforeEach(async ({ page }) => {

        await page.getByRole('button', { name: 'new blog' }).click()
        await page.getByRole('textbox').first().fill('first test title')
        await page.getByRole('textbox').nth(1).fill('first test author')
        await page.getByRole('textbox').last().fill('first test url')
        await page.getByRole('button', { name: 'create' }).click()

        await page.getByRole('button', { name: 'new blog' }).click()
        await page.getByRole('textbox').first().fill('second test title')
        await page.getByRole('textbox').nth(1).fill('second test author')
        await page.getByRole('textbox').last().fill('second test url')
        await page.getByRole('button', { name: 'create' }).click()

        await page.getByRole('button', { name: 'log out' }).click()
        await page.getByRole('textbox').first().fill('bar')
        await page.getByRole('textbox').last().fill('foobar')
        await page.getByRole('button', { name: 'login' }).click()

        await page.getByRole('button', { name: 'new blog' }).click()
        await page.getByRole('textbox').first().fill('third test title')
        await page.getByRole('textbox').nth(1).fill('third test author')
        await page.getByRole('textbox').last().fill('third test url')
        await page.getByRole('button', { name: 'create' }).click()

        await page.goto('http://localhost:5173')
      })

      test('blogs can be liked', async ({ page }) => {
        await page.goto('http://localhost:5173')
        await page.getByRole('button', { name: 'view' }).first().click()
        await page.getByRole('button', { name: 'like' }).first().click()
        await expect(page.getByText('likes: 1')).toBeVisible()
        await page.getByRole('button', { name: 'like' }).first().click()
        await expect(page.getByText('likes: 2')).toBeVisible()
      })

      test('blogs can be deleted by the poster', async ({ page }) => {
        await page.goto('http://localhost:5173')
        const locator = page.getByRole('button', { name: 'view' })
        await expect(locator).toHaveCount(3)
        await locator.nth(2).click()
        await page.getByRole('button', { name: 'delete' }).first().click()
        await expect(locator).toHaveCount(2)
      })

      test('delete button only visible on own blogs', async ({ page }) => {
        await page.goto('http://localhost:5173')
        const locator = page.getByRole('button', { name: 'delete' })
        await expect(locator).toHaveCount(0)
        await page.getByRole('button', { name: 'view' }).first().click()
        await expect(locator).toHaveCount(0)
        await page.getByRole('button', { name: 'view' }).last().click()
        await expect(locator).toHaveCount(1)
      })

      test('blogs are sorted by likes in descending order', async ({ page }) => {
        await page.goto('http://localhost:5173')
        const viewButtons = page.getByRole('button', { name: 'view' })
        await expect(viewButtons).toHaveCount(3)
        await viewButtons.first().click()
        await viewButtons.first().click()
        await viewButtons.first().click()
        const locator = page.getByText('likes:')
        await expect(locator).toHaveCount(3)
        await expect(locator.first()).toHaveText(/likes: 0/)
        await expect(locator.nth(1)).toHaveText(/likes: 0/)
        await expect(locator.last()).toHaveText(/likes: 0/)
        const likeButtons = page.getByRole('button', { name: 'like' })
        await likeButtons.last().click()
        await expect(locator.first()).toHaveText(/likes: 1/)
        await expect(locator.nth(1)).toHaveText(/likes: 0/)
        await expect(locator.last()).toHaveText(/likes: 0/)
        await likeButtons.last().click()
        await expect(locator.first()).toHaveText(/likes: 1/)
        await expect(locator.nth(1)).toHaveText(/likes: 1/)
        await expect(locator.last()).toHaveText(/likes: 0/)
        await likeButtons.nth(1).click()
        await expect(locator.first()).toHaveText(/likes: 2/)
        await expect(locator.nth(1)).toHaveText(/likes: 1/)
        await expect(locator.last()).toHaveText(/likes: 0/)
      })
    })
  })
})