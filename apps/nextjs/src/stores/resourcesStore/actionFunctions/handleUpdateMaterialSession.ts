import { aiLogger } from "@oakai/logger";

import type { UseMutateAsyncFunction } from "@tanstack/react-query";

import type { ResourcesGetter, ResourcesSetter } from "../types";
import { handleStoreError } from "../utils/errorHandling";

const log = aiLogger("additional-materials");

export type UpdateMaterialSessionParams = {
  resourceId: string;
  lessonId: string;
  mutateAsync: UseMutateAsyncFunction<
    { success: boolean },
    Error,
    { resourceId: string; lessonId: string }
  >;
};

export const handleUpdateMaterialSession =
  (set: ResourcesSetter, _get: ResourcesGetter) =>
  async ({
    resourceId,
    lessonId,
    mutateAsync,
  }: UpdateMaterialSessionParams) => {
    log.info("Updating material session", { resourceId, lessonId });

    try {
      await mutateAsync({ resourceId, lessonId });
      log.info("Material session updated successfully");
    } catch (error) {
      handleStoreError(set, error, {
        context: "handleUpdateMaterialSession",
        resourceId,
        lessonId,
      });
      log.error("Error updating material session", error);
    }
  };
