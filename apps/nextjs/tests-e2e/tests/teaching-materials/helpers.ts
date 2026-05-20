import type { Page } from "@playwright/test";

import {
  createMaterialSessionResponse,
  generatePartialLessonPlanObjectResponse,
  generateTeachingMaterialWithAdaptsOutputId,
  generateTeachingMaterialWithoutAdaptsOutputId,
  updateMaterialSessionResponse,
} from "./fixtures";

export const applyTeachingMaterialsMockAPIRequests = async (page: Page) => {
  await page.route(
    "**/api/trpc/main/teachingMaterials.generatePartialLessonPlanObject?batch=1",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: generatePartialLessonPlanObjectResponse,
      });
    },
  );

  await page.route(
    "**/api/trpc/main/teachingMaterials.createMaterialSession?batch=1",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: createMaterialSessionResponse,
      });
    },
  );

  await page.route(
    "**/api/trpc/main/teachingMaterials.updateMaterialSession?batch=1",
    async (route) => {
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
