import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 60000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8765',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'python server.py --temporary --port 8765',
    url: 'http://127.0.0.1:8765/api/health',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
