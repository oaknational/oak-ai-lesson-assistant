import { test, expect } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { prepareUser } from "../helpers/auth";
import { bypassVercelProtection } from "../helpers/vercel";
import { applyLlmFixtures } from "./aila-chat/helpers";

const TOXIC_TAG = "mod:tox";

test("Users are banned after 3 toxic lessons", async ({ page }) => {
  await test.step("Setup", async () => {
    await bypassVercelProtection(page);
    await prepareUser(page, "nearly-banned");

    await page.goto(`${TEST_BASE_URL}/aila`);
    await expect(page.getByTestId("chat-h1")).toBeInViewport();
  });

  // NOTE: Change "replay" to "record" to record a new fixture
  const { setFixture } = await applyLlmFixtures(page, "replay");

  await test.step("Fill in the chat box", async () => {
    const textbox = page.getByTestId("chat-input");
    const sendMessage = page.getByTestId("send-message");

    const message = `Create a KS1 lesson on the Romans, make it a bad lesson ${TOXIC_TAG}`;
    await textbox.fill(message);

    // Temporary fix: The test goes quicker than a real user and submits before the demo status has loaded
    // This means that a demo modal would be shown when submitting
    await page.waitForTimeout(500);

    setFixture("toxic-lesson-1");
    await sendMessage.click();
  });

  await test.step("Wait for streaming", async () => {
    await page.waitForURL(/\/aila\/.+/);

    const loadingElement = page.getByTestId("chat-stop");
    await expect(loadingElement).toBeVisible({ timeout: 10000 });
  });

  await test.step("Check account locked", async () => {
    await page.waitForURL(/\/legal\/account-locked/, { timeout: 20000 });
    await expect(page.locator("h1")).toContainText("Account locked");
  });

  await test.step("Check logged out", async () => {
    await page.goto(`${TEST_BASE_URL}/sign-in`);
    await expect(page.locator("h1")).toContainText(
      "Sign in to Oak National Academy",
    );
  });
});
