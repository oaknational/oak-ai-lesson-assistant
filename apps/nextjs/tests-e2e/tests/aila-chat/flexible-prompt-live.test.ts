import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers";
import { continueChat, isFinished, waitForGeneration } from "./helpers";

const generationTimeout = 75000;

test.describe("Authenticated", { tag: "@authenticated" }, () => {
  test(
    "Aila flow with live OpenAI",
    // This test calls OpenAI rather than fixtures, so we don't want to include it in CI
    { tag: "@openai" },
    async ({ page }) => {
      test.setTimeout(generationTimeout * 5);

      await test.step("Setup", async () => {
        await clerkSetup();
        await bypassVercelProtection(page);
        await setupClerkTestingToken({ page });

        await page.goto(`${TEST_BASE_URL}/aila`);
        await expect(page.getByTestId("chat-h1")).toBeInViewport();
      });

      await test.step("Fill in the chat box", async () => {
        const textbox = page.getByTestId("chat-input");
        const sendMessage = page.getByTestId("send-message");
        const message =
          "Create a KS1 lesson on the Romans, create the whole lesson without asking me any questions. As short as possible.";
        await textbox.fill(message);
        await expect(textbox).toContainText(message);

        // TODO: the demo status doesn't seem to have been loaded yet so a demo modal is shown
        await page.waitForTimeout(500);

        await sendMessage.click();
      });

      await test.step("Iterate through the lesson plan", async () => {
        await page.waitForURL(/\/aila\/.+/);
        await waitForGeneration(page, generationTimeout);

        for (let i = 0; i < 12; i++) {
          await continueChat(page);
          await waitForGeneration(page, generationTimeout);
          if (await isFinished(page)) {
            break;
          }
          if (i === 11) {
            throw new Error("Failed to finish the lesson plan after 12 tries");
          }
        }
      });
    },
  );
});
