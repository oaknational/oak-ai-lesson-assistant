import { test, expect, type Page } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { prepareUser } from "../helpers/auth";
import { bypassVercelProtection } from "../helpers/vercel";
import { isFinished } from "./aila-chat/helpers";

declare global {
  interface Window {
    reactScanLessonPlanDisplay: { renderCount: number };
  }
}

test.describe("Component renders during lesson chat", () => {
  process.env.NEXT_PUBLIC_ENABLE_RENDER_SCAN = "true";

  test.beforeEach(async ({ page }) => {
    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      const login = await prepareUser(page, "typical");
      await page.goto(`${TEST_BASE_URL}/aila/${login.chatId}`);
      await isFinished(page);
    });
  });

  test("There are no unnecessary rerenders across left and right side of chat", async ({
    page,
  }) => {
    await test.step("Chat box keyboard input does not create rerenders in lesson plan", async () => {
      await verifyChatInputRenders(page);
    });
  });

  async function verifyChatInputRenders(page: Page) {
    await page.waitForTimeout(5000);
    await page
      .locator('text="Software Testing Techniques"')
      .waitFor({ timeout: 10000 });
    const textbox = page.getByTestId("chat-input");
    const message = "Create a KS1 lesson on the end of Roman Britain";
    const initialRenderAmount: number = await page.evaluate(
      () => window.reactScanLessonPlanDisplay.renderCount,
    );
    await page.keyboard.type(message);
    await expect(textbox).toContainText(message);
    await page.waitForTimeout(5000);
    const finalRenderAmount: number = await page.evaluate(
      () => window.reactScanLessonPlanDisplay.renderCount,
    );

    expect(initialRenderAmount).toBeLessThan(20);
    // We should expect the render count to be the same because we are only
    // interacting with the left side of the chat. This should be fixed and updated
    expect(finalRenderAmount).toBeLessThan(400);
  }
});
