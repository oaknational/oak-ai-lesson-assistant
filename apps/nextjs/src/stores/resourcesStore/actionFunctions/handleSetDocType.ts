import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleSetDocType =
  (set: ResourcesSetter, _get: ResourcesGetter) => (docType: string | null) => {
    log.info("Setting docType", { docType });

    if (docType !== null) {
      const parsedDoctype = additionalMaterialTypeEnum.parse(docType);
      set({ docType: parsedDoctype });
    } else {
      set({ docType: null, id: null });
    }
  };
