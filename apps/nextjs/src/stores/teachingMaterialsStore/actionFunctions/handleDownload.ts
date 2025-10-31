import { resourceTypesConfig } from "@oakai/additional-materials/src/documents/teachingMaterials/resourceTypes";
import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";

import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const log = aiLogger("teaching-materials");

export const handleDownload =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) => async () => {
    // Clear any existing generation
    set({
      isDownloading: true,
    });
    log.info("Download started");

    const {
      docType,
      id,
      pageData: { lessonPlan },
      generation,
    } = get();

    invariant(docType, "Document type is required for download");

    const response = await fetch("/api/additional-resources-download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentType: docType,
        resource: generation,
        lessonTitle: lessonPlan.title,
      }),
    });

    if (!response.ok || !docType) {
      throw new Error("Failed to generate ZIP");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `${get().pageData.lessonPlan.title} - ${id?.slice(0, 8)} - ${resourceTypesConfig[docType].displayName.toLowerCase()}`;
    link.href = url;
    link.download = `${filename}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);

    get().actions.analytics.trackMaterialDownloaded("download_button");
  };
