import type { AdaptationPlan, SlideDeckContent } from "@oakai/lesson-adapters";

import type { StoreApi } from "zustand";

/**
 * Extracted lesson data for display
 */
export interface ExtractedLessonData {
  keyStage: string;
  subject: string;
  title: string;
  learningOutcome: string;
  learningCycles: string[];
  keyLearningPoints: string[];
  keywords: Array<{
    keyword: string;
    definition: string;
  }>;
  misconceptions: Array<{
    misconception: string;
    description: string;
  }>;
}

/**
 * Thumbnail data for slide preview
 */
export interface Thumbnail {
  objectId: string;
  slideIndex: number;
  thumbnailUrl: string;
  width: number;
  height: number;
}

/**
 * Status of the lesson adapt workflow
 */
export type LessonAdaptStatus =
  | "idle"
  | "loading-lesson"
  | "ready"
  | "generating-plan"
  | "executing"
  | "error";

/**
 * Active tab in the lesson content area
 */
export type LessonAdaptTab = "lesson-details" | "slides" | "thumbnails";

/**
 * Main state interface for the lesson adapt store
 */
export interface LessonAdaptState {
  // Session
  sessionId: string | null;
  lessonSlug: string | null;

  // Lesson Data
  lessonData: ExtractedLessonData | null;
  slideContent: SlideDeckContent | null;

  // Presentation
  duplicatedPresentationId: string | null;
  duplicatedPresentationUrl: string | null;

  // Thumbnails
  thumbnails: Thumbnail[] | null;
  thumbnailsLoading: boolean;
  thumbnailsError: Error | null;

  // Status
  status: LessonAdaptStatus;
  error: Error | null;

  // Plan
  currentPlan: AdaptationPlan | null;
  approvedChangeIds: string[];

  // UI
  activeTab: LessonAdaptTab;
  showReviewModal: boolean;

  // Actions
  actions: {
    // Setters
    setLessonSlug: (slug: string) => void;
    setActiveTab: (tab: LessonAdaptTab) => void;
    setStatus: (status: LessonAdaptStatus) => void;
    setShowReviewModal: (show: boolean) => void;
    setError: (error: Error | null) => void;

    // Plan management
    toggleChangeApproval: (changeId: string) => void;
    approveAllChanges: () => void;
    rejectAllChanges: () => void;
    setPlanFromResponse: (plan: AdaptationPlan) => void;
    clearPlan: () => void;

    // Async operations
    fetchLessonContent: () => Promise<void>;
    fetchThumbnails: () => Promise<void>;
    generatePlan: (userMessage: string) => Promise<void>;
    executeAdaptations: () => Promise<void>;

    // Reset
    reset: () => void;
  };
}

// Zustand helper types
export type LessonAdaptGetter = StoreApi<LessonAdaptState>["getState"];
export type LessonAdaptSetter = StoreApi<LessonAdaptState>["setState"];
