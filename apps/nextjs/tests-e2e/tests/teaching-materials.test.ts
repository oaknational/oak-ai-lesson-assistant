import { aiLogger } from "@oakai/logger";

import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { z } from "zod";

import { TEST_BASE_URL } from "../config/config";
import { bypassVercelProtection } from "../helpers/vercel";
import type { FixtureMode } from "./aila-chat/helpers";

const log = aiLogger("additional-materials:testing");

const FIXTURE_MODE = "replay" as FixtureMode;

// Helper function to apply teaching materials fixtures
export const applyTeachingMaterialsFixtures = async (page: Page) => {
  // Intercept generatePartialLessonPlanObject calls
  await page.route(
    "**/api/trpc/main/additionalMaterials.generatePartialLessonPlanObject?batch=1",
    async (route, request) => {
      const postData = request.postDataJSON();
      log.info(
        "Intercepted generatePartialLessonPlanObject tRPC call with params:",
        postData,
      );

      // Return a mock response for lesson plan generation
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            result: {
              data: {
                json: {
                  threatDetection: false,
                  lesson: {
                    title: "Exploring animal habitats",
                    keyStage: "key-stage-1",
                    year: "year-1",
                    subject: "Biology",
                    learningOutcome:
                      "I can identify different animal habitats and describe their features.",
                    learningCycles: [
                      "Identify and describe different types of animal habitats.",
                      "Explain how animals are adapted to their habitats.",
                      "Match animals to their correct habitats.",
                    ],
                    keyLearningPoints: [
                      "A habitat is a place where an animal lives.",
                      "Different habitats have different features like temperature and vegetation.",
                      "Animals have adaptations that help them survive in their habitats.",
                    ],
                    misconceptions: [
                      {
                        misconception: "All animals can live in any habitat",
                        description:
                          "Animals are adapted to specific habitats. For example, a polar bear cannot live in a desert because it needs cold temperatures and ice.",
                      },
                    ],
                    keywords: [
                      {
                        keyword: "Habitat",
                        definition:
                          "A habitat is a natural environment where an animal or plant lives.",
                      },
                      {
                        keyword: "Adaptation",
                        definition:
                          "An adaptation is a special feature that helps an animal survive in its habitat.",
                      },
                      {
                        keyword: "Environment",
                        definition:
                          "The environment is everything around us, including air, water, and land.",
                      },
                    ],
                  },
                  lessonId: "e3bb4b2c-06ce-4324-afae-6d9f227a337f",
                  moderation: {
                    scores: {
                      l: 5,
                      v: 5,
                      u: 5,
                      s: 5,
                      p: 5,
                      t: 5,
                    },
                    justification:
                      "The additional material resource titled 'Exploring animal habitats' is fully compliant across all categories. It is designed for Key Stage 1 students, focusing on biology and the identification of animal habitats. The content is educational and age-appropriate, with no presence of discriminatory language, offensive language, or strong language. There is no depiction or discussion of violence, conflict, or sensitive topics that could be upsetting or disturbing to young learners. The material does not include any nudity or sexual content, nor does it involve any physical activities or exploration of objects that require supervision. Additionally, there are no toxic elements such as guides to harmful behavior or illegal activities. The resource is purely educational, focusing on understanding animal habitats and adaptations, making it suitable for the intended audience without any need for content warnings or adult supervision.",
                    categories: [],
                  },
                },
              },
            },
          },
        ]),
      });
    },
  );

  // Intercept createMaterialSession calls
  await page.route(
    "**/api/trpc/main/additionalMaterials.createMaterialSession?batch=1",
    async (route, request) => {
      const postData = request.postDataJSON();
      log.info(
        "Intercepted createMaterialSession tRPC call with params:",
        postData,
      );

      // Return a mock response for material session creation
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            result: {
              data: {
                json: {
                  resourceId: "1234-test",
                },
              },
              error: null,
            },
          },
        ]),
      });
    },
  );

  // Intercept updateMaterialSession calls
  await page.route(
    "**/api/trpc/main/additionalMaterials.updateMaterialSession?batch=1",
    async (route, request) => {
      const postData = request.postDataJSON();
      log.info(
        "Intercepted updateMaterialSession tRPC call with params:",
        postData,
      );

      // Return a mock response for updateMaterialSession
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            result: {
              data: {
                json: {
                  success: true,
                },
              },
            },
          },
        ]),
      });
    },
  );

  // Intercept generateAdditionalMaterial calls
  // Define a Zod schema for the expected postData structure
  const GenerateAdditionalMaterialSchema = z.array(
    z.object({
      json: z
        .object({
          adaptsOutputId: z.string().optional(),
        })
        .passthrough(),
    }),
  );

  await page.route(
    "**/api/trpc/main/additionalMaterials.generateAdditionalMaterial?batch=1",
    async (route, request) => {
      const postData: { json: { adaptsOutputId: string } }[] =
        request.postDataJSON() ?? [];
      log.info(
        "Intercepted generateAdditionalMaterial tRPC call with params:",
        postData,
      );

      if (postData[0]?.json?.adaptsOutputId) {
        // modify lower reading age
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              result: {
                data: {
                  json: {
                    resource: {
                      lessonTitle: "Exploring animal habitats",
                      glossary: [
                        {
                          term: "Adapt",
                          definition: "a feature.",
                        },
                        {
                          term: "Environment",
                          definition:
                            "everything around us, including air, water, and land.",
                        },
                        {
                          term: "Habitat",
                          definition:
                            "a natural environment where an animal or plant lives.",
                        },
                        {
                          term: "Temperature",
                          definition:
                            "a measure of how hot or cold something is.",
                        },
                        {
                          term: "Vegetation",
                          definition:
                            "plants and trees that grow in a particular area.",
                        },
                      ],
                    },
                    moderation: {
                      scores: {
                        l: 5,
                        v: 5,
                        u: 5,
                        s: 5,
                        p: 5,
                        t: 5,
                      },
                      categories: [],
                      justification:
                        "The additional material resource titled 'Exploring animal habitats' is fully compliant across all categories. The content is educational and focuses on defining terms related to animal habitats, such as adaptation, environment, habitat, temperature, and vegetation. There is no use of discriminatory language, offensive language, or strong language. There is no depiction or discussion of violence, conflict, or sensitive topics. The content does not include any nudity or sexual content. There is no involvement of physical activities, exploration of objects, or use of equipment requiring supervision. Additionally, there are no guides or encouragements of harmful or illegal activities. The material is appropriate for the intended audience and does not require any content warnings or adult supervision.",
                    },
                    resourceId: "17b709cc-358c-48e1-9784-f3f9d01c3b13",
                    rateLimit: {
                      isSubjectToRateLimiting: true,
                      limit: 1000,
                      remaining: 982,
                      reset: 1751760000000,
                    },
                  },
                },
                error: null,
              },
            },
          ]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              result: {
                data: {
                  json: {
                    resource: {
                      lessonTitle: "Exploring animal habitats",
                      glossary: [
                        {
                          term: "Adaptation",
                          definition:
                            "a special feature that helps an animal survive in its habitat.",
                        },
                        {
                          term: "Environment",
                          definition:
                            "everything around us, including air, water, and land.",
                        },
                        {
                          term: "Habitat",
                          definition:
                            "a natural environment where an animal or plant lives.",
                        },
                        {
                          term: "Temperature",
                          definition:
                            "a measure of how hot or cold something is.",
                        },
                        {
                          term: "Vegetation",
                          definition:
                            "plants and trees that grow in a particular area.",
                        },
                      ],
                    },
                    moderation: {
                      scores: {
                        l: 5,
                        v: 5,
                        u: 5,
                        s: 5,
                        p: 5,
                        t: 5,
                      },
                      categories: [],
                      justification:
                        "The additional material resource titled 'Exploring animal habitats' is fully compliant across all categories. The content is educational and focuses on defining terms related to animal habitats, such as adaptation, environment, habitat, temperature, and vegetation. There is no use of discriminatory language, offensive language, or strong language. There is no depiction or discussion of violence, conflict, or sensitive topics. The content does not include any nudity or sexual content. There is no involvement of physical activities, exploration of objects, or use of equipment requiring supervision. Additionally, there are no guides or encouragements of harmful or illegal activities. The material is appropriate for the intended audience and does not require any content warnings or adult supervision.",
                    },
                    resourceId: "17b709cc-358c-48e1-9784-f3f9d01c3b13",
                    rateLimit: {
                      isSubjectToRateLimiting: true,
                      limit: 1000,
                      remaining: 982,
                      reset: 1751760000000,
                    },
                  },
                },
                error: null,
              },
            },
          ]),
        });
      }
    },
  );
};

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
