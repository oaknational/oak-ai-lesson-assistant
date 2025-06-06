import { resourceTypesConfig } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { aiLogger } from "@oakai/logger";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleDownload =
  (set: ResourcesSetter, get: ResourcesGetter) => async () => {
    // Clear any existing generation
    set({
      isDownloading: true,
    });
    log.info("Download started");
    const docType = get().docType;
    const id = get().id;
    const response = await fetch("/api/additional-resources-download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentType: docType,
        resource: get().generation,
        lessonTitle: get().pageData.lessonPlan.title,
      }),
    });

    if (!response.ok || !docType) {
      throw new Error("Failed to generate ZIP");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `${get().pageData.lessonPlan.title} - ${resourceTypesConfig[docType].displayName.toLowerCase()} - ${id?.slice(0, 5)}`;
    link.href = url;
    link.download = `${filename}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };
