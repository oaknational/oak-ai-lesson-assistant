import { aiLogger } from "@oakai/logger";

import type { PageData, ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleSetPageData =
  (set: ResourcesSetter, get: ResourcesGetter) => (pageData: PageData) => {
    log.info("Setting page data");
    set({ pageData });
  };
