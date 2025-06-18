import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import type { UseMutateAsyncFunction } from "@tanstack/react-query";

import type { ResourcesGetter, ResourcesSetter } from "../types";
import { handleStoreError } from "../utils/errorHandling";

const log = aiLogger("additional-materials");

export type CreateMaterialSessionParams = {
  documentType: string;
  mutateAsync: UseMutateAsyncFunction<
    { resourceId: string },
    Error,
    { documentType: string }
  >;
};

export const handleCreateMaterialSession =
  (set: ResourcesSetter, get: ResourcesGetter) =>
  async ({ documentType, mutateAsync }: CreateMaterialSessionParams) => {
    log.info("Creating material session", { documentType });
    const docTypeParsed = additionalMaterialTypeEnum.parse(documentType);

    try {
      const result = await mutateAsync({ documentType });
      log.info("Material session created ", {
        resourceId: result.resourceId,
      });
      set({ id: result.resourceId });
      log.info(get().id, "ID after creation");

      // Use the analytics action function from the store
      // Pass resource ID directly since it was just created
      get().actions.analytics.trackMaterialSelected(
        result.resourceId,
        docTypeParsed,
      );
    } catch (error) {
      handleStoreError(set, error, {
        context: "handleCreateMaterialSession",
        documentType,
      });
      log.error("Error creating material session", error);
    }
  };
