import { test, expect } from '@playwright/test';

test.describe('Blog post page', () => {
  // Use the first available post slug — must match a file in content/posts/
  const SLUG = 'better-python-testing-with-expecttest';

  test('post page loads', async ({ page }) => {
    await page.goto(`/posts/${SLUG}`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('post page has a heading', async ({ page }) => {
    await page.goto(`/posts/${SLUG}`);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('post page shows author', async ({ page }) => {
    await page.goto(`/posts/${SLUG}`);
    // Author is threaded through metadata and rendered in layout
    const body = page.locator('body');
    await expect(body).toContainText(/Cameron|Alexander/);
  });

  test('navigating to an invalid post shows 404', async ({ page }) => {
    const response = await page.goto('/posts/this-post-does-not-exist-xyz');
    expect(response?.status()).toBe(404);
  });
});
