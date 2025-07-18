import { setupClerkTestingToken } from "@clerk/testing/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { getAilaUrl } from "@/utils/getAilaUrl";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers/vercel";
import type { FixtureMode } from "./helpers";
import {
  applyLlmFixtures,
  continueChat,
  expectFinished,
  expectSectionsComplete,
  expectStreamingStatus,
  letUiSettle,
  scrollLessonPlanFromTopToBottom,
  waitForGeneration,
} from "./helpers";

// --------
// CHANGE "replay" TO "record" TO RECORD A NEW FIXTURE
// --------
// const FIXTURE_MODE = "record" as FixtureMode;
const FIXTURE_MODE = "replay" as FixtureMode;

async function closePreview(page: Page) {
  await page.getByTestId("continue-building").click();
}

async function expectPreviewVisible(page: Page) {
  await expect(page.getByTestId("chat-right-hand-side-lesson")).toBeVisible();
  await expect(
    page.getByTestId("chat-right-hand-side-lesson"),
  ).toBeInViewport();
}

test(
  "Full aila flow with Romans fixture",
  { tag: "@mobile-common-auth" },
  async ({ page }, testInfo) => {
    const generationTimeout = FIXTURE_MODE === "record" ? 75000 : 50000;
    test.setTimeout(generationTimeout * 5);

    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });

      await page.goto(`${TEST_BASE_URL}${getAilaUrl("lesson")}`);
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

      await waitForGeneration(page, generationTimeout);
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 3);
      await closePreview(page);
      await expectStreamingStatus(page, "Idle", { timeout: 5000 });
      await letUiSettle(page, testInfo);

      setFixture("roman-britain-2");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 7);
      await closePreview(page);
      await expectStreamingStatus(page, "Idle", { timeout: 5000 });
      await letUiSettle(page, testInfo);

      setFixture("roman-britain-3");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 10);
      await closePreview(page);
      await expectStreamingStatus(page, "Idle", { timeout: 5000 });
      await letUiSettle(page, testInfo);

      setFixture("roman-britain-4");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 10);
      await expectStreamingStatus(page, "Idle", { timeout: 5000 });
      await letUiSettle(page, testInfo);
      await scrollLessonPlanFromTopToBottom(page);
      await expectFinished(page);
    });
  },
);
