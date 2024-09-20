import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers";
import { isFinished } from "./helpers";

test.describe("Authenticated", { tag: "@authenticated" }, () => {
  test("Downloading a lesson plan", async ({ page }) => {
    await test.step("Setup", async () => {
      await clerkSetup();
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });

      const testChat = await seedTestChat(page);

      await page.goto(`${TEST_BASE_URL}/aila/${testChat.id}`);
      await expect(page.getByTestId("chat-h1")).toBeInViewport();
      await isFinished(page);
    });

    await test.step("Go to downloads page", async () => {
      // Open 'download resources' menu
      const downloadResources = page.getByTestId("chat-download-resources");
      await downloadResources.click();
      page.waitForURL(/\aila\/.*\/download/);

      // Click to download lesson plan
      const downloadLessonPlan = page.getByTestId("chat-download-lesson-plan");
      await downloadLessonPlan.click();

      // Skip feedback form
      await page.getByLabel("Skip").click();
      page.getByRole("heading", { name: "Download resources" });
    });
  });
});
