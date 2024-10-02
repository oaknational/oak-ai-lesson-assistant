import { test, expect, Page } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { prepareUser } from "../helpers/auth";
import { bypassVercelProtection } from "../helpers/vercel";

const TOXIC_TAG = "mod:tox";

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

test("Users are banned after 3 toxic lessons", async ({ page }) => {
  const login = await test.step("Setup", async () => {
    await bypassVercelProtection(page);
    const login = await prepareUser(page, "nearly-banned");

    await page.goto(`${TEST_BASE_URL}/aila`);
    await expect(page.getByTestId("chat-h1")).toBeInViewport();
    return login;
  });

  const { setFixture } = await applyFixtures(page);

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
