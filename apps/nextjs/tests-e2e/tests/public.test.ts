import { expect, test } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { bypassVercelProtection } from "../helpers/vercel";

test("/ loads", async ({ page }) => {
  await bypassVercelProtection(page);

  await page.goto(`${TEST_BASE_URL}/`);
  await expect(
    page.getByRole("heading", {
      name: "Build tailor-made lessons and teaching materials with AI",
    }),
  ).toBeInViewport();
});
