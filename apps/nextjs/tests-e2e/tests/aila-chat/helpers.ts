import { expect, Page, test } from "@playwright/test";

import { AilaStreamingStatus } from "@/components/AppComponents/Chat/Chat/hooks/useAilaStreamingStatus";

export async function expectStreamingStatus(
  page: Page,
  status: AilaStreamingStatus,
  args?: { timeout: number },
) {
  const statusElement = page.getByTestId("chat-aila-streaming-status");
  await expect(statusElement).toHaveText(status, args);
}

export async function waitForGeneration(page: Page, generationTimeout: number) {
  return await test.step("Wait for generation", async () => {
    await expectStreamingStatus(page, "RequestMade");
    await expectStreamingStatus(page, "Idle", {
      timeout: generationTimeout,
    });
  });
}

export async function continueChat(page: Page) {
  await page.getByTestId("chat-continue").click();
}

export async function isFinished(page: Page) {
  const progressText = await page.getByTestId("chat-progress").textContent();
  return progressText === "10 of 10 sections complete";
}

export async function expectFinished(page: Page) {
  await expect(page.getByTestId("chat-progress")).toHaveText(
    "10 of 10 sections complete",
  );
}

export async function getSectionsComplete(page: Page): Promise<number> {
  const progressText = await page.getByTestId("chat-progress").textContent();
  const match = (progressText ?? "").match(/(\d+) of 10 sections complete/);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  } else {
    return 0;
  }
}

export async function expectSectionsComplete(
  page: Page,
  numberOfSections: number,
) {
  const locator = page.getByTestId("chat-progress");
  await expect(locator).toHaveText(
    `${numberOfSections} of 10 sections complete`,
    { timeout: 10000 },
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
    setFixture: (name: string) => {
      fixtureName = name;
    },
  };
};
