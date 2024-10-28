import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers/vercel";
import type { FixtureMode } from "./helpers";
import {
  applyLlmFixtures,
  continueChat,
  expectFinished,
  expectSectionsComplete,
  waitForGeneration,
} from "./helpers";

// --------
// CHANGE "replay" TO "record" TO RECORD A NEW FIXTURE
// --------
// const FIXTURE_MODE = "record" as FixtureMode;
const FIXTURE_MODE = "replay" as FixtureMode;

test(
  "Full aila flow with Romans fixture",
  { tag: "@common-auth" },
  async ({ page }, testInfo) => {
    const generationTimeout = FIXTURE_MODE === "record" ? 75000 : 50000;
    test.setTimeout(generationTimeout * 5);

    // The chat UI has a race condition when you submit a message too quickly after the previous response
    // This is a temporary fix to fix test flake
    async function letUiSettle() {
      return await page.waitForTimeout(testInfo.retry === 0 ? 500 : 6000);
    }

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
      const message =
        "Create a KS1 lesson on the end of Roman Britain. Ask a question for each quiz and cycle";
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
      await expectSectionsComplete(page, 1);
      await letUiSettle();

      setFixture("roman-britain-2");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectSectionsComplete(page, 3);
      await letUiSettle();

      setFixture("roman-britain-3");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectSectionsComplete(page, 7);
      await letUiSettle();

      setFixture("roman-britain-4");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectSectionsComplete(page, 10);
      await letUiSettle();

      setFixture("roman-britain-5");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectSectionsComplete(page, 10);

      await expectFinished(page);
    });
  },
);
