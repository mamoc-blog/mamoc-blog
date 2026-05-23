import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

// Mobile-only spec. Runs ONLY against the `mobile-chrome` project (Pixel 5 with
// touch) — wired via testMatch/testIgnore in playwright.config.ts. Use `.tap()`
// instead of `.click()` where the assertion is specifically about touch
// interaction; for plain navigation/visibility checks, `.click()` is fine on a
// touch context too.
//
// Videos for this spec upload as a raw artifact
// (`playwright-videos-mobile-chrome`) and are stitched into the combined
// PR video on the bottom row of an xstack T-shape (the three desktop
// browsers fill the top row). See .github/workflows/playwright.yml.

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const FIRST_POST_SLUG = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => f.replace(/\.mdx$/, ''))
  .sort()[0];

async function horizontalOverflowPx(page: import('@playwright/test').Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

test.describe('Mobile · Pixel 5', () => {
  test('homepage fits the viewport with no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    // 1px tolerance covers sub-pixel rounding from scaled images / borders.
    expect(await horizontalOverflowPx(page)).toBeLessThanOrEqual(1);
  });

  test('tapping the search trigger opens the command palette @multistep', async ({ page }) => {
    // SiteHeader renders null on '/'; use /archive so the CommandTrigger button
    // is actually mounted.
    await page.goto('/archive');

    await page.getByRole('button', { name: /open search palette/i }).tap();

    const input = page.getByPlaceholder(/search posts/i);
    await expect(input).toBeVisible({ timeout: 5_000 });

    await input.fill('wave');
    await expect(
      page.getByRole('option').filter({ hasText: /wave function collapse/i }).first(),
    ).toBeVisible();
  });

  test('archive topic filter narrows the post list on tap @multistep', async ({ page }) => {
    await page.goto('/archive');

    const postLinks = page.locator('a[href^="/posts/"]');
    const totalBefore = await postLinks.count();
    expect(totalBefore).toBeGreaterThan(0);

    // Invariant: `simulation` is shared by multiple posts but not all (see the
    // matching comment in tests/e2e/multistep.spec.ts).
    const simChip = page.getByRole('button', { name: /#simulation/i });
    await simChip.tap();

    const filtered = await postLinks.count();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(totalBefore);
  });

  test('theme toggle responds to tap and persists across reload @multistep', async ({ page }) => {
    await page.goto('/archive');
    const html = page.locator('html');

    await page.getByRole('button', { name: /theme: dark/i }).tap();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('post page renders without horizontal overflow', async ({ page }) => {
    await page.goto(`/posts/${FIRST_POST_SLUG}`);
    await expect(page.locator('main')).toBeVisible();
    expect(await horizontalOverflowPx(page)).toBeLessThanOrEqual(1);
  });
});
