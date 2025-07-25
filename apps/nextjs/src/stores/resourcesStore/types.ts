import type {
  AdditionalMaterialSchemas,
  AdditionalMaterialType,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { RefinementOption } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import type { LessonPlanSchemaTeachingMaterials } from "@oakai/additional-materials/src/documents/additionalMaterials/sharedSchema";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { z } from "zod";
import type { StoreApi } from "zustand";

import type {
  ComponentTypeValueType,
  ResourceFileTypeValueType,
  ResourceTypeValueType,
} from "@/lib/avo/Avo";

import type { LoadOwaDataParams } from "./actionFunctions/handleFetchOwaLesson";
import type { SubmitLessonPlanParams } from "./actionFunctions/handleSubmitLessonPlan";

export type PageData = {
  lessonPlan: LessonPlanSchemaTeachingMaterials;
  transcript?: string | null;
};

// Form state for StepOne
export type StepOneFormState = {
  subject: string | null;
  title: string | null;
  year: string | null;
  activeDropdown: string | null;
};

const errorType = z.enum([
  "rate_limit",
  "banned",
  "toxic",
  "restrictedContentGuidance",
  "copyright",
  "unknown",
]);
export type ErrorType = z.infer<typeof errorType>;

export const errorResponse = z.object({
  type: errorType,
  message: z.string(),
});
export type ErrorResponse = z.infer<typeof errorResponse>;

export type ResourcesState = {
  id: string | null;
  source: "aila" | "owa";
  stepNumber: number;
  isLoadingLessonPlan: boolean;
  isResourcesLoading: boolean;
  isResourceRefining: boolean;
  isDownloading: boolean;
  pageData: PageData;
  generation: AdditionalMaterialSchemas | null;
  docType: AdditionalMaterialType | null;
  formState: StepOneFormState;
  moderation?: ModerationResult;
  threatDetection?: boolean;
  error: ErrorResponse | null;
  refinementGenerationHistory: AdditionalMaterialSchemas[];

  actions: {
    // setters
    setStepNumber: (
      step: number,
      componentType?: ComponentTypeValueType,
    ) => void;
    setPageData: (pageData: PageData) => void;
    setGeneration: (generation: AdditionalMaterialSchemas | null) => void;
    setDocType: (docType: string | null) => void;
    setIsLoadingLessonPlan: (isLoading: boolean) => void;
    setIsResourcesLoading: (isLoading: boolean) => void;
    setIsResourceRefining: (isRefining: boolean) => void;
    setThreatDetection: (threatDetection: boolean) => void;

    // Form state setters
    setSubject: (subject: string | null) => void;
    setTitle: (title: string | null) => void;
    setYear: (year: string | null) => void;
    setActiveDropdown: (dropdown: string | null) => void;
    setIsResourceDownloading: (isDownloading: boolean) => void;

    // Clear form state
    resetFormState: () => void;

    // business logic actions
    createMaterialSession: (
      docType: string | null,
      stepNumber?: number,
    ) => Promise<void>;
    submitLessonPlan: (params: SubmitLessonPlanParams) => Promise<void>;
    generateMaterial: () => Promise<void>;
    refineMaterial: (refinementOption: RefinementOption) => Promise<void>;
    downloadMaterial: () => Promise<void>;

    // OWA data loading
    fetchOwaData: (params: LoadOwaDataParams) => Promise<void>;

    // History management actions
    undoRefinement: () => void;

    // Analytics actions
    analytics: {
      trackMaterialSelected: (
        resourceId: string,
        docType: AdditionalMaterialType,
        componentType?: ComponentTypeValueType,
      ) => void;
      trackMaterialRefined: (componentType: ComponentTypeValueType) => void;
      trackMaterialDownloaded: (
        componentType?: ComponentTypeValueType,
        options?: {
          resourceType?: ResourceTypeValueType[];
          resourceFileType?: ResourceFileTypeValueType;
        },
      ) => void;
    };

    // Reset store to default state
    resetToDefault: () => void;
  };
};

export type ResourcesSetter = StoreApi<ResourcesState>["setState"];
export type ResourcesGetter = StoreApi<ResourcesState>["getState"];
