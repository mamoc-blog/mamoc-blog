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

    // Before the tap: on mobile the trigger collapses to a 32×32 search-icon
    // button (CommandTrigger.module.scss `@media (max-width: 768px)` rules).
    // Verify it's icon-only — the "find" label, placeholder, and ⌘K key cap
    // are display:none.
    const trigger = page.getByRole('button', { name: /open search palette/i });
    const triggerBox = await trigger.boundingBox();
    expect(triggerBox).not.toBeNull();
    if (triggerBox) expect(triggerBox.width).toBeLessThanOrEqual(40);
    await expect(trigger.locator('svg')).toBeVisible();
    const visibleTextChildren = await trigger.evaluate((el) =>
      Array.from(el.children)
        .filter((c) => getComputedStyle(c as HTMLElement).display !== 'none')
        .map((c) => (c.textContent ?? '').trim())
        .filter(Boolean),
    );
    expect(visibleTextChildren).toEqual([]);

    await trigger.tap();

    const input = page.getByPlaceholder(/search posts/i);
    await expect(input).toBeVisible({ timeout: 5_000 });

    // On mobile the palette renders as a bottom-anchored sheet, not a
    // centered modal. Assert that the dialog content sits at the bottom of
    // the viewport and spans its full width — that's the visual contract of
    // the @media (max-width: 640px) styles in CommandPalette.module.scss.
    const dialogBox = await page.locator('[cmdk-dialog]').boundingBox();
    const viewport = page.viewportSize();
    expect(dialogBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (dialogBox && viewport) {
      // Sheet hugs the bottom edge (within 2px of viewport bottom).
      expect(dialogBox.y + dialogBox.height).toBeGreaterThanOrEqual(viewport.height - 2);
      // Sheet spans the full viewport width.
      expect(dialogBox.width).toBe(viewport.width);
    }

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

  test('post breadcrumb container is configured to wrap @multistep', async ({ page }) => {
    // The crumbs row may fit on one line for the current post slugs, but the
    // PR #15 fix is a defensive `flex-wrap: wrap` so the row never overflows
    // when slugs / topics grow. Assert the computed style rather than the
    // wrapped state — the latter depends on slug length and is brittle.
    await page.goto(`/posts/${FIRST_POST_SLUG}`);

    const crumbs = page.getByLabel('Breadcrumb');
    await expect(crumbs).toBeVisible();

    const flexWrap = await crumbs.evaluate(
      (el) => getComputedStyle(el).flexWrap,
    );
    expect(flexWrap).toBe('wrap');

    // And the row fits within the viewport (no horizontal overflow), which
    // is the user-visible symptom the rule prevents.
    const box = await crumbs.boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport) {
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    }
  });

  test('authors menu opens as a full-width bottom sheet on mobile @multistep', async ({ page }) => {
    // AuthorsMenu is only mounted on Frontpage's editorial masthead (`/`),
    // not on the SiteHeader used by interior pages. The bottom-sheet styles
    // mirror CommandPalette: full viewport width, anchored to the bottom
    // edge, with a darkened backdrop.
    await page.goto('/');

    const trigger = page.getByRole('button', { name: /^authors/i });
    await expect(trigger).toBeVisible();
    await trigger.tap();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const panel = page.getByRole('menu');
    await expect(panel).toBeVisible();

    const panelBox = await panel.boundingBox();
    const viewport = page.viewportSize();
    expect(panelBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (panelBox && viewport) {
      // Full viewport width.
      expect(panelBox.x).toBeLessThanOrEqual(1);
      expect(panelBox.width).toBe(viewport.width);
      // Anchored to the bottom edge (within 2px of viewport bottom).
      expect(panelBox.y + panelBox.height).toBeGreaterThanOrEqual(viewport.height - 2);
    }
  });

  test('author page masthead fits the mobile viewport @multistep', async ({ page }) => {
    // Walk from Frontpage into an author profile and verify the masthead
    // (responsive h1 via clamp + break-word, avatar padding for the CO-AUTHOR
    // tag) doesn't blow out the viewport.
    await page.goto('/');
    await page.getByRole('button', { name: /^authors/i }).tap();

    const firstAuthor = page.getByRole('menuitem').first();
    await firstAuthor.tap();

    await expect(page).toHaveURL(/\/authors\//);
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    expect(await horizontalOverflowPx(page)).toBeLessThanOrEqual(1);
  });

  test('navigating to an article lands at the top of the page @multistep', async ({ page }) => {
    // Default Next.js scroll-restoration plus rehype-autolink-headings can
    // land the reader mid-article. ScrollToTopOnNav forces the top. We
    // simulate the user scrolling on /archive then clicking into a post —
    // the post view must start at scrollY 0, showing the breadcrumb + title.
    await page.goto('/archive');
    await page.evaluate(() => window.scrollTo(0, 600));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);

    await page.locator(`a[href="/posts/${FIRST_POST_SLUG}"]`).first().tap();
    await expect(page).toHaveURL(new RegExp(`/posts/${FIRST_POST_SLUG}`));

    // Wait for the scroll-restoration effect to commit.
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 }).toBeLessThanOrEqual(1);
    await expect(page.getByLabel('Breadcrumb')).toBeInViewport();
  });
});
