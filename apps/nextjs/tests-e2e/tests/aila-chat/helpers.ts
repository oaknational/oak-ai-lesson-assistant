import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";

import type { AilaStreamingStatus } from "@/components/AppComponents/Chat/Chat/hooks/useAilaStreamingStatus";

export async function expectStreamingStatus(
  page: Page,
  status: AilaStreamingStatus,
  args?: { timeout: number },
) {
  const statusElement = page.getByTestId("chat-aila-streaming-status");
  await expect(statusElement).toContainText(status, args);
}

export async function waitForStreamingStatusChange(
  page: Page,
  currentStatus: AilaStreamingStatus,
  expectedStatus: AilaStreamingStatus,
  timeout: number,
) {
  await page.waitForFunction(
    ([currentStatus, expectedStatus]) => {
      const statusElement = document.querySelector(
         
        '[data-testid="chat-aila-streaming-status"]',
      );
      return (
        statusElement &&
        currentStatus &&
        expectedStatus &&
        !statusElement.textContent?.includes(currentStatus) &&
        statusElement.textContent?.includes(expectedStatus)
      );
    },
    [currentStatus, expectedStatus],
    { timeout },
  );

  await expectStreamingStatus(page, expectedStatus);
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

  if (match?.[1]) {
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

// The chat UI has a race condition when you submit a message too quickly after the previous response
// This is a temporary fix to fix test flake
export async function letUiSettle(page, testInfo: TestInfo) {
  return await page.waitForTimeout(testInfo.retry === 0 ? 500 : 6000);
}

// So that we can capture the lesson plan in the Playwright screenshot
// recording, we need to scroll the lesson plan from top to bottom.
export async function scrollLessonPlanFromTopToBottom(page: Page) {
  await page.evaluate(async () => {
    const scrollableParent = document.querySelector(
      '[data-testid="chat-right-hand-side-lesson"]',
    ) as HTMLElement;

    if (scrollableParent) {
      const scrollHeight = scrollableParent.scrollHeight;
      const clientHeight = scrollableParent.clientHeight;
      const scrollStep = 100; // Adjust this value to control the scroll speed
      const scrollDuration = 200; // Adjust this value to control the pause between each scroll step

      for (
        let scrollTop = 0;
        scrollTop < scrollHeight - clientHeight;
        scrollTop += scrollStep
      ) {
        scrollableParent.scrollTop = scrollTop;
        await new Promise((resolve) => setTimeout(resolve, scrollDuration));
      }

      // Ensure we scroll to the very bottom
      scrollableParent.scrollTop = scrollHeight;
    }
  });
}
