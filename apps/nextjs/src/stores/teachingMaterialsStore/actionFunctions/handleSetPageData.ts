import { aiLogger } from "@oakai/logger";

import type {
  PageData,
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const log = aiLogger("teaching-materials");

export const handleSetPageData =
  (set: TeachingMaterialsSetter, _get: TeachingMaterialsGetter) =>
  (pageData: PageData) => {
    log.info("Setting page data");
    set({ pageData });
  };
