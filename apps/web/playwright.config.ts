import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'npm run dev -w apps/api',
      port: 3001,
      cwd: '../..',
      reuseExistingServer: true,
      timeout: 10_000,
    },
    {
      command: 'npm run dev -w apps/web',
      port: 5173,
      cwd: '../..',
      reuseExistingServer: true,
      timeout: 10_000,
    },
  ],
});
