import { setupClerkTestingToken } from "@clerk/testing/playwright";
<<<<<<< HEAD
import { test, expect, Page } from "@playwright/test";
=======
import { test, expect } from "@playwright/test";
>>>>>>> 1cfb186 (Update @clerk/testing to 1.3.7 to use sign-in helper)

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers/vercel";
import { isFinished } from "./helpers";

const getTestChatIdFromCookie = async (page: Page) => {
  const cookies = await page.context().cookies();
  const chatId = cookies.find((c) => c.name === "typicalChatId")?.value;
  return chatId;
};

<<<<<<< HEAD
test(
  "Downloading a completed lesson plan",
  { tag: "@common-auth" },
  async ({ page }) => {
    test.slow();

    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });
=======
  await test.step("Setup", async () => {
    await bypassVercelProtection(page);
    const { chatId } = await prepareUser(page, "typical");
>>>>>>> 1cfb186 (Update @clerk/testing to 1.3.7 to use sign-in helper)

      const chatId = await getTestChatIdFromCookie(page);
      await page.goto(`${TEST_BASE_URL}/aila/${chatId}`);
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
        { ignoreCase: true },
      );

      // Generated
      await expect(downloadLessonPlan).toContainText(
        "Download lesson plan (.docx)",
        { ignoreCase: true, timeout: 30000 },
      );
      await expect(downloadLessonPlan).toContainText(
        "Download Lesson plan (.pdf)",
        { ignoreCase: true },
      );
    });
  },
);
