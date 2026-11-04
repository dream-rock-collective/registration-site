import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.e2e.ts",
  forbidOnly: Boolean(process.env["CI"]),
  workers: 1,
  use: { baseURL: "http://127.0.0.1:5181" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "bun run dev --host 127.0.0.1 --port 5181 --strictPort",
    url: "http://127.0.0.1:5181",
  },
});
