import {
  resourceTypesConfig,
  subjectSlugMap,
  yearSlugMap,
} from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";

import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";
import { getModerationTypes } from "@/lib/analytics/helpers";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleDownload =
  (set: ResourcesSetter, get: ResourcesGetter, track: TrackFns) => async () => {
    // Clear any existing generation
    set({
      isDownloading: true,
    });
    log.info("Download started");

    const {
      docType,
      id,
      pageData: { lessonPlan },
      formState,
      moderation,
      generation,
    } = get();

    invariant(docType, "Document type is required for download");
    invariant(id, "Resource ID is required for analytics");
    invariant(formState.subject, "Resource ID is required for analytics");
    invariant(formState.year, "Resource ID is required for analytics");
    invariant(lessonPlan.title, "Lesson plan is required for analytics");

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

    track.teachingMaterialDownloaded({
      teachingMaterialType: resourceTypesConfig[docType].analyticPropertyName,
      interactionId: id,
      platform: "aila-beta",
      product: "ai lesson assistant",
      engagementIntent: "use",
      componentType: "download_button",
      eventVersion: "2.0.0",
      analyticsUseCase: "Teacher",
      subjectSlug: subjectSlugMap[formState.subject] ?? formState.subject,
      subjectTitle: formState.subject,
      yearGroupName: formState.year,
      yearGroupSlug: yearSlugMap[formState.year] ?? formState.year,
      lessonPlanTitle: lessonPlan.title,
      resourceType: ["teaching material"],
      resourceFileType: "all",
      moderatedContentType: getModerationTypes(
        moderation ? { ...moderation, type: "moderation" as const } : undefined,
      ),
    });
  };
