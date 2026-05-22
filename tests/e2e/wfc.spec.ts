import { test, expect, type Page } from '@playwright/test';

// wfc.js exposes `window.__wfcReady = true` once its deterministic p5
// bootstrap has run (see public/WFC_code/wfc.js for why a bootstrap is
// needed — p5 global mode has a one-shot setup-scan that races wfc.js's
// load order). One flag, one wait — no need to probe p5/createSlider/
// setup independently or kick a second `new p5()` from the test side.
async function waitForP5Ready(page: Page) {
  await page.waitForFunction(
    () => (window as unknown as { __wfcReady?: boolean }).__wfcReady === true,
    { timeout: 15_000 },
  );
  await page.locator('#wfc-canvas canvas').waitFor({ state: 'attached', timeout: 5_000 });
}

// The Wave Function Collapse post embeds a 3-step interactive widget
// (components/WFC_components/WFCCONTAINER.tsx + public/WFC_code/wfc_flow.js):
//   step 1 — #tileselect with .image-container > button (text "select")
//   step 2 — #prob_graph with #STARTWFC (text "start collapse →")
//   step 3 — #wfc-container hosting a p5.js <canvas> inside #wfc-canvas
// The p5 library is loaded from a CDN, so we give it generous timeouts in CI.
//
// Multi-step convention: tests that exercise the full flow are tagged
// `@multistep` so their videos show up in the combined PR comment. The first
// test below is a single-step smoke check and intentionally omits the tag.
// See tests/e2e/multistep.spec.ts header for the full rule.

const WFC_URL = '/posts/wfc';

// Modest per-test timeout bump for cold Turbopack compiles of /posts/wfc.
test.describe.configure({ timeout: 60_000 });

test.describe('WFC interactive widget', () => {
  test('loads the widget and shows the tileset picker', async ({ page }) => {
    await page.goto(WFC_URL);
    await expect(page.locator('#tileselect')).toBeVisible();
    // wfc_flow.js builds one .image-container per tileset folder; we expect at least one.
    await expect(page.locator('#tileselect .image-container').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#resetButton')).toBeVisible();
    // Stage starts in step 1: prob_graph + wfc-container should be hidden.
    await expect(page.locator('#prob_graph')).toBeHidden();
    await expect(page.locator('#wfc-container')).toBeHidden();
  });

  test('selecting a tileset reveals the probability distribution editor @multistep', async ({ page }) => {
    await page.goto(WFC_URL);
    const firstSelect = page.locator('#tileselect .image-container button').first();
    await expect(firstSelect).toBeVisible({ timeout: 15_000 });
    await firstSelect.click();

    await expect(page.locator('#prob_graph')).toBeVisible();
    await expect(page.locator('#tileselect')).toBeHidden();
    // The start button is created dynamically inside #wfc-footer.
    const startBtn = page.locator('#STARTWFC');
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toHaveText(/start collapse/i);
  });

  test('running the collapse renders a p5 canvas @multistep', async ({ page }) => {
    await page.goto(WFC_URL);
    await waitForP5Ready(page);
    await page.locator('#tileselect .image-container button').first().click();
    await expect(page.locator('#STARTWFC')).toBeVisible();

    await page.locator('#STARTWFC').click();

    await expect(page.locator('#wfc-container')).toBeVisible();
    await expect(page.locator('#prob_graph')).toBeHidden();
    // p5 mounts a <canvas> into #wfc-canvas — wait for it to actually appear.
    const canvas = page.locator('#wfc-canvas canvas');
    await expect(canvas).toBeVisible({ timeout: 20_000 });
    // Canvas should have non-zero dimensions once p5 finishes setup().
    const box = await canvas.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeGreaterThan(0);

    // Let the algorithm run for a couple of seconds so the video shows progress.
    await page.waitForTimeout(2500);
  });

  test('reset returns the widget to step 1 @multistep', async ({ page }) => {
    await page.goto(WFC_URL);
    await waitForP5Ready(page);
    await page.locator('#tileselect .image-container button').first().click();
    await expect(page.locator('#STARTWFC')).toBeVisible();
    await page.locator('#STARTWFC').click();
    await expect(page.locator('#wfc-container')).toBeVisible();

    await page.locator('#resetButton').click();

    await expect(page.locator('#tileselect')).toBeVisible();
    await expect(page.locator('#prob_graph')).toBeHidden();
    await expect(page.locator('#wfc-container')).toBeHidden();
    // Reset removes the STARTWFC button.
    await expect(page.locator('#STARTWFC')).toHaveCount(0);
  });
});
