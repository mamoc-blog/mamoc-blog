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

    // Invariant this test depends on: at least one post is tagged
    // `simulation` AND at least one is not. Today that's true (spatial-ecology
    // / neuroev / PINNS are tagged; better-python-testing-with-expecttest is
    // not). If a future content shuffle violates this — every post tagged
    // simulation, or none — `expect(filteredCount).toBeLessThan(totalBefore)`
    // will fail loudly. The mirror assertion in tests/e2e/mobile.spec.ts
    // depends on the same invariant; update both together.
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

  test('selecting a topic in the palette lands on archive with that filter pre-applied @multistep', async ({ page }) => {
    await page.goto('/');

    // The palette's `mod+k` handler is registered in a useEffect — waiting for
    // the visible palette trigger guarantees hydration has completed so the
    // keypress will actually be heard.
    await expect(page.getByRole('button', { name: /search palette/i })).toBeVisible();
    await page.keyboard.press(`${MOD}+k`);

    const input = page.getByPlaceholder(/search posts/i);
    await expect(input).toBeVisible({ timeout: 5_000 });

    // Filter the palette down to rows containing "simulation". cmdk's
    // accessible name for the topic row is `§ #simulation N posts topic`,
    // which uniquely contains `#simulation` (post rows render the bare topic
    // name as a tag, never prefixed with `#`).
    await input.fill('simulation');

    const topicRow = page.getByRole('option', { name: /#simulation/i });
    await expect(topicRow).toBeAttached();
    // Click rather than Enter — cmdk's selection cursor sits on the first
    // post row, not the topic row, and ArrowDown'ing past 7 posts is fragile.
    // Click auto-scrolls into view.
    await topicRow.click();

    // Lands on /archive with ?topic=simulation in the URL.
    await expect(page).toHaveURL(/\/archive\?topic=simulation/);
    await expect(page.getByRole('heading', { name: /archive/i })).toBeVisible();

    // The filter is applied behaviourally: the post count on this filtered
    // visit is strictly less than the unfiltered post count. The mirror
    // assertion in the "Archive topic filter" test above relies on the same
    // content invariant — at least one post tagged `simulation`, at least one
    // not — so if that invariant breaks, both tests fail loudly.
    const filteredCount = await page.locator('a[href^="/posts/"]').count();
    expect(filteredCount).toBeGreaterThan(0);

    await page.goto('/archive');
    await expect(page.getByRole('heading', { name: /archive/i })).toBeVisible();
    const totalCount = await page.locator('a[href^="/posts/"]').count();
    expect(filteredCount).toBeLessThan(totalCount);
  });
});

test.describe('Archive deep-link', () => {
  test('visiting /archive?topic=… directly applies the filter on first paint @multistep', async ({ page }) => {
    // Independent of the palette flow: a shared link or bookmark to
    // /archive?topic=simulation must apply the filter on the very first
    // render. This exercises the `useSearchParams` initial-read path in
    // ArchivePage that the palette test only covers indirectly.
    await page.goto('/archive?topic=simulation');
    await expect(page.getByRole('heading', { name: /archive/i })).toBeVisible();

    const filteredCount = await page.locator('a[href^="/posts/"]').count();
    expect(filteredCount).toBeGreaterThan(0);

    await page.goto('/archive');
    await expect(page.getByRole('heading', { name: /archive/i })).toBeVisible();
    const totalCount = await page.locator('a[href^="/posts/"]').count();
    expect(filteredCount).toBeLessThan(totalCount);
  });
});

test.describe('Theme switcher', () => {
  test('toggling theme updates data-theme and persists across reload @multistep', async ({ page }) => {
    // SiteHeader (and therefore the ThemeSwitch pill) returns null on '/' —
    // see SiteHeader.tsx. Use /archive so the header — and the theme buttons
    // — actually render.
    await page.goto('/archive');

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
