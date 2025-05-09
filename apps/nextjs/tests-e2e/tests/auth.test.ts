import { aiLogger } from "@oakai/logger";

import { setupClerkTestingToken } from "@clerk/testing/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import {
  TEST_BASE_URL,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
} from "../config/config";
import { bypassVercelProtection } from "../helpers/vercel";

const log = aiLogger("auth");

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

test.skip("authenticate through Clerk UI", async ({ page }) => {
  await bypassVercelProtection(page);

  await page.context().clearCookies();

  await page.goto(TEST_BASE_URL);

  await setupClerkTestingToken({ page });

  try {
    await page.getByTestId("cookie-banner-accept").click();
  } catch (e) {
    log.error("No cookie banner", e);
  }

  await signInThroughUI(page);

  await page.waitForURL(TEST_BASE_URL);
});
