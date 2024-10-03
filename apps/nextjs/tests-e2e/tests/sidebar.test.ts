import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { bypassVercelProtection } from "../helpers/vercel";

test(
  "Loading a lesson from the sidebar",
  { tag: "@common-auth" },
  async ({ page }) => {
    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });
      await page.goto(`${TEST_BASE_URL}/aila`);
    });

    await test.step("Select a lesson", async () => {
      await page.getByTestId("sidebar-button").click();
      const sidebar = page.getByTestId("sidebar");
      expect(sidebar).toBeVisible();
      await sidebar.getByText("Software Testing Techniques").click();
    });

    await test.step("Lesson has loaded", async () => {
      await page.waitForURL(/\/aila\/.+/);
      await expect(page.locator("h1")).toContainText(
        "Software Testing Techniques",
      );
    });
  },
);
