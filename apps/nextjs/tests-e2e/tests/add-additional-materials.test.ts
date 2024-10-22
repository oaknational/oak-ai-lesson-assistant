import { test, expect, Page } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { prepareUser } from "../helpers/auth";
import { bypassVercelProtection } from "../helpers/vercel";
import { applyLlmFixtures, isFinished } from "./aila-chat/helpers";

test("adding additional materials", async ({ page, context, browser }) => {
  await test.step("Setup", async () => {
    await bypassVercelProtection(page);
    await prepareUser(page, "nearly-banned");

    await page.goto(`${TEST_BASE_URL}/aila`);
    await expect(page.getByTestId("chat-h1")).toBeInViewport();
  });

  // NOTE: Change "replay" to "record" to record a new fixture
  const { setFixture } = await applyLlmFixtures(page, "replay");

  await test.step("Wait for streaming", async () => {
    await page.waitForURL(/\/aila\/.+/);

    const loadingElement = page.getByTestId("chat-stop");
    await expect(loadingElement).toBeVisible({ timeout: 10000 });
  });

  //   await test.step("Anonymous user can't access", async () => {
  //     // Create a new incognito browser context
  //     const context = await browser.newContext();

  //     const anonymousPage = await context.newPage();
  //     await bypassVercelProtection(anonymousPage);
  //     await anonymousPage.goto(`${TEST_BASE_URL}/aila/${chatId}/share`);

  //     const title = anonymousPage.locator("h1");
  //     await expect(title).toHaveText("404: Page not found");

  //     // Dispose context once it's no longer needed.
  //     await context.close();
  //   });

  //   const sharePage = await test.step("Go to share page", async () => {
  //     await page.getByTestId("chat-share-button").click();

  //     const modal = page.getByTestId("chat-share-dialog");
  //     await expect(modal).toBeVisible();
  //     await expect(modal).toContainText("Share Chat");

  //     await modal.getByText("Create shareable link").click();

  //     const pagePromise = context.waitForEvent("page");
  //     await modal.getByText("Go to share page").click();
  //     const sharePage = await pagePromise;
  //     return sharePage;
  //   });

  //   await test.step("Share page", async () => {
  //     await sharePage.waitForURL(`${TEST_BASE_URL}/aila/${chatId}/share`);
  //     await checkPage(sharePage);
  //   });

  //   await test.step("Anonymous user can access", async () => {
  //     // Create a new incognito browser context
  //     const context = await browser.newContext();

  //     const anonymousPage = await context.newPage();
  //     await bypassVercelProtection(anonymousPage);
  //     await anonymousPage.goto(`${TEST_BASE_URL}/aila/${chatId}/share`);

  //     await checkPage(anonymousPage);

  //     // Dispose context once it's no longer needed.
  //     await context.close();
  //   });
});
