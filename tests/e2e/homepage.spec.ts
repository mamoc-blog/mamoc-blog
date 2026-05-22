import { test, expect } from '@playwright/test';

// These are single-assertion smoke checks (one navigation + one expectation
// each), so they intentionally do NOT carry the `@multistep` tag — their
// videos would just be 1-second blips in the combined PR video. Add the tag
// only when a test chains multiple actions. See tests/e2e/multistep.spec.ts.

test.describe('Homepage', () => {
  test('loads and shows site header', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/mamoc\.blog/);
    await expect(page.locator('header')).toBeVisible();
  });

  test('shows at least one post card', async ({ page }) => {
    await page.goto('/');
    // Posts are rendered as article or list items — target the post links
    const postLinks = page.getByRole('link').filter({ hasText: /.+/ });
    await expect(postLinks.first()).toBeVisible();
  });

  test('shows site footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
  });

  test('issue/volume label is present in header', async ({ page }) => {
    await page.goto('/');
    // The header renders a "VOL.XX · MMM 'YY" style label
    await expect(page.locator('header')).toContainText(/VOL\.\d+/);
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header').getByRole('link', { name: /archive/i })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: /about/i })).toBeVisible();
  });
});
