import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import type { TrpcUtils } from "@/utils/trpc";

import type { ResourcesGetter, ResourcesSetter } from "../types";
import { handleStoreError } from "../utils/errorHandling";

const log = aiLogger("additional-materials");

export const handleCreateMaterialSession =
  (set: ResourcesSetter, get: ResourcesGetter, trpc: TrpcUtils) =>
  async (docType: string | null) => {
    set({ stepNumber: 1 });

    log.info("Creating material session", { docType });
    const docTypeParsed = additionalMaterialTypeEnum.parse(docType);

    try {
      const result =
        await trpc.client.additionalMaterials.createMaterialSession.mutate({
          documentType: docTypeParsed,
        });

      log.info("Material session created ", {
        resourceId: result.resourceId,
      });
      set({ id: result.resourceId });
      log.info(get().id, "ID after creation");

      get().actions.analytics.trackMaterialSelected(
        result.resourceId,
        docTypeParsed,
      );
    } catch (error) {
      handleStoreError(set, error, {
        context: "handleCreateMaterialSession",
        docType,
      });
      log.error("Error creating material session", error);
    }
  };
