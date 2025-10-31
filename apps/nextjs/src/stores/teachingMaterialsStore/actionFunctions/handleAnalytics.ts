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
  PlatformValueType,
  ProductValueType,
  ResourceFileTypeValueType,
  ResourceTypeValueType,
} from "@/lib/avo/Avo";

import type { TeachingMaterialsGetter, TeachingMaterialsSetter } from "../types";

export const handleAnalytics = (
  _set: TeachingMaterialsSetter,
  get: TeachingMaterialsGetter,
  track: TrackFns,
) => {
  return {
    /**
     * Track teaching materials selected event
     */
    trackMaterialSelected: ({
      resourceId,
      docType,
      componentType,
      platform,
      product,
    }: {
      resourceId: string;
      docType: AdditionalMaterialType;
      componentType: ComponentTypeValueType;
      platform: PlatformValueType;
      product: ProductValueType;
    }) => {
      invariant(docType, "Document type is required for analytics");

      track.teachingMaterialsSelected({
        teachingMaterialType: resourceTypesConfig[docType].analyticPropertyName,
        interactionId: resourceId,
        platform: platform,
        product: product,
        engagementIntent: "refine",
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
        product: "teaching material",
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
        product: "teaching material",
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
