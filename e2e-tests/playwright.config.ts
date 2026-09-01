import { defineConfig, devices } from '@playwright/test';

// 被测前端地址：设置 E2E_BASE_URL 时指向已部署环境，并跳过本地 dev server
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:9527';

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  timeout: 45000,
  expect: { timeout: 10000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  outputDir: 'test-results',
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'auth/user.json' },
      dependencies: ['setup'],
    },
  ],
  // 已指定外部前端地址时不拉起 dev server
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        cwd: '../frontend',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60000,
      },
});
