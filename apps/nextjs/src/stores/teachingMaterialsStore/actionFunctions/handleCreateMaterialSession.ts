import { teachingMaterialTypeEnum } from "@oakai/additional-materials/src/documents/teachingMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import z from "zod";

import type { TrpcUtils } from "@/utils/trpc";

import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";
import { callWithHandshakeRetry } from "../utils/callWithHandshakeRetry";
import { handleStoreError } from "../utils/errorHandling";

const log = aiLogger("teaching-materials");

export const handleCreateMaterialSession =
  (
    set: TeachingMaterialsSetter,
    get: TeachingMaterialsGetter,
    trpc: TrpcUtils,
    refreshAuth?: () => Promise<void>,
  ) =>
  async (
    docType: string | null,
    stepNumber?: number,
    trackEventFromOwa?: boolean,
  ) => {
    set({ stepNumber: stepNumber ?? 1 });

    log.info("Creating material session", { docType });
    const docTypeParsed = teachingMaterialTypeEnum.parse(docType);

    try {
      const result = await callWithHandshakeRetry(
        () =>
          // trpc.client.  teachingMaterials.createMaterialSession.mutate({
          //   documentType: docTypeParsed,
          // }),
          trpc.client.teachingMaterials.createMaterialSession.mutate({
            documentType: docTypeParsed,
          }),
        refreshAuth,
      );

      const resourceId = z.string().parse(result.resourceId);

      log.info("Material session created ", {
        resourceId: result.resourceId,
      });
      set({ id: resourceId });
      log.info(get().id, "ID after creation");

      const source = get().source;

      if (trackEventFromOwa) {
        get().actions.analytics.trackMaterialSelected({
          resourceId,
          docType: docTypeParsed,
          componentType: "create_more_with_ai_dropdown",
          platform: "owa",
          product: "teacher lesson resources",
        });
      } else {
        get().actions.analytics.trackMaterialSelected({
          resourceId,
          docType: docTypeParsed,
          componentType:
            source === "aila"
              ? "lesson_details_button"
              : "create_teaching_material_button",
          platform: "aila-beta",
          product: "teaching material",
        });
      }
      return { success: true };
    } catch (error) {
      handleStoreError(set, error, {
        context: "handleCreateMaterialSession",
        docType,
      });
      log.error("Error creating material session", error);
      return { success: false };
    }
  };
