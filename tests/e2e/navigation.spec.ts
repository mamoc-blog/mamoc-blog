import { test, expect } from '@playwright/test';

// Smoke checks for header links. Each test is a single click + URL assertion,
// so we don't tag with `@multistep` — the combined PR video only includes
// tagged tests. See tests/e2e/multistep.spec.ts for the convention.

test.describe('Site navigation', () => {
  test('header links navigate correctly', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: /archive/i }).click();
    await expect(page).toHaveURL('/archive');
  });

  test('about link navigates to about page', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: /about/i }).click();
    await expect(page).toHaveURL('/about');
  });

  test('site logo / name navigates to homepage', async ({ page }) => {
    await page.goto('/archive');
    // Click the mamoc.blog text/logo in the header
    await page.locator('header').getByRole('link').first().click();
    await expect(page).toHaveURL('/');
  });

  test('theme toggle is present', async ({ page }) => {
    // SiteHeader returns null on '/', so navigate somewhere that renders it.
    await page.goto('/archive');
    const themeToggle = page.locator('header button, nav button').first();
    await expect(themeToggle).toBeVisible();
  });

  // Keyboard-driven palette open + navigate is covered by
  // tests/e2e/multistep.spec.ts ("Command palette" describe). No need for a
  // smoke version that swallowed assertion failures and reported false green.
});
