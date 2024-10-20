import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect, Page } from "@playwright/test";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers/vercel";
import {
  FixtureMode,
  applyLlmFixtures,
  continueChat,
  expectFinished,
  expectSectionsComplete,
  waitForGeneration,
} from "./helpers";

// --------
// CHANGE "replay" TO "record" TO RECORD A NEW FIXTURE
// --------
const FIXTURE_MODE = "record" as FixtureMode;
//const FIXTURE_MODE = "replay" as FixtureMode;

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
  async ({ page }) => {
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

      await waitForGeneration(page, generationTimeout);
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 1);
      await closePreview(page);

      setFixture("roman-britain-2");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 3);
      await closePreview(page);

      setFixture("roman-britain-3");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 7);
      await closePreview(page);

      setFixture("roman-britain-4");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 10);
      await closePreview(page);

      setFixture("roman-britain-5");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectPreviewVisible(page);
      await expectSectionsComplete(page, 10);
      await expectFinished(page);
    });
  },
);
