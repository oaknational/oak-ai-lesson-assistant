import { aiLogger } from "@oakai/logger";

import type { Page } from "@playwright/test";

import {
  createMaterialSessionResponse,
  generatePartialLessonPlanObjectResponse,
  generateTeachingMaterialWithAdaptsOutputId,
  generateTeachingMaterialWithoutAdaptsOutputId,
  updateMaterialSessionResponse,
} from "./fixtures";

const log = aiLogger("teaching-materials:testing");

export const applyTeachingMaterialsMockAPIRequests = async (page: Page) => {
  await page.route(
    "**/api/trpc/main/teachingMaterials.generatePartialLessonPlanObject?batch=1",
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
    "**/api/trpc/main/teachingMaterials.createMaterialSession?batch=1",
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
    "**/api/trpc/main/teachingMaterials.updateMaterialSession?batch=1",
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
    "**/api/trpc/main/teachingMaterials.generateTeachingMaterial?batch=1",
    async (route, request) => {
      const postData: { json: { adaptsOutputId: string } }[] =
        request.postDataJSON() ?? [];
      log.info(
        "Intercepted generateTeachingMaterial tRPC call with params:",
        postData,
      );

      const body = postData[0]?.json?.adaptsOutputId
        ? generateTeachingMaterialWithAdaptsOutputId
        : generateTeachingMaterialWithoutAdaptsOutputId;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body,
      });
    },
  );
};
