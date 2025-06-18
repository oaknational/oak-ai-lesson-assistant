import type { AdditionalMaterialType } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import {
  resourceTypesConfig,
  subjectSlugMap,
  yearSlugMap,
} from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import invariant from "tiny-invariant";

import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";
import { getModerationTypes } from "@/lib/analytics/helpers";
import type {
  ComponentTypeValueType,
  ResourceFileTypeValueType,
  ResourceTypeValueType,
} from "@/lib/avo/Avo";

import type { ResourcesGetter, ResourcesSetter } from "../types";

export const handleAnalytics = (
  _set: ResourcesSetter,
  get: ResourcesGetter,
  track: TrackFns,
) => {
  return {
    /**
     * Track teaching materials selected event
     */
    trackMaterialSelected: (
      resourceId: string,
      docType: AdditionalMaterialType,
      componentType: ComponentTypeValueType = "create_additional_materials_button",
    ) => {
      invariant(docType, "Document type is required for analytics");

      track.teachingMaterialsSelected({
        teachingMaterialType: resourceTypesConfig[docType].analyticPropertyName,
        interactionId: resourceId,
        platform: "aila-beta",
        product: "ai lesson assistant",
        engagementIntent: "use",
        eventVersion: "2.0.0",
        analyticsUseCase: "Teacher",
        componentType,
      });
    },

    /**
     * Track teaching materials refined event
     */
    trackMaterialRefined: (componentType: ComponentTypeValueType) => {
      const state = get();
      const {
        docType,
        id,
        formState: { subject, year },
        pageData: { lessonPlan },
        moderation,
      } = state;

      invariant(docType, "Document type is required for analytics");
      invariant(id, "Resource ID is required for analytics");
      invariant(subject, "Subject is required for analytics");
      invariant(year, "Year is required for analytics");

      track.teachingMaterialsRefined({
        teachingMaterialType: resourceTypesConfig[docType].analyticPropertyName,
        interactionId: id,
        platform: "aila-beta",
        product: "ai lesson assistant",
        engagementIntent: "refine",
        componentType,
        eventVersion: "2.0.0",
        analyticsUseCase: "Teacher",
        subjectSlug: subjectSlugMap[subject] ?? subject,
        subjectTitle: subject,
        yearGroupName: year,
        yearGroupSlug: yearSlugMap[year] ?? year,
        lessonPlanTitle: lessonPlan.title ?? "", // lesson plan will not be generated in step 1
        moderatedContentType: getModerationTypes(
          moderation
            ? { ...moderation, type: "moderation" as const }
            : undefined,
        ),
      });
    },

    /**
     * Track teaching material downloaded event
     */
    trackMaterialDownloaded: (
      componentType: ComponentTypeValueType = "download_button",
      options?: {
        resourceType?: ResourceTypeValueType[];
        resourceFileType?: ResourceFileTypeValueType;
      },
    ) => {
      const state = get();
      const {
        docType,
        id,
        formState: { subject, year },
        pageData: { lessonPlan },
        moderation,
      } = state;

      invariant(docType, "Document type is required for analytics");
      invariant(id, "Resource ID is required for analytics");
      invariant(subject, "Subject is required for analytics");
      invariant(year, "Year is required for analytics");
      invariant(lessonPlan.title, "Lesson plan is required for analytics");

      const resourceType = options?.resourceType ?? ["teaching material"];
      const resourceFileType = options?.resourceFileType ?? "all";

      track.teachingMaterialDownloaded({
        teachingMaterialType: resourceTypesConfig[docType].analyticPropertyName,
        interactionId: id,
        platform: "aila-beta",
        product: "ai lesson assistant",
        engagementIntent: "use",
        componentType,
        eventVersion: "2.0.0",
        analyticsUseCase: "Teacher",
        subjectSlug: subjectSlugMap[subject] ?? subject,
        subjectTitle: subject,
        yearGroupName: year,
        yearGroupSlug: yearSlugMap[year] ?? year,
        lessonPlanTitle: lessonPlan.title,
        resourceType,
        resourceFileType,
        moderatedContentType: getModerationTypes(
          moderation
            ? { ...moderation, type: "moderation" as const }
            : undefined,
        ),
      });
    },
  };
};
