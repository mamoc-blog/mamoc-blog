import { test, expect } from '@playwright/test';

// ===== Multi-step test convention =====
//
// Tests tagged `@multistep` in their title are the ONLY ones whose recorded
// videos appear in the combined side-by-side video posted to PRs.
//
// Tag a test `@multistep` when it exercises a meaningful user flow:
//   - multiple user actions in sequence (click → type → click → assert)
//   - progressive state changes worth watching in motion
//   - cross-page navigation triggered by interaction
//
// Do NOT tag tests that are single-assertion smoke checks (e.g. "page loads",
// "footer is visible", "title is X"). They still run + upload as artifacts but
// won't clutter the combined PR video.
//
// The workflow's stitch step (`.github/workflows/playwright.yml`) filters
// test-results paths by the literal substring `multistep`, which Playwright
// includes in the slugified directory name when a test title contains the tag.

// CI runners are Linux, so cmdk's `mod+k` resolves to Control. Use this
// constant in case anyone runs the suite locally on macOS.
const MOD = process.platform === 'darwin' ? 'Meta' : 'Control';

test.describe('Archive topic filter', () => {
  test('clicking a topic narrows the post list, clicking again restores it @multistep', async ({ page }) => {
    await page.goto('/archive');

    // Wait for the page header to confirm we're rendered.
    await expect(page.getByRole('heading', { name: /archive/i })).toBeVisible();

    // Post links on the archive page all point at /posts/<slug>; nothing in
    // the header/footer links to a post, so a global count is safe here.
    const postLinks = page.locator('a[href^="/posts/"]');
    const totalBefore = await postLinks.count();
    expect(totalBefore).toBeGreaterThan(0);

    // `simulation` is used by spatial-ecology, neuroev, PINNS — guaranteed
    // multiple matches but strictly fewer than total.
    const simChip = page.getByRole('button', { name: /#simulation/i });
    await expect(simChip).toBeVisible();
    await simChip.click();

    const filteredCount = await postLinks.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(totalBefore);

    // Click the same chip again — ArchivePage toggles the filter off.
    await simChip.click();
    const restoredCount = await postLinks.count();
    expect(restoredCount).toBe(totalBefore);
  });
});

test.describe('Command palette', () => {
  test('keyboard-driven palette searches and navigates to a post @multistep', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press(`${MOD}+k`);

    const input = page.getByPlaceholder(/search posts/i);
    await expect(input).toBeVisible({ timeout: 5_000 });

    // "wave" only matches the WFC post by title.
    await input.fill('wave');

    const wfcRow = page.getByRole('option').filter({ hasText: /wave function collapse/i }).first();
    await expect(wfcRow).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/posts\/wfc/);
  });
});

test.describe('Theme switcher', () => {
  test('toggling theme updates data-theme and persists across reload @multistep', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');

    await page.getByRole('button', { name: /theme: dark/i }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: /theme: light/i }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');

    // next-themes persists to localStorage — reload should not lose the choice.
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});
