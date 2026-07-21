import { type Page, expect, test } from "@playwright/test";

import { getAilaUrl } from "@/utils/getAilaUrl";

import { TEST_BASE_URL } from "../config/config";
import { prepareUser } from "../helpers/auth";
import { bypassVercelProtection } from "../helpers/vercel";
import type { FixtureMode } from "./aila-chat/helpers";
import {
  applyLlmFixtures,
  continueChat,
  expectFinished,
  performAndWaitForGeneration,
} from "./aila-chat/helpers";

// --------
// CHANGE "replay" TO "record" TO RECORD A NEW FIXTURE
// (recording runs live against OpenAI and requires a local dev server)
// --------
// const FIXTURE_MODE = "record" as FixtureMode;
const FIXTURE_MODE = "replay" as FixtureMode;

// The agentic system's wording, taken from the recorded fixtures in
// tests-e2e/recordings/agentic/. Re-recording may change these.
const expected = {
  modifiedLearningOutcome:
    "I can identify black-box, white-box, manual and automated testing and say when each one is used.",
  modifyConfirmation:
    "Are the learning outcome and learning cycles appropriate for your pupils? If not, suggest an edit. Tap Continue to proceed.",
  additionalMaterialsConfirmation:
    "Are the additional materials appropriate for your pupils? If not, suggest an edit. Tap Continue to proceed.",
  homeworkTask:
    "practise identifying and choosing suitable software testing techniques",
};

test.describe("Modify a lesson plan (agentic)", () => {
  const generationTimeout = 50000;

  test.beforeEach(async ({ page }) => {
    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      // A dedicated persona gives this spec its own user and seeded chat, so
      // it can run in a parallel worker alongside the megaprompt spec without
      // the two prepareUser calls re-seeding each other's chat mid-test.
      const login = await prepareUser(page, "modify-lesson-plan-agentic");
      await page.goto(
        `${TEST_BASE_URL}${getAilaUrl("lesson")}/${login.chatId}`,
      );
      await expectFinished(page);
    });
  });

  test(
    "Modify a lesson resource (agentic)",
    { tag: ["@agentic"] },
    async ({ page }) => {
      test.setTimeout(generationTimeout * 3);
      const { setFixture } = await applyLlmFixtures(
        page,
        FIXTURE_MODE,
        "clean",
        "agentic",
      );

      await test.step("Modify a lesson", async () => {
        await modifyLessonResource(page, setFixture);
      });

      await test.step("Select 'other' modification", async () => {
        await selectOtherModification(page);
      });

      await test.step("Add additional material", async () => {
        await selectAdditionalResource(page, setFixture);
      });
    },
  );

  async function modifyLessonResource(
    page: Page,
    setFixture: (name: string) => void,
  ) {
    const modifyButtons = page.locator("text=Modify");
    await modifyButtons.first().click();
    const modifyRadioButton = page.locator("text=Make them easier");
    await modifyRadioButton.click();

    setFixture("modify-lesson-easier");
    await performAndWaitForGeneration(page, generationTimeout, async () => {
      await page.locator("text=Modify section").click();
    });

    // In the current recording this Continue is answered by re-planning the
    // learning outcome and learning cycles rather than a closing message.
    setFixture("modify-lesson-easier-continue");
    await performAndWaitForGeneration(page, generationTimeout, async () => {
      await continueChat(page);
    });

    // Only assert exact wording in replay mode — during recording the LLM may
    // return slightly different text each run.
    if (FIXTURE_MODE === "replay") {
      await expect(
        page.locator(`text=${expected.modifiedLearningOutcome}`),
      ).toBeVisible();
      await expect(
        page.locator(`text=${expected.modifyConfirmation}`),
      ).toBeVisible();
    }
  }

  async function selectOtherModification(page: Page) {
    const modifyButtons = page.locator("text=Modify");
    await modifyButtons.first().click();

    const radioButtonOther = page
      .getByTestId("modify-radio-button")
      .filter({ hasText: "Other" });
    await radioButtonOther.click();
    const otherInput = page.getByTestId("modify-other-text-area");
    await expect(otherInput).toBeVisible();
  }

  async function selectAdditionalResource(
    page: Page,
    setFixture: (name: string) => void,
  ) {
    const addAdditionalMaterialsButton = page.locator(
      "text=Add additional materials",
    );
    await addAdditionalMaterialsButton.click();

    const additionalMaterial = page.locator("text=A homework task");
    await additionalMaterial.click();
    const addMaterialsButton = page.locator("text=Add materials");
    setFixture("add-additional-materials");
    await performAndWaitForGeneration(page, generationTimeout, async () => {
      await addMaterialsButton.click();
    });

    if (FIXTURE_MODE === "replay") {
      await expect(
        page.getByText(expected.additionalMaterialsConfirmation),
      ).toBeVisible();
      await expect(page.getByText(expected.homeworkTask)).toBeVisible();
    }
  }
});
