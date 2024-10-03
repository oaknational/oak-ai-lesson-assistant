import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect, Page } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { bypassVercelProtection } from "../helpers/vercel";
import { isFinished } from "./aila-chat/helpers";

const getTestChatIdFromCookie = async (page: Page) => {
  const cookies = await page.context().cookies();
  const chatId = cookies.find((c) => c.name === "typicalChatId")?.value;
  return chatId;
};

const checkPage = async (page: Page) => {
  const banner = page.getByTestId("share-banner");
  await expect(banner).toContainText(/Created by .+ typical/);
  await expect(banner).toContainText("Please check content carefully");

  const keyStageSubjectTitle = page.getByTestId("key-stage-subject");
  await expect(keyStageSubjectTitle).toContainText("Key Stage 4");
  await expect(keyStageSubjectTitle).toContainText("Computing");

  await expect(page.locator("h1")).toContainText("Software Testing Techniques");

  // NOTE: the "Copy link" button is not currently tested

  // NOTE: the chat for the typical persona doesn't have a moderation so
  // the moderation notice isn't tested

  const content = page.getByTestId("lesson-plan-markdown");
  await expect(content).toContainText(
    "I can explain different software testing techniques and their purposes.",
  );
  await expect(content).toContainText("What is the role of white-box testing?");
};

test(
  "sharing a lesson",
  { tag: "@common-auth" },
  async ({ page, context, browser }) => {
    const chatId = await getTestChatIdFromCookie(page);

    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });

      await page.goto(`${TEST_BASE_URL}/aila/${chatId}`);
      await isFinished(page);
    });

    await test.step("Anonymous user can't access", async () => {
      // Create a new incognito browser context
      const context = await browser.newContext();

      const anonymousPage = await context.newPage();
      await anonymousPage.goto(`${TEST_BASE_URL}/aila/${chatId}/share`);

      const title = anonymousPage.locator("h1");
      await expect(title).toHaveText("404: Page not found");

      // Dispose context once it's no longer needed.
      await context.close();
    });

    const sharePage = await test.step("Go to share page", async () => {
      await page.getByTestId("chat-share-button").click();

      const modal = page.getByTestId("chat-share-dialog");
      await expect(modal).toBeVisible();
      await expect(modal).toContainText("Share Chat");

      await modal.getByText("Create shareable link").click();

      const pagePromise = context.waitForEvent("page");
      await modal.getByText("Go to share page").click();
      return await pagePromise;
    });

    await test.step("Share page", async () => {
      await sharePage.waitForURL(`${TEST_BASE_URL}/aila/${chatId}/share`);
      await checkPage(sharePage);
    });

    await test.step("Anonymous user can access", async () => {
      // Create a new incognito browser context
      const context = await browser.newContext();

      const anonymousPage = await context.newPage();
      await anonymousPage.goto(`${TEST_BASE_URL}/aila/${chatId}/share`);

      await checkPage(anonymousPage);

      // Dispose context once it's no longer needed.
      await context.close();
    });
  },
);
