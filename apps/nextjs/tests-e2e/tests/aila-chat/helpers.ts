import { expect, Page } from "@playwright/test";

export async function waitForGeneration(page: Page, generationTimeout: number) {
  const loadingElement = page.getByTestId("chat-stop");
  await expect(loadingElement).toBeVisible();
  await expect(loadingElement).not.toBeVisible({ timeout: generationTimeout });
}

export async function continueChat(page: Page) {
  await page.getByTestId("chat-continue").click();
}

export async function isFinished(page: Page) {
  const progressText = await page.getByTestId("chat-progress").textContent();
  return progressText === "10 of 10 sections complete";
}
