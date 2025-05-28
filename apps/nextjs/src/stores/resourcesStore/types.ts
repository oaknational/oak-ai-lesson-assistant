import type {
  AdditionalMaterialSchemas,
  AdditionalMaterialType,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { z } from "zod";
import type { StoreApi } from "zustand";

import type { GenerateMaterialParams } from "./actionFunctions/handleGenerateMaterial";
import type { RefineMaterialParams } from "./actionFunctions/handleRefineMaterial";
import type { SubmitLessonPlanParams } from "./actionFunctions/handleSubmitLessonPlan";

export type PageData = {
  lessonPlan: AilaPersistedChat["lessonPlan"] & { lessonId: string };
  transcript?: string | null;
};

// Form state for StepOne
export type StepOneFormState = {
  subject: string | null;
  title: string | null;
  year: string | null;
  activeDropdown: string | null;
};

const errorType = z.enum(["rate_limit", "banned", "unknown"]);
export type ErrorType = z.infer<typeof errorType>;

export const errorResponse = z.object({
  type: errorType,
  message: z.string(),
});
type ErrorResponse = z.infer<typeof errorResponse>;

export type ResourcesState = {
  id: string | null;
  stepNumber: number;
  isLoadingLessonPlan: boolean;
  isResourcesLoading: boolean;
  isDownloading: boolean;
  pageData: PageData;
  generation: AdditionalMaterialSchemas | null;
  docType: AdditionalMaterialType | null;
  formState: StepOneFormState;
  moderation?: ModerationResult;
  threatDetection?: boolean;
  error: ErrorResponse | null;

  actions: {
    // setters
    setStepNumber: (step: number) => void;
    setPageData: (pageData: PageData) => void;
    setGeneration: (generation: AdditionalMaterialSchemas | null) => void;
    setDocType: (docType: string | null) => void;
    setIsLoadingLessonPlan: (isLoading: boolean) => void;
    setIsResourcesLoading: (isLoading: boolean) => void;
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
    submitLessonPlan: (params: SubmitLessonPlanParams) => Promise<void>;
    generateMaterial: (params: GenerateMaterialParams) => Promise<void>;
    refineMaterial: (params: RefineMaterialParams) => Promise<void>;
    downloadMaterial: () => Promise<void>;

    // Reset store to default state
    resetToDefault: () => void;
  };
};

export type ResourcesSetter = StoreApi<ResourcesState>["setState"];
export type ResourcesGetter = StoreApi<ResourcesState>["getState"];
