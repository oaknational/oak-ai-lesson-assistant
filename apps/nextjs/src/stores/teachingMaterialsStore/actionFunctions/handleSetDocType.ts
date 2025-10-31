import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const log = aiLogger("teaching-materials");

export const handleSetDocType =
  (set: TeachingMaterialsSetter, _get: TeachingMaterialsGetter) =>
  (docType: string | null) => {
    log.info("Setting docType", { docType });

    if (docType !== null) {
      try {
        const parsedDoctype = additionalMaterialTypeEnum.parse(docType);
        set({ docType: parsedDoctype });
      } catch (error) {
        Sentry.captureException(error, {
          extra: { docType },
        });
        log.error("Failed to parse docType", { docType, error });
      }
    } else {
      set({ docType: null, id: null });
    }
  };
