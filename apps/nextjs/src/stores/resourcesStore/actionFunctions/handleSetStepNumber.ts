import { aiLogger } from "@oakai/logger";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleSetStepNumber =
  (set: ResourcesSetter, get: ResourcesGetter) => (step: number) => {
    log.info("Setting step number", { step });
    set({ stepNumber: step });
  };
