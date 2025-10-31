import type { AdditionalMaterialSchemas } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const log = aiLogger("teaching-materials");

export const handleSetGeneration =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (generation: AdditionalMaterialSchemas | null) => {
    log.info("Setting generation");
    set({ generation });
  };
