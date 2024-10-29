import { setupClerkTestingToken } from "@clerk/testing/playwright";
import type { LessonPlanKeys } from "@oakai/aila/src/protocol/schema";
import { LessonPlanKeysSchema } from "@oakai/aila/src/protocol/schema";
import { test, expect } from "@playwright/test";

import { groupedSectionsInOrder } from "@/lib/lessonPlan/sectionsInOrder";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers/vercel";
import type { FixtureMode } from "./helpers";
import {
  applyLlmFixtures,
  continueChat,
  expectFinished,
  expectStreamingStatus,
  getSectionsComplete,
  scrollLessonPlanFromTopToBottom,
  waitForStreamingStatusChange,
} from "./helpers";

// --------
// CHANGE "replay" TO "record" TO RECORD A NEW FIXTURE
// --------
//const FIXTURE_MODE = "record" as FixtureMode;
const FIXTURE_MODE = "replay" as FixtureMode;

test(
  "Full aila flow with Romans fixture",
  { tag: "@common-auth" },
  async ({ page }) => {
    const generationTimeout = FIXTURE_MODE === "record" ? 75000 : 50000;
    test.setTimeout(generationTimeout * 5);

    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      await setupClerkTestingToken({ page });

      await page.goto(`${TEST_BASE_URL}/aila`);
      await expect(page.getByTestId("chat-h1")).toBeInViewport();
    });

    const { setFixture } = await applyLlmFixtures(page, FIXTURE_MODE);

    await test.step("Fill in the chat box", async () => {
      const textbox = page.getByTestId("chat-input");
      const sendMessage = page.getByTestId("send-message");
      const message = "Create a KS1 lesson on the end of Roman Britain";
      await textbox.fill(message);
      await expect(textbox).toContainText(message);

      // Temporary fix: The test goes quicker than a real user and submits before the demo status has loaded
      // This means that a demo modal would be shown when submitting
      await page.waitForTimeout(500);

      setFixture("roman-britain-1");
      await sendMessage.click();
    });

    await test.step("Iterate through the fixtures", async () => {
      await page.waitForURL(/\/aila\/.+/);

      let prevIteration = 0;
      let prevSectionsComplete = 0;
      const maxIterations = 20;

      for (
        let iterationCount = 1;
        iterationCount <= maxIterations;
        iterationCount++
      ) {
        setFixture(`roman-britain-${iterationCount}`);
        await expectStreamingStatus(page, "RequestMade", { timeout: 5000 });

        await waitForStreamingStatusChange(
          page,
          "RequestMade",
          "Idle",
          generationTimeout,
        );

        // Wait for the chat iteration to update
        await page.waitForFunction(
          ([prevIteration]) => {
            const chatIteration = document.querySelector(
              '[data-testid="chat-iteration"]',
            );
            return (
              chatIteration &&
              parseInt(chatIteration.textContent || "0", 10) >
                (prevIteration ?? 0)
            );
          },
          [prevIteration],
          { timeout: generationTimeout },
        );
        // Update the previous iteration
        const chatIteration = await page.textContent(
          '[data-testid="chat-iteration"]',
        );
        prevIteration = parseInt(chatIteration || "0", 10);

        // Get the current sections complete
        const currSectionsComplete = await getSectionsComplete(page);

        // Assert that currSectionsComplete is greater than or equal to the previous value
        expect(currSectionsComplete).toBeGreaterThanOrEqual(
          prevSectionsComplete,
        );

        // Update the previous sections complete
        prevSectionsComplete = currSectionsComplete;

        await expectStreamingStatus(page, "Idle", { timeout: 5000 });

        const createdSections = await page.$$eval(
          '[data-test="lesson-plan-section"]',
          (sections) =>
            sections
              .filter(
                (section) =>
                  section.getAttribute("data-test-section-complete") === "true",
              )
              .map((section) => section.getAttribute("data-test-section-key")),
        );

        console.log("Created sections", createdSections);

        const createdSectionKeys: LessonPlanKeys[] = createdSections
          .filter((section) => section !== null)
          .map((section) => LessonPlanKeysSchema.parse(section as string));

        const mostRecentSection =
          createdSectionKeys[createdSectionKeys.length - 1];

        const mostRecentSectionGroup = groupedSectionsInOrder.find(
          (group) => mostRecentSection && group.includes(mostRecentSection),
        );

        // Assert that all sections in the mostRecentSectionGroup are in createdSectionKeys
        expect(mostRecentSectionGroup).toBeDefined();
        if (mostRecentSectionGroup) {
          mostRecentSectionGroup.forEach((section) => {
            expect(createdSectionKeys).toContain(section);
          });
        }

        // If currSectionsComplete reaches 10 and we have the additionalMaterials section, we can break
        if (
          currSectionsComplete === 10 &&
          createdSectionKeys.includes("additionalMaterials")
        ) {
          break;
        }
        await continueChat(page);
        await waitForStreamingStatusChange(
          page,
          "Idle",
          "RequestMade",
          generationTimeout,
        );
      }

      await scrollLessonPlanFromTopToBottom(page);
      await expectFinished(page);
    });
  },
);
