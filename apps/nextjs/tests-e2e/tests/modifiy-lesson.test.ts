import { test, expect } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { prepareUser } from "../helpers/auth";
import { bypassVercelProtection } from "../helpers/vercel";
import { isFinished } from "./aila-chat/helpers";

test("Modify a lesson plan", async ({ page }) => {
  await test.step("Setup", async () => {
    await bypassVercelProtection(page);
    const login = await prepareUser(page, "modify-lesson-plan");

    await page.goto(`${TEST_BASE_URL}/aila/${login.chatId}`);
    await isFinished(page);
  });

  await test.step("Modify a lesson resource", async () => {
    const modifyButtons = page.locator("text=Modify");
    await modifyButtons.first().click();
    const modifyRadioButton = page.locator("text=Make them easier");
    await expect(modifyRadioButton).toBeVisible();
    await modifyRadioButton.click();
    await page.locator("text=Modify section").click();
    const aliChat = page.locator("text=Make the Learning outcome easier");
    await expect(aliChat).toBeVisible();
  });

  await test.step("Select an additional resource", async () => {
    await page.locator("text=Add additional materials").click();
    const additionalMaterial = page.locator("text=A homework task");
    await expect(additionalMaterial).toBeVisible();
    await additionalMaterial.click();
    await page.locator("text=Add materials").click();
  });
});
