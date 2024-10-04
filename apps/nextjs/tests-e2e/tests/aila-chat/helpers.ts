import { expect, Page } from "@playwright/test";

export async function waitForGeneration(page: Page, generationTimeout: number) {
  const loadingElement = page.getByTestId("chat-stop");
  await expect(loadingElement).toBeVisible({ timeout: 10000 });
  await expect(loadingElement).not.toBeVisible({ timeout: generationTimeout });
}

export async function continueChat(page: Page) {
  await page.getByTestId("chat-continue").click();
}

export async function isFinished(page: Page) {
  const progressText = await page.getByTestId("chat-progress").textContent();
  return progressText === "10 of 10 sections complete";
}

export async function expectSectionsComplete(
  page: Page,
  numberOfSections: number,
) {
  const locator = page.getByTestId("chat-progress");
  await expect(locator).toHaveText(
    `${numberOfSections} of 10 sections complete`,
  );
}

export type FixtureMode = "record" | "replay";

export const applyLlmFixtures = async (
  page: Page,
  fixtureMode: FixtureMode,
) => {
  let fixtureName: string;

  await page.route("**/api/chat", async (route) => {
    const headers = route.request().headers();
    headers["x-e2e-fixture-name"] = fixtureName;
    headers["x-e2e-fixture-mode"] = fixtureMode;
    await route.fallback({ headers });
  });

  return {
    setFixture: async (name: string) => {
      fixtureName = name;
    },
  };
};
