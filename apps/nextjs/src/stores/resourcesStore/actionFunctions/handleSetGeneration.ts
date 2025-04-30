import type { AdditionalMaterialSchemas } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleSetGeneration =
  (set: ResourcesSetter, get: ResourcesGetter) =>
  (generation: AdditionalMaterialSchemas | null) => {
    log.info("Setting generation");
    set({ generation });
  };
