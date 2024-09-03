import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect, Page } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { bypassVercelProtection } from "../helpers";

const GENERATION_TIMEOUT = 75000;

async function waitForGeneration(page: Page) {
  const loadingElement = page.getByTestId("chat-stop");
  await expect(loadingElement).toBeVisible();
  await expect(loadingElement).not.toBeVisible({ timeout: GENERATION_TIMEOUT });
}

async function continueChat(page: Page) {
  await page.getByTestId("chat-continue").click();
}

async function isFinished(page: Page) {
  const progressText = await page.getByTestId("chat-progress").textContent();
  return progressText === "10 of 10 sections complete";
}

test.describe("Unauthenticated", () => {
  test("redirects to /sign-in", async ({ page }) => {
    await bypassVercelProtection(page);
    await page.goto(`${TEST_BASE_URL}/aila`);
    await expect(page.locator("h1")).toContainText("Sign in");
  });
});

test.describe("Mobile", { tag: ["@authenticated"] }, () => {
  test.use({ viewport: { width: 390, height: 840 } });

  test("Shows unavailable message", async ({ page }) => {
    await clerkSetup();
    await bypassVercelProtection(page);
    await setupClerkTestingToken({ page });

    await page.goto(`${TEST_BASE_URL}/aila`);
  });
});

test.describe("Authenticated", { tag: "@authenticated" }, () => {
  test("navigate to /aila as a signed-in user", async ({ page }) => {
    await clerkSetup();
    await bypassVercelProtection(page);
    await setupClerkTestingToken({ page });

    await page.goto(`${TEST_BASE_URL}/aila`);

    const h1 = page.getByTestId("chat-h1");
    await expect(h1).toBeInViewport();
  });

  test("Full aila flow", { tag: "@openai" }, async ({ page }) => {
    test.setTimeout(GENERATION_TIMEOUT * 5);

    await test.step("Setup", async () => {
      await clerkSetup();
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });

      await page.goto(`${TEST_BASE_URL}/aila`);
      await expect(page.getByTestId("chat-h1")).toBeInViewport();
    });

    await test.step("Fill in the chat box", async () => {
      const textbox = page.getByTestId("chat-input");
      const sendMessage = page.getByTestId("send-message");
      const message =
        "Create a KS1 lesson on the Romans, create the whole lesson without asking me any questions. As short as possible.";
      await textbox.fill(message);
      await expect(textbox).toContainText(message);
      await sendMessage.click();
    });

    await test.step("Iterate through the lesson plan", async () => {
      await page.waitForURL(/\/aila\/.+/);
      await waitForGeneration(page);

      for (let i = 0; i < 12; i++) {
        await continueChat(page);
        await waitForGeneration(page);
        if (await isFinished(page)) {
          break;
        }
        if (i === 11) {
          throw new Error("Failed to finish the lesson plan after 12 tries");
        }
      }
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
