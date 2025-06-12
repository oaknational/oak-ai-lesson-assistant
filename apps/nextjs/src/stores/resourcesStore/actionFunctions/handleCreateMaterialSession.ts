import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { resourceTypesConfig } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { aiLogger } from "@oakai/logger";

import type { UseMutateAsyncFunction } from "@tanstack/react-query";

import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";

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
  (set: ResourcesSetter, get: ResourcesGetter, track: TrackFns) =>
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
      track.teachingMaterialsSelected({
        teachingMaterialType:
          resourceTypesConfig[docTypeParsed].analyticPropertyName,
        interactionId: result.resourceId,
        platform: "aila-beta",
        product: "ai lesson assistant",
        engagementIntent: "use",
        eventVersion: "2.0.0",
        analyticsUseCase: "Teacher",
        componentType: "create_additional_materials_button",
      });
    } catch (error) {
      handleStoreError(set, error, {
        context: "handleCreateMaterialSession",
        documentType,
      });
      log.error("Error creating material session", error);
    }
  };
