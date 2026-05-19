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
  letUiSettle,
  performAndWaitForGeneration,
  scrollLessonPlanFromTopToBottom,
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

    await test.step("Send message and generate full lesson plan", async () => {
      setFixture("roman-britain-1");
      await performAndWaitForGeneration(page, generationTimeout, async () => {
        await page
          .getByTestId("chat-input")
          .fill("Create a KS1 lesson on the end of Roman Britain");
        await Promise.all([
          page.getByTestId("send-message").click(),
          page.waitForURL(/\/aila\/.+/),
        ]);
      });
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 3);
      await closePreview(page);
      await letUiSettle(page, testInfo);

      setFixture("roman-britain-2");
      await performAndWaitForGeneration(page, generationTimeout, async () => {
        await continueChat(page);
      });
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 7);
      await closePreview(page);
      await letUiSettle(page, testInfo);

      setFixture("roman-britain-3");
      await performAndWaitForGeneration(page, generationTimeout, async () => {
        await continueChat(page);
      });
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 10);
      await closePreview(page);
      await letUiSettle(page, testInfo);

      setFixture("roman-britain-4");
      await performAndWaitForGeneration(page, generationTimeout, async () => {
        await continueChat(page);
      });
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 10);
      await letUiSettle(page, testInfo);
      await scrollLessonPlanFromTopToBottom(page);
      await expectFinished(page);
    });
  },
);
