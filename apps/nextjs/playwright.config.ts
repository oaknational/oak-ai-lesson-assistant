import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests-e2e",
  projects: [
    {
      name: "auth-setup",
      testMatch: "ui-auth.setup.ts",
    },
    {
      name: "public",
      grepInvert: /@authenticated/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "authenticated",
      grep: /@authenticated/,

      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests-e2e/.auth/user.json",
      },
      dependencies: ["auth-setup"],
    },
  ],
  reporter: process.env.CI
    ? [["github"], ["@estruyf/github-actions-reporter"], ["html"]]
    : "list",
  use: {
    trace: "retain-on-failure",
  },
  outputDir: "./tests-e2e/test-results",
  forbidOnly: process.env.CI === "true",
});
