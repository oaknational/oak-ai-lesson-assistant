"use client";

import { useCallback, useRef, useState } from "react";

import type { ReportNode } from "@oakai/aila/src/core/quiz/instrumentation";
import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import type { SSEEvent } from "./types";

const log = aiLogger("admin");

export interface StreamingState {
  isRunning: boolean;
  error: Error | null;
  report: ReportNode | null;
}

const initialState: StreamingState = {
  isRunning: false,
  error: null,
  report: null,
};

/**
 * Hook for running the Quiz RAG debug pipeline with streaming updates.
 *
 * The backend streams a report object that contains the current state of all
 * pipeline stages. This is simpler than tracking individual stage events.
 */
export function useStreamingDebug() {
  const [state, setState] = useState<StreamingState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleEvent = useCallback((event: SSEEvent) => {
    log.info(`Stream event: ${event.type}`);

    if (event.type === "report" || event.type === "complete") {
      setState((prev) => ({
        ...prev,
        report: event.data as ReportNode,
        isRunning: event.type !== "complete",
      }));
    } else if (event.type === "error") {
      const errorData = event.data as { message: string };
      setState((prev) => ({
        ...prev,
        isRunning: false,
        error: new Error(errorData.message),
      }));
    }
  }, []);

  const runPipeline = useCallback(
    async (
      lessonPlan: PartialLessonPlan,
      quizType: QuizPath,
      relevantLessons: AilaRagRelevantLesson[] = [],
    ) => {
      // Reset state
      setState({
        ...initialState,
        isRunning: true,
      });

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        // Transform null to undefined for fields that need it
        const cleanedPlan = {
          ...lessonPlan,
          topic: lessonPlan.topic ?? undefined,
        };

        const response = await fetch("/api/debug/quiz-rag-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lessonPlan: cleanedPlan,
            quizType,
            relevantLessons,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error ?? "Failed to start pipeline");
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Read SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              try {
                const event = JSON.parse(data) as SSEEvent;
                handleEvent(event);
              } catch (e) {
                log.error("Failed to parse SSE event:", e);
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          log.info("Pipeline cancelled");
        } else {
          log.error("Pipeline error:", error);
          setState((prev) => ({
            ...prev,
            isRunning: false,
            error: error as Error,
          }));
        }
      }
    },
    [handleEvent],
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(initialState);
  }, []);

  return {
    ...state,
    runPipeline,
    cancel,
    reset,
  };
}
