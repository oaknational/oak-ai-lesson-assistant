import { aiLogger } from "@oakai/logger";

import type {
  PageData,
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const log = aiLogger("additional-materials");

export const handleSetPageData =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (pageData: PageData) => {
    log.info("Setting page data");
    set({ pageData });
  };
