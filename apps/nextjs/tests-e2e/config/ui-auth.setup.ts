import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";
import { Page, expect, test as setup } from "@playwright/test";
import path from "path";

import { bypassVercelProtection } from "../helpers";
import { TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_BASE_URL } from "./config";

const authFile = path.join(__dirname, "../.auth/user.json");

async function signInThroughUI(page: Page) {
  if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
    throw new Error("No TEST_USER_EMAIL or TEST_USER_PASSWORD");
  }

  await page.goto(`${TEST_BASE_URL}/sign-in`);
  await expect(page.locator("h1")).toContainText(
    "Sign in to Oak National Academy",
  );
  await page.waitForSelector(".cl-signIn-root", { state: "attached" });
  await page.locator("input[name=identifier]").fill(TEST_USER_EMAIL);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("link", { name: "Use another method", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Sign in with your password" })
    .click();
  await page.locator("input[name=password]").fill(TEST_USER_PASSWORD);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

setup("authenticate through UI setup", async ({ page }) => {
  await clerkSetup();
  await bypassVercelProtection(page);

  await page.context().clearCookies();

  await page.goto(TEST_BASE_URL);

  await setupClerkTestingToken({ page });

  try {
    await page.getByTestId("cookie-banner-accept").click();
  } catch {}

  await signInThroughUI(page);

  await page.waitForURL(TEST_BASE_URL);

  await page.context().storageState({ path: authFile });
});
