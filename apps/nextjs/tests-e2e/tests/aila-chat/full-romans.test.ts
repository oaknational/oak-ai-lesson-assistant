import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers/vercel";
import type { FixtureMode } from "./helpers";
import {
  applyLlmFixtures,
  continueChat,
  expectFinished,
  expectStreamingStatus,
  hasInChatShareButton,
  isFinished,
  letUiSettle,
  scrollLessonPlanFromTopToBottom,
  waitForStreamingStatusChange,
} from "./helpers";

// --------
// CHANGE "replay" TO "record" TO RECORD A NEW FIXTURE
// --------
//const FIXTURE_MODE = "record" as FixtureMode;
const FIXTURE_MODE = "replay" as FixtureMode;

test(
  "Full aila flow with Romans fixture",
  { tag: "@common-auth" },
  async ({ page }, testInfo) => {
    const generationTimeout = FIXTURE_MODE === "record" ? 75000 : 50000;
    test.setTimeout(generationTimeout * 5);

    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });

      await page.goto(`${TEST_BASE_URL}/aila`);
      await expect(page.getByTestId("chat-h1")).toBeInViewport();
    });

    const { setFixture } = await applyLlmFixtures(page, FIXTURE_MODE);

    await test.step("Fill in the chat box", async () => {
      const textbox = page.getByTestId("chat-input");
      const sendMessage = page.getByTestId("send-message");
      const message = "Create a KS1 lesson on the end of Roman Britain";
      await textbox.fill(message);
      await expect(textbox).toContainText(message);

      // Temporary fix: The test goes quicker than a real user and submits before the demo status has loaded
      // This means that a demo modal would be shown when submitting
      await page.waitForTimeout(500);

      setFixture("roman-britain-1");
      await sendMessage.click();
    });

    await test.step("Iterate through the fixtures", async () => {
      await page.waitForURL(/\/aila\/.+/);

      const maxIterations = 10;

      for (
        let iterationCount = 2;
        iterationCount <= maxIterations;
        iterationCount++
      ) {
        await expectStreamingStatus(page, "RequestMade", { timeout: 5000 });

        await waitForStreamingStatusChange(
          page,
          "RequestMade",
          "Idle",
          generationTimeout,
        );

        await expectStreamingStatus(page, "Idle", { timeout: 5000 });

        if (await isFinished(page)) {
          break;
        }
        await letUiSettle(page, testInfo);
        setFixture(`roman-britain-${iterationCount}`);
        await continueChat(page);
        await waitForStreamingStatusChange(
          page,
          "Idle",
          "RequestMade",
          generationTimeout,
        );
      }

      await hasInChatShareButton(page);
      await scrollLessonPlanFromTopToBottom(page);
      await expectFinished(page);
    });
  },
);
