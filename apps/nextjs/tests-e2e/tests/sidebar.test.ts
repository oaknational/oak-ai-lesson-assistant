import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

import { getAilaUrl } from "@/utils/getAilaUrl";

import { TEST_BASE_URL } from "../config/config";
import { bypassVercelProtection } from "../helpers/vercel";

test(
  "Loading a lesson from the sidebar",
  { tag: "@common-auth" },
  async ({ page }) => {
    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });
      await page.goto(`${TEST_BASE_URL}${getAilaUrl("lesson")}`);
    });

    await test.step("Select a lesson", async () => {
      await page.getByTestId("sidebar-button").click();
      const sidebar = page.getByTestId("sidebar");
      await expect(sidebar).toBeVisible();
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
