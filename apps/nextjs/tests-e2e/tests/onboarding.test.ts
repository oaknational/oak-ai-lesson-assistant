import { expect, test } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { prepareUser } from "../helpers/auth";
import { bypassVercelProtection } from "../helpers/vercel";

test("Landing on the site when not onboarded", async ({ page }) => {
  await test.step("Setup", async () => {
    await bypassVercelProtection(page);
    await prepareUser(page, "needs-onboarding");
    await page.goto(`${TEST_BASE_URL}/aila`);

    await page.waitForURL(`${TEST_BASE_URL}/onboarding`);
    await expect(
      page.getByText("This product is experimental and uses AI"),
    ).toBeVisible();
  });

  await test.step("Toggle terms", async () => {
    const termsHeading = page.getByRole("heading", {
      name: "Terms and Conditions",
      exact: true,
    });
    await expect(termsHeading).not.toBeVisible();

    await page.getByText("See terms").click();
    await expect(termsHeading).toBeVisible();
    await page.getByText("See terms").click();
    await expect(termsHeading).not.toBeVisible();
  });

  await test.step("Submit", async () => {
    await page.getByText("I understand").click();

    await page.waitForURL(`${TEST_BASE_URL}/?reason=onboarded`);
  });
});

test("Onboarded without a demo status", async ({ page }) => {
  await test.step("Setup", async () => {
    await bypassVercelProtection(page);
    await prepareUser(page, "needs-demo-status");
    await page.goto(`${TEST_BASE_URL}/aila`);

    await page.waitForURL(`${TEST_BASE_URL}/onboarding`);
    await expect(page.getByText("Preparing your account")).toBeVisible();
  });

  await test.step("Redirect", async () => {
    await page.waitForURL(`${TEST_BASE_URL}/?reason=metadata-upgraded`);
  });
});

test("Loading onboarding when already onboarded", async ({ page }) => {
  await test.step("Setup", async () => {
    await bypassVercelProtection(page);
    await prepareUser(page, "typical");
    await page.goto(`${TEST_BASE_URL}/onboarding`);
  });

  await test.step("Redirect", async () => {
    await page.waitForURL(`${TEST_BASE_URL}/`);
  });
});
