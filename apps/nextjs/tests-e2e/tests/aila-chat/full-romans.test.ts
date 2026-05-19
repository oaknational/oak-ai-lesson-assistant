import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

import { getAilaUrl } from "@/utils/getAilaUrl";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers/vercel";
import type { FixtureMode } from "./helpers";
import {
  applyLlmFixtures,
  continueChat,
  expectFinished,
  isFinished,
  performAndWaitForGeneration,
  scrollLessonPlanFromTopToBottom,
} from "./helpers";

// --------
// CHANGE "replay" TO "record" TO RECORD A NEW FIXTURE
// --------
// const FIXTURE_MODE = "record" as FixtureMode;
const FIXTURE_MODE = "replay" as FixtureMode;

test(
  "Full aila flow with Romans fixture",
  { tag: "@common-auth" },
  async ({ page }) => {
    const generationTimeout = FIXTURE_MODE === "record" ? 75000 : 50000;
    test.setTimeout(generationTimeout * 5);

    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });

      await page.goto(`${TEST_BASE_URL}${getAilaUrl("lesson")}`);
      await expect(page.getByTestId("chat-h1")).toContainText("Hello,", {
        timeout: 15000,
      });
    });

    const { setFixture } = await applyLlmFixtures(page, FIXTURE_MODE);

    await test.step("Fill in the chat box", async () => {
      const textbox = page.getByTestId("chat-input");
      const message = "Create a KS1 lesson on the end of Roman Britain";
      await textbox.fill(message);
      await expect(textbox).toHaveValue(message);

      setFixture("roman-britain-1");
    });

    await test.step("Send message and generate full lesson plan", async () => {
      const maxIterations = 20;
      let fixtureNumber = 1;

      await performAndWaitForGeneration(page, generationTimeout, async () => {
        await Promise.all([
          page.getByTestId("send-message").click(),
          page.waitForURL(/\/aila\/.+/),
        ]);
      });

      while (fixtureNumber < maxIterations) {
        if (await isFinished(page)) {
          break;
        }
        fixtureNumber += 1;
        setFixture(`roman-britain-${fixtureNumber}`);
        await performAndWaitForGeneration(page, generationTimeout, async () => {
          await continueChat(page);
        });
      }

      await scrollLessonPlanFromTopToBottom(page);
      await expectFinished(page);
    });
  },
);
