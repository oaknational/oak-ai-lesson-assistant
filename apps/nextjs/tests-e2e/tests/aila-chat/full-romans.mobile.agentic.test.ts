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
  getSectionsComplete,
  isFinished,
  letUiSettle,
  performAndWaitForGeneration,
  scrollLessonPlanFromTopToBottom,
} from "./helpers";

// --------
// CHANGE "replay" TO "record" TO RECORD A NEW FIXTURE
// (recording runs live against OpenAI and requires a local dev server)
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
  "Full aila flow with Romans fixture (agentic)",
  { tag: ["@mobile-common-auth", "@agentic"] },
  async ({ page }, testInfo) => {
    const generationTimeout = FIXTURE_MODE === "record" ? 75000 : 50000;
    test.setTimeout(generationTimeout * 5);

    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });

      await page.goto(`${TEST_BASE_URL}${getAilaUrl("lesson")}`);
      await expect(page.getByTestId("chat-h1")).toBeInViewport();
    });

    const { setFixture } = await applyLlmFixtures(
      page,
      FIXTURE_MODE,
      "clean",
      "agentic",
    );

    await test.step("Send message and generate full lesson plan", async () => {
      const maxIterations = 20;
      let fixtureNumber = 1;

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

      // The agentic planner does not complete a fixed number of sections per
      // turn, so assert monotonic progress rather than exact counts.
      let previousSections = await getSectionsComplete(page);

      while (fixtureNumber < maxIterations) {
        if (await isFinished(page)) {
          break;
        }
        await closePreview(page);
        await letUiSettle(page, testInfo);

        fixtureNumber += 1;
        setFixture(`roman-britain-${fixtureNumber}`);
        await performAndWaitForGeneration(page, generationTimeout, async () => {
          await continueChat(page);
        });
        await expectPreviewVisible(page);

        const sections = await getSectionsComplete(page);
        expect(sections).toBeGreaterThanOrEqual(previousSections);
        previousSections = sections;
      }

      await letUiSettle(page, testInfo);
      await scrollLessonPlanFromTopToBottom(page);
      await expectFinished(page);
    });
  },
);
