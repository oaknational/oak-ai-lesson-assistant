import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests-e2e",

  projects: [
    {
      name: "setup",
      testMatch: "global.setup.ts",
    },
    {
      name: "auth-setup",
      testMatch: "ui-auth.setup.ts",
      dependencies: ["setup"],
    },
    {
      name: "public",
      grepInvert: /@authenticated/,
      use: {
        ...devices["Desktop Chrome"],
      },
      dependencies: ["setup"],
    },
    {
      name: "authenticated",
      grep: /@authenticated/,

      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests-e2e/.auth/user.json",
      },
      dependencies: ["setup", "auth-setup"],
    },
  ],
  reporter: process.env.CI
    ? [["github"], ["@estruyf/github-actions-reporter"], ["html"]]
    : "list",
  use: {
    trace: "retain-on-failure",
  },
  retries: process.env.CI ? 1 : 0,
  outputDir: "./tests-e2e/test-results",
  forbidOnly: process.env.CI === "true",
});
