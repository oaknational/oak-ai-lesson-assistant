import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect, Page } from "@playwright/test";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers";
import {
  continueChat,
  expectSectionsComplete,
  isFinished,
  waitForGeneration,
} from "./helpers";

type FixtureMode = "record" | "replay";

// --------
// CHANGE "replay" TO "record" TO RECORD A NEW FIXTURE
// --------
// const FIXTURE_MODE = "record" as FixtureMode;
const FIXTURE_MODE = "replay" as FixtureMode;

const applyFixtures = async (page: Page) => {
  let fixtureName: string;

  await page.route("**/api/chat", async (route) => {
    const headers = route.request().headers();
    headers["x-e2e-fixture-name"] = fixtureName;
    headers["x-e2e-fixture-mode"] = FIXTURE_MODE;
    await route.fallback({ headers });
  });

  return {
    setFixture: async (name: string) => {
      fixtureName = name;
    },
  };
};

test.describe("Authenticated", { tag: "@authenticated" }, () => {
  test("Full aila flow with Romans fixture", async ({ page }) => {
    const generationTimeout = FIXTURE_MODE === "record" ? 75000 : 50000;
    test.setTimeout(generationTimeout * 5);

    await test.step("Setup", async () => {
      await clerkSetup();
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });

      await page.goto(`${TEST_BASE_URL}/aila`);
      await expect(page.getByTestId("chat-h1")).toBeInViewport();
    });

    const { setFixture } = await applyFixtures(page);

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
      await page.waitForTimeout(500);

      setFixture("roman-britain-2");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectSectionsComplete(page, 3);
      await page.waitForTimeout(500);

      setFixture("roman-britain-3");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectSectionsComplete(page, 7);
      await page.waitForTimeout(500);

      setFixture("roman-britain-4");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectSectionsComplete(page, 10);
      await page.waitForTimeout(500);

      setFixture("roman-britain-5");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);
      await expectSectionsComplete(page, 10);
      await page.waitForTimeout(500);

      await isFinished(page);
    });

    await test.step("Go to downloads page", async () => {
      // Open 'download resources' menu
      const downloadResources = page.getByTestId("chat-download-resources");
      await downloadResources.click();
      page.waitForURL(/\aila\/.*\/download/);

      // Click to download lesson plan
      const downloadLessonPlan = page.getByTestId("chat-download-lesson-plan");
      await downloadLessonPlan.click();

      // Skip feedback form
      if (await page.getByLabel("Skip").isVisible()) {
        await page.getByLabel("Skip").click();
      } else {
        console.log("Feedback form not found");
      }

      page.getByRole("heading", { name: "Download resources" });
    });
  });
});
