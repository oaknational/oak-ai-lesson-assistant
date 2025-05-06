import { aiLogger } from "@oakai/logger";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleSetDocType =
  (set: ResourcesSetter, get: ResourcesGetter) => (docType: string | null) => {
    log.info("Setting docType", { docType });
    set({ docType });
  };
