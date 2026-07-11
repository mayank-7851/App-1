// @ts-check
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  // Serve the static site so the suite is self-contained — no manually-started server needed.
  webServer: {
    command: 'python3 -m http.server 8080',
    port: 8080,
    reuseExistingServer: false,
    timeout: 20000,
  },
  use: {
    baseURL: 'http://localhost:8080',
    video: 'on',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
