import type { ReportNode } from "@oakai/aila/src/core/quiz/reporting";
import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import { createStore, useStore } from "zustand";

import { streamPipeline } from "./actions/streamPipeline";

const log = aiLogger("quiz");

export type ViewMode = "learn" | "eval";

interface QuizPlaygroundState {
  // Input state
  lessonPlan: PartialLessonPlan | null;
  quizType: QuizPath;
  relevantLessons: AilaRagRelevantLesson[];

  // UI state
  viewMode: ViewMode;
  loadedReport: ReportNode | null;

  // Streaming state
  isRunning: boolean;
  error: Error | null;
  streamingReport: ReportNode | null;
}

interface QuizPlaygroundActions {
  setLessonPlan: (plan: PartialLessonPlan | null) => void;
  setQuizType: (type: QuizPath) => void;
  setRelevantLessons: (lessons: AilaRagRelevantLesson[]) => void;
  setViewMode: (mode: ViewMode) => void;
  setLoadedReport: (report: ReportNode | null) => void;
  clearInput: () => void;
  runPipeline: () => Promise<void>;
  cancelPipeline: () => void;
  resetPipeline: () => void;
}

export type QuizPlaygroundStore = QuizPlaygroundState & QuizPlaygroundActions;

export function createQuizPlaygroundStore(
  initialQuizType: QuizPath = "/starterQuiz",
) {
  let abortController: AbortController | null = null;

  return createStore<QuizPlaygroundStore>((set, get) => ({
    // Initial state
    lessonPlan: null,
    quizType: initialQuizType,
    relevantLessons: [],
    viewMode: "learn",
    loadedReport: null,
    isRunning: false,
    error: null,
    streamingReport: null,

    // Input actions
    setLessonPlan: (plan) => {
      set({ lessonPlan: plan, streamingReport: null, error: null });
      abortController?.abort();
    },
    setQuizType: (type) => {
      set({ quizType: type, streamingReport: null, error: null });
      abortController?.abort();
    },
    setRelevantLessons: (lessons) => set({ relevantLessons: lessons }),
    setViewMode: (mode) => set({ viewMode: mode }),
    setLoadedReport: (report) => set({ loadedReport: report }),
    clearInput: () => {
      set({
        lessonPlan: null,
        relevantLessons: [],
        loadedReport: null,
        streamingReport: null,
        error: null,
      });
      abortController?.abort();
    },

    // Pipeline actions
    runPipeline: async () => {
      const { lessonPlan, quizType, relevantLessons } = get();
      if (!lessonPlan) return;

      set({ isRunning: true, error: null, streamingReport: null });
      abortController = new AbortController();

      try {
        await streamPipeline(
          { lessonPlan, quizType, relevantLessons },
          {
            onReportUpdate: (report, isComplete) => {
              set({
                streamingReport: report,
                isRunning: !isComplete,
              });
            },
            onError: (error) => {
              set({ isRunning: false, error });
            },
          },
          abortController.signal,
        );
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          log.info("Pipeline cancelled");
        } else {
          log.error("Pipeline error:", error);
          set({ isRunning: false, error: error as Error });
        }
      }
    },

    cancelPipeline: () => {
      abortController?.abort();
      set({ isRunning: false });
    },

    resetPipeline: () => {
      abortController?.abort();
      set({ isRunning: false, error: null, streamingReport: null });
    },
  }));
}

// Type for the store instance
export type QuizPlaygroundStoreApi = ReturnType<
  typeof createQuizPlaygroundStore
>;

// Hook for using the store with a selector
export function useQuizPlaygroundStore<T>(
  store: QuizPlaygroundStoreApi,
  selector: (state: QuizPlaygroundStore) => T,
): T {
  return useStore(store, selector);
}
