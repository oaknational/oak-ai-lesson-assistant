import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests-e2e",

  projects: [
    {
      name: "setup",
      testMatch: "global.setup.ts",
    },
    {
      name: "common-auth",
      testMatch: "common-auth.setup.ts",
      dependencies: ["setup"],
    },
    {
      name: "individually-authenticated",
      grepInvert: /@common-auth/,
      use: {
        ...devices["Desktop Chrome"],
      },
      dependencies: ["setup"],
    },
    {
      name: "common-authenticated",
      grep: /@common-auth/,

      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests-e2e/.auth/common-user.json",
      },
      dependencies: ["common-auth"],
    },
  ],
  reporter: process.env.CI
    ? [["github"], ["@estruyf/github-actions-reporter"], ["html"]]
    : "list",
  use: {
    trace: "retain-on-failure",
  },
  retries: process.env.CI ? 1 : 0,
  maxFailures: process.env.CI ? 10 : undefined,
  workers: process.env.NODE_ENV === "development" ? 5 : undefined,
  outputDir: "./tests-e2e/test-results",
  forbidOnly: process.env.CI === "true",
});
