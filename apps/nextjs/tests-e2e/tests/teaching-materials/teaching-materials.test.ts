import { expect, test } from "@playwright/test";

import { TEST_BASE_URL } from "../../config/config";
import { bypassVercelProtection } from "../../helpers/vercel";
import { applyTeachingMaterialsFixtures } from "./helpers";

test.describe("Teaching Materials", () => {
  test(
    "Complete teaching materials flow - glossary",
    { tag: "@common-auth" },
    async ({ page }) => {
      const generationTimeout = 30000;
      test.setTimeout(generationTimeout * 4);

      await test.step("Setup", async () => {
        await bypassVercelProtection(page);
        await page.goto(`${TEST_BASE_URL}/aila/tools`);
      });

      await applyTeachingMaterialsFixtures(page);

      await test.step("Navigate to teaching materials", async () => {
        await page.getByTestId("create-teaching-materials-button").click();
        await expect(page).toHaveURL(/\/aila\/tools\/teaching-materials/);
      });

      await test.step("Step 1: Select material type", async () => {
        await page.getByText("Glossary").click();

        await page.getByText("Next, provide lesson details").click();
      });

      await test.step("Step 2: Input lesson context", async () => {
        const buttons = page.getByTestId("drop-down-button");

        await buttons.first().click();
        await page.getByText("Year 3").click();
        await buttons.last().click();
        await page.getByText("Biology").click();

        // Fill lesson title
        await page
          .getByPlaceholder("Type a lesson title or learning outcome")
          .fill("Exploring animal habitats");

        await page.getByText("Next, review lesson details").click();
      });

      await test.step("Step 3: Review lesson plan and create glossary", async () => {
        await expect(page.getByText("Exploring animal habitats")).toBeVisible();

        await page.getByText("Create glossary").click();
      });

      await test.step("Step 4: Review generated glossary", async () => {
        await expect(page.getByText("Adaptation")).toBeVisible();
        await expect(
          page.getByText(
            "a special feature that helps an animal survive in its habitat.",
          ),
        ).toBeVisible();

        await expect(page.getByText("Download")).toBeVisible();
      });

      await test.step("Step 4: Modify glossary and lower reading age", async () => {
        await page.getByTestId("modify-desktop").click();

        await page.getByText("Lower reading age").click();

        await expect(page.getByText("Adapt")).toBeVisible();
        await expect(page.getByText("a feature.")).toBeVisible();
      });

      await test.step("Step 4: Undo glossary modification", async () => {
        await page.getByText("Undo").click();

        await expect(page.getByText("Adaptation")).toBeVisible();
        await expect(
          page.getByText(
            "a special feature that helps an animal survive in its habitat.",
          ),
        ).toBeVisible();
      });
      await test.step("Step 4: Close modify footer", async () => {
        await page.getByText("Close").click();
        await expect(page.getByText("Lower reading text")).not.toBeVisible();
      });
    },
  );

  test(
    "Teaching materials mobile flow - glossary",
    { tag: "@mobile-common-auth" },
    async ({ page }) => {
      const generationTimeout = 30000;
      test.setTimeout(generationTimeout * 4);

      await test.step("Setup", async () => {
        await bypassVercelProtection(page);
        await page.goto(`${TEST_BASE_URL}/aila/tools`);
      });

      await applyTeachingMaterialsFixtures(page);

      await test.step("Navigate to teaching materials", async () => {
        await page.getByTestId("create-teaching-materials-button").click();
        await expect(page).toHaveURL(/\/aila\/tools\/teaching-materials/);
      });

      await test.step("Step 1: Select material type", async () => {
        await page.getByText("Glossary").click();
        await page.getByTestId("mobile-next-button").click();
      });

      await test.step("Step 2: Input lesson context", async () => {
        const buttons = page.getByTestId("drop-down-button");
        await buttons.first().click();
        await page.getByText("Year 3").click();
        await buttons.last().click();
        await page.getByText("Biology").click();
        await page
          .getByPlaceholder("Type a learning objective")
          .fill("I want a lesson about data representation");
        await page.getByTestId("mobile-next-button").click();
      });

      await test.step("Step 3: Review lesson plan and create glossary", async () => {
        await expect(page.getByText("Exploring animal habitats")).toBeVisible();
        await page.getByTestId("mobile-next-button").click();
      });

      await test.step("Step 4: Review generated glossary", async () => {
        await expect(
          page.getByText(
            "a special feature that helps an animal survive in its habitat.",
          ),
        ).toBeVisible();
        await expect(page.getByTestId("download-icon-button")).toBeVisible();
      });
      await test.step("Step 4: Modify glossary and lower reading age", async () => {
        await page.getByTestId("modify-mobile").click();

        await page.getByText("Lower reading age").click();

        await expect(page.getByText("Adapt")).toBeVisible();
        await expect(page.getByText("a feature.")).toBeVisible();
      });

      await test.step("Step 4: Undo glossary modification", async () => {
        await page.getByText("Undo").click();

        await expect(page.getByText("Adaptation")).toBeVisible();
        await expect(
          page.getByText(
            "a special feature that helps an animal survive in its habitat.",
          ),
        ).toBeVisible();
      });
      await test.step("Step 4: Close modify footer", async () => {
        await page.getByText("Close").click();
        await expect(page.getByText("Lower reading text")).not.toBeVisible();
      });
    },
  );

  test(
    "Teaching materials error handling",
    { tag: "@common-auth" },
    async ({ page }) => {
      await test.step("Setup", async () => {
        await bypassVercelProtection(page);
        await page.goto(`${TEST_BASE_URL}/aila/tools/teaching-materials`);
      });

      await test.step("Test validation on empty form", async () => {
        // Try to proceed without selecting material type
        await page.getByText("Next, provide lesson details").click();

        // Should still be on the same step
        await expect(
          page.locator('input[value="additional-glossary"]'),
        ).toBeVisible();
      });

      await test.step("Test validation on partial form", async () => {
        // Select material type but don't fill required fields
        await page.locator('input[value="additional-glossary"]').click();
        await page.getByText("Next, provide lesson details").click();

        // Should be on step 1 but validation should prevent progress
        await page.getByText("Next, review lesson details").click();

        // Should still be on step 1 due to validation
        await expect(
          page.getByPlaceholder("Type a lesson title or learning outcome"),
        ).toBeVisible();
      });
    },
  );
});
