import { setupClerkTestingToken } from "@clerk/testing/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { getAilaUrl } from "@/utils/getAilaUrl";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers/vercel";
import { expectFinished } from "./helpers";

const getTestChatIdFromCookie = async (page: Page) => {
  const cookies = await page.context().cookies();
  const chatId = cookies.find((c) => c.name === "typicalChatId")?.value;
  return chatId;
};

test(
  "Downloading a completed lesson plan",
  { tag: "@common-auth" },
  async ({ page }) => {
    test.slow();

    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });

      const chatId = await getTestChatIdFromCookie(page);
      await page.goto(`${TEST_BASE_URL}${getAilaUrl("lesson")}/${chatId}`);
      await expectFinished(page);
    });

    await test.step("Go to downloads page", async () => {
      // Open 'download resources' menu
      const downloadResources = page.getByTestId("chat-download-resources");
      await downloadResources.click();
      await page.waitForURL(/aila\/lesson\/.*\/download/);
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
        "Generating lesson plan for export",
        { ignoreCase: true },
      );

      // Generated
      await expect(downloadLessonPlan).toContainText(
        "Download lesson plan (.docx)",
        { ignoreCase: true, timeout: 30000 },
      );
      await expect(downloadLessonPlan).toContainText(
        "Download lesson plan (.pdf)",
        { ignoreCase: true },
      );
    });
  },
);
