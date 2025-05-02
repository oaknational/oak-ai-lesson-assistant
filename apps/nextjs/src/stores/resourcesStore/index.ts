import { create } from "zustand";

import { logStoreUpdates } from "../zustandHelpers";
import { handleDownload } from "./actionFunctions/handleDownload";
import {
  handleResetFormState,
  handleSetActiveDropdown,
  handleSetSubject,
  handleSetTitle,
  handleSetYear,
} from "./actionFunctions/handleFormState";
import { handleGenerateMaterial } from "./actionFunctions/handleGenerateMaterial";
import { handleRefineMaterial } from "./actionFunctions/handleRefineMaterial";
import { handleSetDocType } from "./actionFunctions/handleSetDocType";
import { handleSetGeneration } from "./actionFunctions/handleSetGeneration";
import { handleSetIsLoadingLessonPlan } from "./actionFunctions/handleSetIsLoadingLessonPlan";
import handleSetIsResourcesLoading from "./actionFunctions/handleSetIsResourcesLoading";
import { handleSetPageData } from "./actionFunctions/handleSetPageData";
import { handleSetStepNumber } from "./actionFunctions/handleSetStepNumber";
import { handleSubmitLessonPlan } from "./actionFunctions/handleSubmitLessonPlan";
import type { ResourcesState } from "./types";

export * from "./types";

export type CreateResourcesStoreParams = {
  id: string;
};

export const createResourcesStore = ({ id }: CreateResourcesStoreParams) => {
  const resourcesStore = create<ResourcesState>()((set, get) => ({
    id,
    stepNumber: 0,
    isLoadingLessonPlan: false,
    isResourcesLoading: false,
    isDownloading: false,
    pageData: {
      lessonPlan: {
        title: "",
        keyStage: "",
        subject: "",
        topic: "",
        learningOutcome: "",
        learningCycles: [],
        priorKnowledge: [],
        keyLearningPoints: [],
        misconceptions: [],
        keywords: [],
        starterQuiz: [],
        cycle1: undefined,
        cycle2: undefined,
        cycle3: undefined,
        exitQuiz: undefined,
        additionalMaterials: undefined,
      },
    },
    generation: null,
    docType: null,
    formState: {
      subject: null,
      title: null,
      year: null,
      activeDropdown: null,
    },

    actions: {
      // Setters
      setStepNumber: handleSetStepNumber(set, get),
      setPageData: handleSetPageData(set, get),
      setGeneration: handleSetGeneration(set, get),
      setDocType: handleSetDocType(set, get),
      setIsLoadingLessonPlan: handleSetIsLoadingLessonPlan(set, get),
      setIsResourcesLoading: handleSetIsResourcesLoading(set, get),
      setIsResourceDownloading: (isDownloading: boolean) =>
        set({ isDownloading }),
      // Form state setters
      setSubject: handleSetSubject(set, get),
      setTitle: handleSetTitle(set, get),
      setYear: handleSetYear(set, get),
      setActiveDropdown: handleSetActiveDropdown(set, get),
      resetFormState: handleResetFormState(set, get),

      // Business logic actions
      submitLessonPlan: handleSubmitLessonPlan(set, get),
      generateMaterial: handleGenerateMaterial(set, get),
      refineMaterial: handleRefineMaterial(set, get),
      downloadMaterial: handleDownload(set, get),
    },
  }));

  // Log store updates
  logStoreUpdates(resourcesStore, "additional-materials");
  return resourcesStore;
};
