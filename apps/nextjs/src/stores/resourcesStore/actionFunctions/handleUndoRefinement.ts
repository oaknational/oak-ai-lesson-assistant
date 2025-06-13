import {
  resourceTypesConfig,
  subjectSlugMap,
  yearSlugMap,
} from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";

import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";
import { getModerationTypes } from "@/lib/analytics/helpers";
import { teachingMaterialsRefined } from "@/lib/avo/Avo";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleUndoRefinement =
  (set: ResourcesSetter, get: ResourcesGetter, track: TrackFns) => () => {
    const {
      refinementGenerationHistory,
      formState,
      pageData: { lessonPlan },
      moderation,
      docType,
      id,
    } = get();

    // Can't undo if there's no history
    if (refinementGenerationHistory.length === 0) {
      log.warn("Cannot undo: no refinement history available");
      return;
    }

    // Get the previous generation (the last item in history)
    const previousGeneration =
      refinementGenerationHistory[refinementGenerationHistory.length - 1];

    // Remove the last item from history and set it as current generation
    const newHistory = refinementGenerationHistory.slice(0, -1);

    log.info("Undoing refinement", {
      historyLength: refinementGenerationHistory.length,
      newHistoryLength: newHistory.length,
    });

    // Track the refinement event
    set({
      generation: previousGeneration,
      refinementGenerationHistory: newHistory,
    });

    invariant(docType, "Document type is required for analytics");
    invariant(id, "Resource ID is required for analytics");
    invariant(formState.subject, "Subject is required for analytics");
    invariant(formState.year, "Year is required for analytics");
    invariant(lessonPlan.title, "Lesson plan title is required for analytics");

    track.teachingMaterialsRefined({
      teachingMaterialType: resourceTypesConfig[docType].analyticPropertyName,
      interactionId: id, // ID of the material being refined
      platform: "aila-beta",
      product: "ai lesson assistant",
      engagementIntent: "refine",
      componentType: "undo_button",
      eventVersion: "2.0.0",
      analyticsUseCase: "Teacher",
      subjectSlug: subjectSlugMap[formState.subject] ?? formState.subject,
      subjectTitle: formState.subject,
      yearGroupName: formState.year,
      yearGroupSlug: yearSlugMap[formState.year] ?? formState.year,
      lessonPlanTitle: lessonPlan.title,
      moderatedContentType: getModerationTypes(
        moderation ? { ...moderation, type: "moderation" as const } : undefined,
      ),
    });
  };
