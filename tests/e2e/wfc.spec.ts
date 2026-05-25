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
// Tests that need a frozen post-STARTWFC state (so the draw loop doesn't
// mutate grid_list / consume the RNG underneath the assertions) use
// `?autostart=0` to opt out of the auto-run on STARTWFC click.
const WFC_URL_FROZEN = '/posts/wfc?autostart=0';

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
    // Help panel is hidden in step 1; first user action (picking a tileset)
    // is what reveals it.
    await expect(page.locator('#wfc-help')).toBeHidden();

    const firstSelect = page.locator('#tileselect .image-container button').first();
    await expect(firstSelect).toBeVisible({ timeout: 15_000 });
    await firstSelect.click();

    await expect(page.locator('#prob_graph')).toBeVisible();
    await expect(page.locator('#tileselect')).toBeHidden();
    // The start button is created dynamically inside #wfc-footer.
    const startBtn = page.locator('#STARTWFC');
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toHaveText(/start collapse/i);

    // Help panel is now revealed and open by default on first show.
    const help = page.locator('#wfc-help');
    await expect(help).toBeVisible();
    await expect(help).toHaveAttribute('open', '');
    await expect(help.locator('.wfc-help-list li').first()).toBeVisible();
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

  // Regression for issue #16: "Probability Distr in WFC demo actually being
  // respected in the WFC". sampleOptionsFromDistribution is the one-shot the
  // collapse loop uses to pick a tile from a cell's remaining options. We
  // call it directly with crafted prob_distr/tileset state and verify the
  // empirical frequencies match the weights. For CITY we check the
  // *aggregate* biome probability (per-biome divisor in
  // createNewNormalisedDistr — without it, biomes with more dominant tiles
  // were over-represented vs the slider value).
  test('sampleOptionsFromDistribution honors prob_distr weights @multistep', async ({ page }) => {
    await page.goto(WFC_URL_FROZEN);
    await waitForP5Ready(page);
    // Pick the REDGRID_EASY card by label so we don't depend on folder order.
    const redgridCard = page
      .locator('#tileselect .image-container')
      .filter({ hasText: /REDGRID_EASY/i });
    await expect(redgridCard).toBeVisible({ timeout: 15_000 });
    await redgridCard.locator('button').click();
    await expect(page.locator('#prob_graph')).toBeVisible();
    // STARTWFC fires createGrid(), which populates window.global_options. We
    // need it populated before invoking sampleOptionsFromDistribution.
    await page.locator('#STARTWFC').click();
    await expect(page.locator('#wfc-canvas canvas')).toBeVisible({ timeout: 15_000 });

    // REDGRID: per-tile sliders. Bias DR heavily and check frequencies.
    const redgridResult = await page.evaluate(() => {
      // Top-level `var` declarations in wfc.js / wfc_flow.js become window
      // properties in non-module scripts. Cast through unknown to satisfy TS.
      const w = window as unknown as {
        global_options: string[];
        prob_distr: Array<[number, string]>;
        sampleOptionsFromDistribution: (opts: string[]) => string;
      };
      const opts = [...w.global_options];
      const weights: Record<string, number> = {};
      const target = 'DR';
      const targetW = 0.6;
      const rest = (1 - targetW) / (opts.length - 1);
      opts.forEach(o => (weights[o] = o === target ? targetW : rest));
      w.prob_distr = opts.map(o => [weights[o], o]);
      const counts: Record<string, number> = {};
      opts.forEach(o => (counts[o] = 0));
      const N = 8000;
      for (let i = 0; i < N; i++) {
        const t = w.sampleOptionsFromDistribution(opts);
        counts[t] = (counts[t] || 0) + 1;
      }
      return { N, counts, weights, opts };
    });
    // Sanity: DR is in the option set the test ran against.
    expect(redgridResult.opts).toContain('DR');
    // Empirical frequency for each tile is within ±0.03 of weight (8000
    // samples gives stderr ~0.005 for p≈0.6; ±0.03 is ~6σ — virtually
    // never flakes).
    for (const o of redgridResult.opts) {
      const empirical = redgridResult.counts[o] / redgridResult.N;
      expect(Math.abs(empirical - redgridResult.weights[o])).toBeLessThan(0.03);
    }

    // Now CITY: aggregate biome probability should match the slider.
    await page.locator('#resetButton').click();
    const cityCard = page
      .locator('#tileselect .image-container')
      .filter({ hasText: /CITY/i });
    await expect(cityCard).toBeVisible();
    await cityCard.locator('button').click();
    await expect(page.locator('#prob_graph')).toBeVisible();
    await page.locator('#STARTWFC').click();
    await expect(page.locator('#wfc-canvas canvas')).toBeVisible({ timeout: 15_000 });

    const cityResult = await page.evaluate(() => {
      const w = window as unknown as {
        global_options: string[];
        prob_distr: Array<[number, string]>;
        sampleOptionsFromDistribution: (opts: string[]) => string;
      };
      // Inline biome-marker derivation so the assertion doesn't depend on
      // the (private) helper being exposed on window.
      const mostFreq = (arr: string[]) =>
        Object.entries(
          arr.reduce<Record<string, number>>((a, v) => {
            a[v] = (a[v] || 0) + 1;
            return a;
          }, {}),
        ).reduce((a, v) => (v[1] >= a[1] ? v : a), ['', 0])[0];
      const biome = (name: string) => {
        if (name.includes('W')) return 'W';
        return mostFreq(name.split('_'));
      };
      const cityKeys = [
        'G_G_G_G_G_G_G_G',
        'Y_Y_Y_Y_Y_Y_Y_Y',
        'LB_LB_LB_LB_LB_LB_LB_LB',
        'DB_DB_DB_DB_DB_DB_DB_DB',
        'G_G_WD_WD_G_G_G_G',
      ];
      const cityWeights = [0.7, 0.075, 0.075, 0.075, 0.075];
      w.prob_distr = cityKeys.map((k, i) => [cityWeights[i], k] as [number, string]);
      const opts = [...w.global_options];
      const counts: Record<string, number> = { G: 0, Y: 0, LB: 0, DB: 0, W: 0 };
      const N = 8000;
      for (let i = 0; i < N; i++) {
        const t = w.sampleOptionsFromDistribution(opts);
        const b = biome(t);
        if (b in counts) counts[b]++;
      }
      return { N, counts };
    });
    const pGrass = cityResult.counts.G / cityResult.N;
    // Aggregate P(Grass) should be ≈0.7. Pre-fix (with the per-tile-not-per-
    // biome bug) this was ≈0.96 because grass has the most dominant tiles in
    // the manifest.
    expect(pGrass).toBeGreaterThan(0.65);
    expect(pGrass).toBeLessThan(0.75);
  });

  // Verifies the seedable RNG: same ?seed= → same sequence of cell
  // collapses. Uses the Step button to advance deterministically (no
  // wall-clock race) and the wfc-extras UI added for issue #16 follow-up.
  test('seed determinism + step button @multistep', async ({ page }) => {
    const collect = async () => {
      await page.goto(WFC_URL + '?seed=424242&autostart=0');
      await waitForP5Ready(page);
      // Confirm the seed propagated through the URL into the RNG state.
      const seedFromWindow = await page.evaluate(
        () => (window as unknown as { __wfcRngSeed: number }).__wfcRngSeed,
      );
      expect(seedFromWindow).toBe(424242);

      await page.locator('#tileselect .image-container').filter({ hasText: /REDGRID_EASY/i }).locator('button').click();
      await expect(page.locator('#STARTWFC')).toBeVisible();
      await page.locator('#STARTWFC').click();
      await expect(page.locator('#wfc-canvas canvas')).toBeVisible({ timeout: 15_000 });
      await expect(page.locator('#wfc-extras')).toBeVisible();
      // Seed input should also display the active seed.
      await expect(page.locator('#wfc-seed')).toHaveValue('424242');

      // Step several times. Each click forces one collapse + propagation.
      for (let i = 0; i < 6; i++) {
        await page.locator('#wfc-step').click();
        await page.waitForTimeout(60);
      }
      // Snapshot a deterministic fingerprint of the grid: every cell's
      // first option, in position order.
      return page.evaluate(() => {
        const w = window as unknown as {
          grid_list: Array<{ position: [number, number]; options: string[] }>;
        };
        return w.grid_list
          .slice()
          .sort((a, b) => a.position[0] - b.position[0] || a.position[1] - b.position[1])
          .map(c => c.options[0] || '')
          .join('|');
      });
    };
    const first = await collect();
    const second = await collect();
    expect(first).toBe(second);
    // Sanity: at least one cell collapsed, otherwise the test would pass
    // trivially on empty grids.
    expect(first.replace(/\|/g, '').length).toBeGreaterThan(0);
  });

  // Mixed-initiative click-to-collapse: clicking an uncollapsed cell on
  // the canvas opens a popover whose thumbnails force that cell's
  // collapse choice.
  test('click-to-collapse opens popover and applies choice @multistep', async ({ page }) => {
    await page.goto(WFC_URL_FROZEN);
    await waitForP5Ready(page);
    await page.locator('#tileselect .image-container').filter({ hasText: /REDGRID_EASY/i }).locator('button').click();
    await page.locator('#STARTWFC').click();
    const canvas = page.locator('#wfc-canvas canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Click roughly the centre of the canvas — with the default grid_size
    // of 2 that lands inside a cell. The popover renders inside #wfc-canvas
    // so it inherits the host's positioning.
    const box = await canvas.boundingBox();
    if (!box) throw new Error('canvas box missing');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    const popover = page.locator('.wfc-popover');
    await expect(popover).toBeVisible({ timeout: 5_000 });
    // At least one option thumbnail rendered.
    const thumbs = popover.locator('img');
    await expect(thumbs.first()).toBeVisible();

    // Capture which tile name we're about to pick, then click it.
    const chosen = await thumbs.first().getAttribute('alt');
    await thumbs.first().click();
    // Popover dismisses on selection.
    await expect(popover).toHaveCount(0);

    // The chosen cell should reach options.length === 1 (the picked tile)
    // after the next render tick processes the queued manual collapse.
    await page.waitForFunction(
      (target) => {
        const w = window as unknown as {
          grid_list: Array<{ options: string[] }>;
        };
        return w.grid_list.some(c => c.options.length === 1 && c.options[0] === target);
      },
      chosen,
      { timeout: 5_000 },
    );
  });

  // Regression: clicking near the bottom-right corner of the canvas used
  // to render the popover overflowing the canvas host (right/bottom
  // edges off-screen). Now openPopoverForCell measures the popover and
  // clamps left/top to stay inside the host bounds.
  test('click-to-collapse popover stays inside canvas bounds @multistep', async ({ page }) => {
    await page.goto(WFC_URL_FROZEN);
    await waitForP5Ready(page);
    await page.locator('#tileselect .image-container').filter({ hasText: /REDGRID_EASY/i }).locator('button').click();
    await page.locator('#STARTWFC').click();
    const canvas = page.locator('#wfc-canvas canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    const box = await canvas.boundingBox();
    if (!box) throw new Error('canvas box missing');
    // Click within the bottom-right cell (grid_size defaults to 2 → cells
    // are half the canvas; clicking near the corner used to push the
    // popover off-screen).
    await page.mouse.click(box.x + box.width - 6, box.y + box.height - 6);

    const popover = page.locator('.wfc-popover');
    await expect(popover).toBeVisible({ timeout: 5_000 });

    // The popover's bounding rect must sit inside #wfc-canvas's bounding
    // rect (with a few pixels of slack for borders/margins). Skip the
    // check on small viewports where the popover is a bottom sheet
    // anchored by CSS rather than positioned by JS.
    const placement = await page.evaluate(() => {
      const host = document.getElementById('wfc-canvas');
      const pop = document.querySelector('.wfc-popover');
      if (!host || !pop) return null;
      const h = host.getBoundingClientRect();
      const p = pop.getBoundingClientRect();
      return {
        hostLeft: h.left, hostTop: h.top, hostRight: h.right, hostBottom: h.bottom,
        popLeft: p.left, popTop: p.top, popRight: p.right, popBottom: p.bottom,
        isMobile: window.matchMedia('(max-width: 640px)').matches,
      };
    });
    if (!placement) throw new Error('placement read failed');
    if (!placement.isMobile) {
      expect(placement.popLeft).toBeGreaterThanOrEqual(placement.hostLeft - 1);
      expect(placement.popTop).toBeGreaterThanOrEqual(placement.hostTop - 1);
      expect(placement.popRight).toBeLessThanOrEqual(placement.hostRight + 1);
      expect(placement.popBottom).toBeLessThanOrEqual(placement.hostBottom + 1);
    }
  });

  // Regression for the "second collapse looks bugged" report: complete a
  // CITY run, hit Reset, pick CITY again, click STARTWFC, and verify the
  // canvas comes back to a fresh state (grid is uncollapsed, status_button
  // shows the initial label, Pause state is reset) before the user clicks
  // anything else.
  test('second collapse on CITY grid is fully reset @multistep', async ({ page }) => {
    await page.goto(WFC_URL_FROZEN);
    await waitForP5Ready(page);

    // --- First run: CITY, grid 2, step through every cell ---
    await page.locator('#tileselect .image-container').filter({ hasText: /CITY/i }).locator('button').click();
    await page.locator('#STARTWFC').click();
    await expect(page.locator('#wfc-canvas canvas')).toBeVisible({ timeout: 15_000 });

    // Run to completion via repeated Step clicks (deterministic, no
    // races with auto-throttling). grid_size defaults to 2 → 4 cells,
    // but backtracking can re-visit; cap iterations generously.
    for (let i = 0; i < 40; i++) {
      const done = await page.evaluate(() => {
        const w = window as unknown as {
          grid_list: Array<{ options: string[] }>;
        };
        return w.grid_list.length > 0 && w.grid_list.every(c => c.options.length === 1);
      });
      if (done) break;
      await page.locator('#wfc-step').click();
      await page.waitForTimeout(120);
    }
    const finishedFirst = await page.evaluate(() => {
      const w = window as unknown as {
        grid_list: Array<{ options: string[] }>;
      };
      return w.grid_list.length > 0 && w.grid_list.every(c => c.options.length === 1);
    });
    expect(finishedFirst).toBe(true);

    // --- Reset back to step 1 ---
    await page.locator('#resetButton').click();
    await expect(page.locator('#tileselect')).toBeVisible();

    // --- Second run: pick CITY again, click STARTWFC ---
    await page.locator('#tileselect .image-container').filter({ hasText: /CITY/i }).locator('button').click();
    await expect(page.locator('#STARTWFC')).toBeVisible();
    await page.locator('#STARTWFC').click();
    await expect(page.locator('#wfc-canvas canvas')).toBeVisible({ timeout: 15_000 });

    // Right after STARTWFC, before any further user action, the grid
    // should be in a fresh state — every cell has multiple options
    // remaining. Pre-fix this still held the collapsed grid from run 1.
    const fresh = await page.evaluate(() => {
      const w = window as unknown as {
        grid_list: Array<{ options: string[] }>;
        status_bool: boolean;
        isPaused?: boolean;
      };
      return {
        cellCount: w.grid_list.length,
        allUncollapsed: w.grid_list.every(c => c.options.length > 1),
        statusBool: w.status_bool,
      };
    });
    expect(fresh.cellCount).toBeGreaterThan(0);
    expect(fresh.allUncollapsed).toBe(true);
    expect(fresh.statusBool).toBe(false);

    // And the Play/Pause toggle should read "Pause" (i.e. unpaused) on a
    // fresh run, even if the previous run left isPaused=true via Step.
    await expect(page.locator('#wfc-play')).toHaveText('Pause');

    // The grid-size slider lives inside #wfc-primary, and #wfc-primary
    // must come before #wfc-extras inside #wfc-controls. Pre-fix the
    // bslider would migrate below #wfc-extras on the second STARTWFC and
    // looked "gone" to the user.
    const sliderPosition = await page.evaluate(() => {
      const ctrl = document.getElementById('wfc-controls');
      const primary = document.getElementById('wfc-primary');
      const extras = document.getElementById('wfc-extras');
      if (!ctrl || !primary || !extras) return { found: false };
      const slider = primary.querySelector('input[type="range"]') as HTMLInputElement | null;
      if (!slider) return { found: false };
      const kids = Array.from(ctrl.children);
      return {
        found: true,
        primaryIdx: kids.indexOf(primary),
        extrasIdx: kids.indexOf(extras),
        sliderInsidePrimary: slider.parentElement === primary,
      };
    });
    expect(sliderPosition.found).toBe(true);
    expect(sliderPosition.sliderInsidePrimary).toBe(true);
    expect(sliderPosition.primaryIdx).toBeLessThan(sliderPosition.extrasIdx as number);

    // Sanity: the algorithm is alive after second STARTWFC. We can't
    // assert "one Step → one collapsed cell" because on tiny CITY grids
    // (2x2) the very first propagation can hit optionsError with an
    // empty backtracking history; recovery then wipes to a fresh grid,
    // leaving the collapsed-cell count back at 0. Instead, step a few
    // times and verify the engine is still healthy — `status_bool`
    // alternates between true and false as part of the normal pick /
    // propagate cycle, and the grid stays a valid array of cells.
    for (let i = 0; i < 4; i++) {
      await page.locator('#wfc-step').click();
      await page.waitForTimeout(120);
    }
    const alive = await page.evaluate(() => {
      const w = window as unknown as {
        grid_list: Array<{ options: string[]; position: [number, number] }>;
      };
      return {
        isArray: Array.isArray(w.grid_list),
        size: w.grid_list.length,
        allCellsValid: w.grid_list.every(
          c => Array.isArray(c.options) && Array.isArray(c.position) && c.position.length === 2,
        ),
      };
    });
    expect(alive.isArray).toBe(true);
    expect(alive.size).toBeGreaterThan(0);
    expect(alive.allCellsValid).toBe(true);
  });

  // Regression: large CITY grids could drain the backtracking history
  // mid-recovery, causing old_grids.pop() to return undefined. The
  // undefined `grid_list` then hit `.some(...)` inside checkDirection,
  // threw, and the secondary throw killed p5's draw loop — leaving the
  // canvas frozen and the Restart button without a render path.
  // We trigger the failure path directly (clearing old_grids + tracking
  // mid-backtrack) and verify draw() recovers without freezing.
  test('backtracking exhaustion does not freeze draw loop @multistep', async ({ page }) => {
    await page.goto(WFC_URL_FROZEN);
    await waitForP5Ready(page);
    await page.locator('#tileselect .image-container').filter({ hasText: /CITY/i }).locator('button').click();
    await page.locator('#STARTWFC').click();
    await expect(page.locator('#wfc-canvas canvas')).toBeVisible({ timeout: 15_000 });

    // Run a couple of Step ticks so the algorithm has SOMETHING in its
    // tracking / old_grids buffers and `neighbour` references a real cell.
    await page.locator('#wfc-step').click();
    await page.waitForTimeout(60);
    await page.locator('#wfc-step').click();
    await page.waitForTimeout(60);

    // Force the failure mode: drain history while leaving backtracking=true
    // and a stale `neighbour`. Pre-fix, the next draw frame popped
    // undefined into grid_list and the loop crashed.
    await page.evaluate(() => {
      const w = window as unknown as {
        old_grids: unknown[];
        tracking: unknown[];
        backtracking: boolean;
        status_bool: boolean;
      };
      w.old_grids = [];
      w.tracking = [];
      w.backtracking = true;
      w.status_bool = true;
    });

    // Drive a few draw cycles by clicking Step (which sets forceStepOnce
    // so the algorithm advances even though we forced isPaused earlier
    // via the Step button).
    for (let i = 0; i < 3; i++) {
      await page.locator('#wfc-step').click();
      await page.waitForTimeout(150);
    }

    // Two things should now hold:
    //   1. window.__wfcReady is still true (the bootstrap flag).
    //   2. The Restart button (status_button) still drives a state reset.
    const ready = await page.evaluate(
      () => (window as unknown as { __wfcReady?: boolean }).__wfcReady === true,
    );
    expect(ready).toBe(true);

    // Hit Restart through the p5 status_button. Pre-fix this set state
    // but draw() never ran again, so grid_list stayed undefined.
    await page.evaluate(() => {
      const w = window as unknown as { changeState: () => void };
      w.changeState();
    });
    await page.waitForTimeout(200);

    // After Restart, grid_list is a non-empty array. Pre-fix it was
    // undefined (because old_grids.pop() returned undefined inside the
    // backtracking catch and the secondary throw killed draw()).
    const afterRestart = await page.evaluate(() => {
      const w = window as unknown as {
        grid_list: Array<{ options: string[] }>;
      };
      return {
        gridLen: Array.isArray(w.grid_list) ? w.grid_list.length : -1,
      };
    });
    expect(afterRestart.gridLen).toBeGreaterThan(0);

    // Wait for the auto-run to make progress — changeState() leaves
    // isPaused=false and status_bool=true, so the draw loop should
    // collapse cells over the next few frames. If draw() were dead
    // (the pre-fix symptom), no cells would collapse here.
    await page.waitForTimeout(400);
    const progress = await page.evaluate(() => {
      const w = window as unknown as {
        grid_list: Array<{ options: string[] }>;
      };
      return w.grid_list.filter(c => c.options.length === 1).length;
    });
    expect(progress).toBeGreaterThan(0);
  });
});
