import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { bypassVercelProtection } from "../helpers/vercel";

test(
  "navigate to /quiz-designer as a signed-in user",
  { tag: "@authenticated" },
  async ({ page }) => {
    await bypassVercelProtection(page);
    await setupClerkTestingToken({ page });

    await page.goto(`${TEST_BASE_URL}/quiz-designer`);

    const h1 = page.getByTestId("quiz-designer-h1");
    await expect(h1).toBeInViewport();
  },
);
