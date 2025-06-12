import {
  resourceTypesConfig,
  subjectSlugMap,
  yearSlugMap,
} from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";

import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";
import { getModerationTypes } from "@/lib/analytics/helpers";
import type { ComponentTypeValueType } from "@/lib/avo/Avo";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleSetStepNumber =
  (set: ResourcesSetter, get: ResourcesGetter, track: TrackFns) =>
  (step: number, componentType?: ComponentTypeValueType) => {
    const {
      stepNumber: currentStep,
      docType,
      formState,
      pageData: { lessonPlan },
      id,
      moderation,
    } = get();

    log.info("Setting step number", { step, currentStep });
    console.log(formState, "formState in handleSetStepNumber");

    if (
      (componentType === "continue_button" ||
        componentType === "back_a_step_button") &&
      formState.subject &&
      formState.year &&
      id
    ) {
      invariant(
        docType,
        "Document type is required for analytics when setting step number",
      );

      track.teachingMaterialsRefined({
        teachingMaterialType:
          resourceTypesConfig[docType]?.analyticPropertyName,
        interactionId: id,
        platform: "aila-beta",
        product: "ai lesson assistant",
        engagementIntent: "refine",
        componentType: componentType,
        eventVersion: "2.0.0",
        analyticsUseCase: "Teacher",
        subjectSlug: subjectSlugMap[formState.subject] ?? formState.subject,
        subjectTitle: formState.subject,
        yearGroupName: formState.year,
        yearGroupSlug: yearSlugMap[formState.year] ?? formState.year,
        lessonPlanTitle: lessonPlan.title ?? "", // we don't have a title before lesson overview is created
        moderatedContentType: getModerationTypes(
          moderation
            ? { ...moderation, type: "moderation" as const }
            : undefined,
        ),
      });
    }

    set({ stepNumber: step });
  };
