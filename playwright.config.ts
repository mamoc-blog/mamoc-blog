import { defineConfig, devices } from '@playwright/test';

// `video: 'on'` records every test. The CI workflow
// (.github/workflows/playwright.yml) stitches per-browser videos side-by-side
// into one MP4 + animated WebP that gets embedded in the PR comment, but it
// only includes tests whose title contains the `@multistep` tag. Mark new
// tests with `@multistep` when they exercise a multi-action flow worth
// watching in motion. See tests/e2e/multistep.spec.ts for the full rule.

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on',
    screenshot: 'only-on-failure',
  },
  // Desktop projects share the same desktop spec set and skip mobile.spec.ts;
  // mobile-chrome runs ONLY mobile.spec.ts. Keeping the split via
  // testMatch/testIgnore (rather than tags) means CI's `--project=` selector
  // naturally fans tests out the right way and the file you're editing tells
  // you which device(s) will run it.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/mobile.spec.ts'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: ['**/mobile.spec.ts'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: ['**/mobile.spec.ts'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: ['**/mobile.spec.ts'],
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
