import { aiLogger } from "@oakai/logger";
import type { TeachingMaterialSchemas } from "@oakai/teaching-materials/src/documents/teachingMaterials/configSchema";

import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const log = aiLogger("teaching-materials");

export const handleSetGeneration =
  (set: TeachingMaterialsSetter, _get: TeachingMaterialsGetter) =>
  (generation: TeachingMaterialSchemas | null) => {
    log.info("Setting generation");
    set({ generation });
  };
