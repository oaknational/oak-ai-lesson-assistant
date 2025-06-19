import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleUndoRefinement =
  (set: ResourcesSetter, get: ResourcesGetter) => () => {
    const {
      refinementGenerationHistory,
      formState,
      pageData: { lessonPlan },
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

    get().actions.analytics.trackMaterialRefined("undo_button");
  };
