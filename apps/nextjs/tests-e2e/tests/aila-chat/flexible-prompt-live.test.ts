import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

import { getAilaUrl } from "@/utils/getAilaUrl";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers/vercel";
import {
  continueChat,
  isFinished,
  performAndWaitForGeneration,
} from "./helpers";

const generationTimeout = 75000;

test(
  "Aila flow with live OpenAI",
  // This test calls OpenAI rather than fixtures, so we don't want to include it in CI
  { tag: ["@openai", "@common-auth"] },
  async ({ page }) => {
    test.setTimeout(generationTimeout * 5);

    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });

      await page.goto(`${TEST_BASE_URL}${getAilaUrl("lesson")}`);
      await expect(page.getByTestId("chat-h1")).toBeInViewport();
    });

    await test.step("Send message and generate full lesson plan", async () => {
      await performAndWaitForGeneration(page, generationTimeout, async () => {
        await page
          .getByTestId("chat-input")
          .fill(
            "Create a KS1 lesson on the Romans, create the whole lesson without asking me any questions. As short as possible.",
          );
        await Promise.all([
          page.getByTestId("send-message").click(),
          page.waitForURL(/\/aila\/.+/),
        ]);
      });

      for (let i = 0; i < 12; i++) {
        if (await isFinished(page)) {
          break;
        }
        await performAndWaitForGeneration(page, generationTimeout, async () => {
          await continueChat(page);
        });
        if (i === 11) {
          throw new Error("Failed to finish the lesson plan after 12 tries");
        }
      }
    });
  },
);
