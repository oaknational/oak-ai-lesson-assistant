import { test, expect } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { prepareUser } from "../helpers/auth";
import { bypassVercelProtection } from "../helpers/vercel";

test.describe("Demo accounts", () => {
  test("should see the demo banner", async ({ page }) => {
    await bypassVercelProtection(page);
    await prepareUser(page, "demo");

    await page.goto(`${TEST_BASE_URL}/aila`);
    await expect(page.getByTestId("demo-banner")).toBeVisible();
    await expect(page.getByTestId("demo-banner")).toContainText(
      "Create 3 lessons per month",
    );
  });
});
