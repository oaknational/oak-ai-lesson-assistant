import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers/vercel";

test.describe("Unauthenticated", () => {
  test("redirects to /sign-in", async ({ page }) => {
    await bypassVercelProtection(page);
    await page.goto(`${TEST_BASE_URL}/aila`);
    await expect(page.locator("h1")).toContainText("Sign in");
  });
});

test.describe("Authenticated", { tag: "@common-auth" }, () => {
  test("navigate to /aila as a signed-in user", async ({ page }) => {
    await bypassVercelProtection(page);
    await setupClerkTestingToken({ page });

    await page.goto(`${TEST_BASE_URL}/aila`);

    const h1 = page.getByTestId("chat-h1");
    await expect(h1).toBeInViewport();
  });
});
