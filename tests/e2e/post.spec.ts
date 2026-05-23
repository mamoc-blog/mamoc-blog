import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

// Pick the first .mdx slug under content/posts/ at test-load time so the
// suite survives renaming or removing any individual post. CLAUDE.md
// documents that getAllPostSlugs is just a fs.readdirSync of that directory,
// so we mirror that contract here.
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const SLUG = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => f.replace(/\.mdx$/, ''))
  .sort()[0];

test.describe('Blog post page', () => {

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
