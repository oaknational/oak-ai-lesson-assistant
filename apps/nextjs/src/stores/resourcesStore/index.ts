import { create } from "zustand";

import type { TeachingMaterialsPageProps } from "@/app/aila/tools/teaching-materials/teachingMaterialsView";
import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";

import { logStoreUpdates } from "../zustandHelpers";
import { handleAnalytics } from "./actionFunctions/handleAnalytics";
import { handleCreateMaterialSession } from "./actionFunctions/handleCreateMaterialSession";
import { handleDownload } from "./actionFunctions/handleDownload";
import {
  handleResetFormState,
  handleSetActiveDropdown,
  handleSetSubject,
  handleSetTitle,
  handleSetYear,
} from "./actionFunctions/handleFormState";
import { handleGenerateMaterial } from "./actionFunctions/handleGenerateMaterial";
import { handleLoadOwaDataToStore } from "./actionFunctions/handleLoadOwaDataToStore";
import { handleRefineMaterial } from "./actionFunctions/handleRefineMaterial";
import { handleSetDocType } from "./actionFunctions/handleSetDocType";
import { handleSetGeneration } from "./actionFunctions/handleSetGeneration";
import { handleSetIsLoadingLessonPlan } from "./actionFunctions/handleSetIsLoadingLessonPlan";
import handleSetIsResourcesLoading, {
  handleSetIsResourceRefining,
} from "./actionFunctions/handleSetIsResourcesLoading";
import { handleSetPageData } from "./actionFunctions/handleSetPageData";
import { handleSetStepNumber } from "./actionFunctions/handleSetStepNumber";
import { handleSubmitLessonPlan } from "./actionFunctions/handleSubmitLessonPlan";
import { handleUndoRefinement } from "./actionFunctions/handleUndoRefinement";
import type { ResourcesState } from "./types";

export * from "./types";

const DEFAULT_STATE = {
  stepNumber: 0,
  isLoadingLessonPlan: false,
  isResourcesLoading: false,
  isResourceRefining: false,
  isDownloading: false,
  error: null,
  pageData: {
    lessonPlan: {
      lessonId: "",
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
  moderation: undefined,
  threatDetection: undefined,
  refinementGenerationHistory: [],
};

export const createResourcesStore = (
  props: TeachingMaterialsPageProps,
  track: TrackFns,
  initState?: Partial<ResourcesState>,
) => {
  const resourcesStore = create<ResourcesState>()((set, get) => ({
    id: null,
    ...DEFAULT_STATE,
    ...initState,
    source: props.source ?? "aila",
    stepNumber: props.initialStep ?? 0,
    isResourcesLoading: props.source === "owa" && props.initialStep === 3,
    actions: {
      // Setters
      setStepNumber: handleSetStepNumber(set, get),
      setPageData: handleSetPageData(set, get),
      setGeneration: handleSetGeneration(set, get),
      setDocType: handleSetDocType(set, get),
      setIsLoadingLessonPlan: handleSetIsLoadingLessonPlan(set, get),
      setIsResourcesLoading: handleSetIsResourcesLoading(set, get),
      setIsResourceRefining: handleSetIsResourceRefining(set, get),
      setIsResourceDownloading: (isDownloading: boolean) =>
        set({ isDownloading }),
      setThreatDetection: (threatDetection: boolean) => {
        set({ threatDetection });
      },
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

      // OWA data loading
      loadOwaDataToStore: handleLoadOwaDataToStore(set, get),

      // History management actions
      undoRefinement: handleUndoRefinement(set, get),

      createMaterialSession: handleCreateMaterialSession(set, get),

      // Analytics actions
      analytics: handleAnalytics(set, get, track),

      // Reset store to default state
      resetToDefault: () =>
        set((state) => ({ ...DEFAULT_STATE, id: state.id })),
    },
  }));

  // Log store updates
  logStoreUpdates(resourcesStore, "additional-materials");

  return resourcesStore;
};
