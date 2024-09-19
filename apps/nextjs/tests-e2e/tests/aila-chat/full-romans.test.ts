import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect, Page } from "@playwright/test";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers";
import { continueChat, isFinished, waitForGeneration } from "./helpers";

type FixtureMode = "record" | "replay";
const FIXTURE_MODE = "replay" as FixtureMode;

// TODO: enable shorter timeouts for replays when they include moderations
const generationTimeout = FIXTURE_MODE === "record" ? 75000 : 50000;

const applyFixtures = async (page: Page) => {
  let fixtureName: string;

  await page.route("**/api/chat", async (route) => {
    const headers = route.request().headers();
    headers["x-e2e-fixture-name"] = fixtureName;
    headers["x-e2e-fixture-mode"] = FIXTURE_MODE;
    await route.continue({ headers });
  });

  return {
    setFixture: async (name: string) => {
      fixtureName = name;
    },
  };
};

test.describe("Authenticated", { tag: "@authenticated" }, () => {
  test("Full aila flow with Romans fixture", async ({ page }) => {
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
      const message = "Create a KS1 lesson on the end of Roman Britain";
      await textbox.fill(message);
      await expect(textbox).toContainText(message);

      // Temporary fix: The test goes quicker than a real user and submits before the demo status has loaded
      // This means that a demo modal would be shown when submitting
      await page.waitForTimeout(250);

      setFixture("roman-britain-1-intro");
      await sendMessage.click();
    });

    await test.step("Iterate through the fixtures", async () => {
      await page.waitForURL(/\/aila\/.+/);
      await waitForGeneration(page, generationTimeout);

      setFixture("roman-britain-2-quiz-cycles");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);

      setFixture("roman-britain-3-consistency");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);

      setFixture("roman-britain-4-done");
      await continueChat(page);
      await waitForGeneration(page, generationTimeout);

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
      await page.getByLabel("Skip").click();
      page.getByRole("heading", { name: "Download resources" });
    });
  });
});
