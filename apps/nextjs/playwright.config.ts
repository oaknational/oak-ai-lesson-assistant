import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests-e2e",

  projects: [
    // Setup projects: Run before other tests
    {
      name: "global-setup",
      testMatch: "global.setup.ts",
    },
    {
      name: "common-persona-setup",
      testMatch: "common-persona.setup.ts",
      dependencies: ["global-setup"],
    },

    // Projects by tag: Auth options
    {
      name: "No persona",
      grepInvert: /@(mobile-)?common-auth/,
      use: {
        ...devices["Desktop Chrome"],
      },
      dependencies: ["global-setup"],
    },
    {
      name: "Common persona",
      grep: /@common-auth/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests-e2e/.auth/common-user.json",
      },
      dependencies: ["common-persona-setup"],
    },
    {
      name: "Common persona - mobile",
      grep: /@mobile-common-auth/,
      use: {
        ...devices["iPhone 14"],
        storageState: "tests-e2e/.auth/common-user.json",
      },
      dependencies: ["common-persona-setup"],
    },
  ],
  reporter: process.env.CI
    ? [["github"], ["@estruyf/github-actions-reporter"], ["html"]]
    : [["list"], ["html"]],
  use: {
    trace: "retain-on-failure",
  },
  retries: process.env.CI ? 1 : 0,
  maxFailures: process.env.CI ? 10 : undefined,
  workers: process.env.NODE_ENV === "development" ? 5 : undefined,
  outputDir: "./tests-e2e/test-results",
  forbidOnly: process.env.CI === "true",
});
