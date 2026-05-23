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

  test('shows topic filter chips', async ({ page }) => {
    await page.goto('/archive');
    // ArchivePage.tsx renders each topic as `<button>#name <count></button>`,
    // so the accessible name starts with `#`. At least one chip must render.
    const topicChips = page.getByRole('button', { name: /^#[a-z0-9-]+/i });
    await expect(topicChips.first()).toBeVisible();
  });

  test('navigating back to homepage works', async ({ page }) => {
    await page.goto('/archive');
    await page.getByRole('link', { name: /mamoc\.blog|home/i }).first().click();
    await expect(page).toHaveURL('/');
  });
});
