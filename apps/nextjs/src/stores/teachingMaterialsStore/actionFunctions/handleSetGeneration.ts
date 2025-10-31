import type { TeachingMaterialSchemas } from "@oakai/additional-materials/src/documents/teachingMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const log = aiLogger("teaching-materials");

export const handleSetGeneration =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (generation: TeachingMaterialSchemas | null) => {
    log.info("Setting generation");
    set({ generation });
  };
