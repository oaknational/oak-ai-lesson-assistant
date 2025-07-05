import { aiLogger } from "@oakai/logger";

import type { Page } from "@playwright/test";

import {
  createMaterialSessionResponse,
  generateAdditionalMaterialWithAdaptsOutputId,
  generateAdditionalMaterialWithoutAdaptsOutputId,
  generatePartialLessonPlanObjectResponse,
  updateMaterialSessionResponse,
} from "./fixtures";

const log = aiLogger("additional-materials:testing");

export const applyTeachingMaterialsFixtures = async (page: Page) => {
  await page.route(
    "**/api/trpc/main/additionalMaterials.generatePartialLessonPlanObject?batch=1",
    async (route, request) => {
      const postData = request.postDataJSON();
      log.info(
        "Intercepted generatePartialLessonPlanObject tRPC call with params:",
        postData,
      );

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: generatePartialLessonPlanObjectResponse,
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

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: createMaterialSessionResponse,
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

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: updateMaterialSessionResponse,
      });
    },
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

      const body = postData[0]?.json?.adaptsOutputId
        ? generateAdditionalMaterialWithAdaptsOutputId
        : generateAdditionalMaterialWithoutAdaptsOutputId;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body,
      });
    },
  );
};
