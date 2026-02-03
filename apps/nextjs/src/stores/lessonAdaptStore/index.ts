import { create } from "zustand";

import type { TrpcUtils } from "@/utils/trpc";

import { logStoreUpdates } from "../zustandHelpers";
import {
  handleExecuteAdaptations,
  handleFetchLessonContent,
  handleFetchThumbnails,
  handleGeneratePlan,
} from "./stateActionFunctions";
import type { LessonAdaptState, LessonAdaptTab } from "./types";

export * from "./types";

export interface CreateLessonAdaptStoreParams {
  trpcUtils: TrpcUtils;
  initialValues?: Partial<LessonAdaptState>;
}

export const createLessonAdaptStore = ({
  trpcUtils,
  initialValues = {},
}: CreateLessonAdaptStoreParams) => {
  const lessonAdaptStore = create<LessonAdaptState>((set, get) => ({
    // Session
    sessionId: null,
    lessonSlug: null,

    // Lesson Data
    lessonData: null,
    slideContent: null,

    // Presentation
    duplicatedPresentationId: null,
    duplicatedPresentationUrl: null,

    // Thumbnails
    thumbnails: null,
    thumbnailsLoading: false,
    thumbnailsError: null,

    // Status
    status: "idle",
    error: null,

    // Plan
    currentPlan: null,
    approvedChangeIds: [],

    // UI
    activeTab: "lesson-details",
    showReviewModal: false,

    // Actions
    actions: {
      // Setters
      setLessonSlug: (slug) => set({ lessonSlug: slug }),
      setActiveTab: (tab: LessonAdaptTab) => set({ activeTab: tab }),
      setStatus: (status) => set({ status }),
      setShowReviewModal: (show) => set({ showReviewModal: show }),
      setError: (error) => set({ error }),

      // Plan management
      toggleChangeApproval: (changeId) => {
        const { approvedChangeIds } = get();
        if (approvedChangeIds.includes(changeId)) {
          set({
            approvedChangeIds: approvedChangeIds.filter((id) => id !== changeId),
          });
        } else {
          set({ approvedChangeIds: [...approvedChangeIds, changeId] });
        }
      },

      approveAllChanges: () => {
        const { currentPlan } = get();
        if (!currentPlan) return;

        const allChangeIds = extractAllChangeIds(currentPlan);
        set({ approvedChangeIds: allChangeIds });
      },

      rejectAllChanges: () => {
        set({ approvedChangeIds: [] });
      },

      setPlanFromResponse: (plan) => {
        const allChangeIds = extractAllChangeIds(plan);
        set({
          currentPlan: plan,
          approvedChangeIds: allChangeIds,
        });
      },

      clearPlan: () => {
        set({ currentPlan: null, approvedChangeIds: [] });
      },

      // Async operations
      fetchLessonContent: handleFetchLessonContent(set, get, trpcUtils),
      fetchThumbnails: handleFetchThumbnails(set, get, trpcUtils),
      generatePlan: handleGeneratePlan(set, get, trpcUtils),
      executeAdaptations: handleExecuteAdaptations(set, get, trpcUtils),

      // Reset
      reset: () => {
        set({
          sessionId: null,
          lessonSlug: null,
          lessonData: null,
          slideContent: null,
          duplicatedPresentationId: null,
          duplicatedPresentationUrl: null,
          thumbnails: null,
          thumbnailsLoading: false,
          thumbnailsError: null,
          status: "idle",
          error: null,
          currentPlan: null,
          approvedChangeIds: [],
          activeTab: "lesson-details",
          showReviewModal: false,
        });
      },
    },

    ...initialValues,
  }));

  logStoreUpdates(lessonAdaptStore, "adaptations");
  return lessonAdaptStore;
};

/**
 * Extract all change IDs from an adaptation plan
 */
function extractAllChangeIds(plan: {
  slidesAgentResponse: {
    changes: {
      textEdits: Array<{ changeId: string }>;
      tableCellEdits: Array<{ changeId: string }>;
      textElementDeletions: Array<{ changeId: string }>;
      slideDeletions: Array<{ changeId: string }>;
    };
  };
}): string[] {
  const { changes } = plan.slidesAgentResponse;
  return [
    ...changes.textEdits.map((c) => c.changeId),
    ...changes.tableCellEdits.map((c) => c.changeId),
    ...changes.textElementDeletions.map((c) => c.changeId),
    ...changes.slideDeletions.map((c) => c.changeId),
  ];
}
