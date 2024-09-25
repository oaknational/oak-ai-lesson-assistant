import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

import { TEST_BASE_URL } from "../../config/config";
import { prepareUser } from "../../helpers/auth";
import { bypassVercelProtection } from "../../helpers/vercel";
import { isFinished } from "./helpers";

test("Downloading a completed lesson plan", async ({ page }) => {
  await test.step("Setup", async () => {
    await clerkSetup();
    await bypassVercelProtection(page);
    await setupClerkTestingToken({ page });

    await prepareUser(page, "typical");

    await page.goto(`${TEST_BASE_URL}/aila/e2e-seed-typical-chat`);
    await isFinished(page);
  });

  await test.step("Go to downloads page", async () => {
    // Open 'download resources' menu
    const downloadResources = page.getByTestId("chat-download-resources");
    await downloadResources.click();
    page.waitForURL(/aila\/.*\/download/);
    page.getByRole("heading", { name: "Download resources" });

    // Click to download lesson plan
    const downloadLessonPlan = page.getByTestId("chat-download-lesson-plan");
    await downloadLessonPlan.click();

    // Skip feedback form
    if (await page.getByLabel("Skip").isVisible()) {
      await page.getByLabel("Skip").click();
    }

    // Generating
    await expect(downloadLessonPlan).toContainText(
      "Generating Lesson plan for export",
    );

    // Generated
    await expect(downloadLessonPlan).toContainText(
      "Download lesson plan (.docx)",
    );
    await expect(downloadLessonPlan).toContainText(
      "Download Lesson plan (.pdf)",
    );
  });
});
