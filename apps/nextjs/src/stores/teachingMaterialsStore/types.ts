import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type {
  TeachingMaterialSchemas,
  TeachingMaterialType,
} from "@oakai/teaching-materials/src/documents/teachingMaterials/configSchema";
import type { RefinementOption } from "@oakai/teaching-materials/src/documents/teachingMaterials/materialTypes";
import type { LessonPlanSchemaTeachingMaterials } from "@oakai/teaching-materials/src/documents/teachingMaterials/sharedSchema";

import { z } from "zod";
import type { StoreApi } from "zustand";

import type { TeachingMaterialsPageProps } from "@/app/aila/teaching-materials/teachingMaterialsView";
import type {
  ComponentTypeValueType,
  PlatformValueType,
  ProductValueType,
  ResourceFileTypeValueType,
  ResourceTypeValueType,
} from "@/lib/avo/Avo";

import type { SubmitLessonPlanParams } from "./actionFunctions/handleSubmitLessonPlan";

export type LoadOwaDataParams = Pick<
  TeachingMaterialsPageProps,
  "lesson" | "initialStep" | "id" | "lessonId" | "error" | "queryParams"
>;

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
  "restrictedThirdPartyContent",
  "unknown",
]);
export type ErrorType = z.infer<typeof errorType>;

export const teachingMaterialError = z.object({
  type: errorType,
  message: z.string(),
});
export type TeachingMaterialError = z.infer<typeof teachingMaterialError>;

export type TeachingMaterialsState = {
  id: string | null;
  source: "aila" | "owa";
  stepNumber: number;
  isLoadingLessonPlan: boolean;
  isMaterialLoading: boolean;
  isMaterialRefining: boolean;
  isDownloading: boolean;
  pageData: PageData;
  generation: TeachingMaterialSchemas | null;
  docType: TeachingMaterialType | null;
  formState: StepOneFormState;
  moderation?: ModerationResult;
  threatDetection?: boolean;
  error: TeachingMaterialError | null;
  refinementGenerationHistory: TeachingMaterialSchemas[];

  actions: {
    // setters
    setStepNumber: (
      step: number,
      componentType?: ComponentTypeValueType,
    ) => void;
    setPageData: (pageData: PageData) => void;
    setGeneration: (generation: TeachingMaterialSchemas | null) => void;
    setDocType: (docType: string | null) => void;
    setSource: (source: "aila" | "owa") => void;
    setId: (id: string | null) => void;
    setIsLoadingLessonPlan: (isLoading: boolean) => void;
    setIsMaterialLoading: (isLoading: boolean) => void;
    setIsMaterialRefining: (isRefining: boolean) => void;
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
      trackEventFromOwa?: boolean,
    ) => Promise<{ success: boolean }>;
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
      trackMaterialSelected: (params: {
        resourceId: string;
        docType: TeachingMaterialType;
        componentType: ComponentTypeValueType;
        platform: PlatformValueType;
        product: ProductValueType;
      }) => void;
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

export type TeachingMaterialsSetter =
  StoreApi<TeachingMaterialsState>["setState"];
export type TeachingMaterialsGetter =
  StoreApi<TeachingMaterialsState>["getState"];
