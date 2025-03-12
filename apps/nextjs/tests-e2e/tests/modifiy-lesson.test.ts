import { type Page, expect, test } from "@playwright/test";

import { TEST_BASE_URL } from "../config/config";
import { prepareUser } from "../helpers/auth";
import { bypassVercelProtection } from "../helpers/vercel";
import {
  applyLlmFixtures,
  isFinished,
  waitForGeneration,
} from "./aila-chat/helpers";

test.describe("Modify a lesson plan", () => {
  const generationTimeout = 50000;

  test.beforeEach(async ({ page }) => {
    await test.step("Setup", async () => {
      await bypassVercelProtection(page);
      const login = await prepareUser(page, "modify-lesson-plan");
      await page.goto(`${TEST_BASE_URL}/aila/${login.chatId}`);
      await isFinished(page);
    });
  });

  test("Modify a lesson resource", async ({ page }) => {
    test.setTimeout(generationTimeout * 3);
    const { setFixture } = await applyLlmFixtures(page, "replay");

    await test.step("Modify a lesson", async () => {
      await modifyLessonResource(page, setFixture);
    });

    await test.step("Select 'other' modification", async () => {
      await selectOtherModification(page);
    });

    await test.step("Add additional material", async () => {
      await selectAdditionalResource(page, setFixture);
    });
  });

  async function modifyLessonResource(
    page: Page,
    setFixture: (name: string) => void,
  ) {
    const modifyButtons = page.locator("text=Modify");
    await modifyButtons.first().click();
    const modifyRadioButton = page.locator("text=Make them easier");
    await modifyRadioButton.click();

    setFixture("modify-lesson-easier");
    await page.locator("text=Modify section").click();
    await waitForGeneration(page, generationTimeout);

    await expect(
      page.locator(
        "text=I can describe different software testing techniques.",
      ),
    ).toBeVisible();
    await expect(
      page.locator(
        "text=I've simplified the learning outcome. If this is suitable, please let me know or suggest further changes. Otherwise, tap Continue to proceed.",
      ),
    ).toBeVisible();
  }

  async function selectOtherModification(page: Page) {
    const modifyButtons = page.locator("text=Modify");
    await modifyButtons.first().click();
    const radioButtonOther = page.locator('input[type="radio"][value="OTHER"]');
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
    await addMaterialsButton.click();
    await waitForGeneration(page, generationTimeout);

    await expect(
      page.getByText(
        "A homework task has been added to the additional materials section. If you have any more changes or are ready to finalise the lesson, please let me know!",
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Research Activity: Investigate a real-world software application and identify which testing techniques you think were used during its development. Write a short paragraph explaining your reasoning.",
      ),
    ).toBeVisible();
  }
});
