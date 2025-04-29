import type { AdditionalMaterialSchemas } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";

import type { StoreApi } from "zustand";

import type { GenerateMaterialParams } from "./actionFunctions/handleGenerateMaterial";
import type { RefineMaterialParams } from "./actionFunctions/handleRefineMaterial";
import type { SubmitLessonPlanParams } from "./actionFunctions/handleSubmitLessonPlan";

export type PageData = {
  lessonPlan: AilaPersistedChat["lessonPlan"];
  transcript?: string | null;
};

// Form state for StepOne
export type StepOneFormState = {
  subject: string | null;
  title: string | null;
  year: string | null;
  activeDropdown: string | null;
};

export type ResourcesState = {
  id: string;
  stepNumber: number;
  isLoadingLessonPlan: boolean;
  isResourcesLoading: boolean;
  pageData: PageData;
  generation: AdditionalMaterialSchemas | null;
  docType: string | null;
  formState: StepOneFormState;

  actions: {
    // setters
    setStepNumber: (step: number) => void;
    setPageData: (pageData: PageData) => void;
    setGeneration: (generation: AdditionalMaterialSchemas | null) => void;
    setDocType: (docType: string | null) => void;
    setIsLoadingLessonPlan: (isLoading: boolean) => void;
    setIsResourcesLoading: (isLoading: boolean) => void;

    // Form state setters
    setSubject: (subject: string | null) => void;
    setTitle: (title: string | null) => void;
    setYear: (year: string | null) => void;
    setActiveDropdown: (dropdown: string | null) => void;

    // Clear form state
    resetFormState: () => void;

    // business logic actions
    submitLessonPlan: (
      params: SubmitLessonPlanParams,
    ) => Promise<AilaPersistedChat["lessonPlan"]>;
    generateMaterial: (
      params: GenerateMaterialParams,
    ) => Promise<AdditionalMaterialSchemas>;
    refineMaterial: (
      params: RefineMaterialParams,
    ) => Promise<AdditionalMaterialSchemas>;
  };
};

export type ResourcesSetter = StoreApi<ResourcesState>["setState"];
export type ResourcesGetter = StoreApi<ResourcesState>["getState"];
