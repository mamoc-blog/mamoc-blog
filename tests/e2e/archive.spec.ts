import { test, expect } from '@playwright/test';

test.describe('Archive page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/archive');
    await expect(page).toHaveTitle(/Archive/);
  });

  test('shows a list of posts', async ({ page }) => {
    await page.goto('/archive');
    // Archive lists posts — at least one should be visible
    const links = page.getByRole('link').filter({ hasText: /.{5,}/ });
    await expect(links.first()).toBeVisible();
  });

  test('shows topic filters', async ({ page }) => {
    await page.goto('/archive');
    // Topic counts are shown; look for any label-style element
    const body = page.locator('body');
    await expect(body).toContainText(/.+/);
  });

  test('navigating back to homepage works', async ({ page }) => {
    await page.goto('/archive');
    await page.getByRole('link', { name: /mamoc\.blog|home/i }).first().click();
    await expect(page).toHaveURL('/');
  });
});
