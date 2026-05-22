import { test, expect } from '@playwright/test';

test.describe('About page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/About/);
  });

  test('shows colophon content', async ({ page }) => {
    await page.goto('/about');
    // The colophon includes stack/build/author rows derived at build time
    const main = page.locator('main');
    await expect(main).toBeVisible();
    await expect(main).not.toBeEmpty();
  });

  test('mentions the authors', async ({ page }) => {
    await page.goto('/about');
    // The site is by Cameron Michie & Alexander Cheetham
    const body = page.locator('body');
    await expect(body).toContainText(/Cameron|Alexander/);
  });
});
