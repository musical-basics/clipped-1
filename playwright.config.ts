import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./scripts",
  testMatch: "screenshots.spec.ts",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:8081",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "Desktop",
      use: {
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: "Mobile",
      use: {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
      },
    },
  ],
});
