import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // Reduce parallelism to avoid server overload
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Add retries for local dev too
  workers: process.env.CI ? 1 : 2, // Limit workers to reduce server load
  reporter: "html",
  timeout: 60000, // Increase global timeout
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    actionTimeout: 15000, // Increase action timeout
    navigationTimeout: 15000, // Increase navigation timeout
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for server startup
  },
});
