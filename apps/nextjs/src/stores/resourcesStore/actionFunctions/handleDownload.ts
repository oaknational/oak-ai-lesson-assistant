import {
  type AdditionalMaterialSchemas,
  additionalMaterialTypeEnum,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { GenerateAdditionalMaterialInput } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import { z } from "zod";

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

    if (!response.ok) {
      throw new Error("Failed to generate ZIP");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${docType}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };
