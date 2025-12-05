import type { ReportNode } from "@oakai/aila/src/core/quiz/instrumentation";
import { aiLogger } from "@oakai/logger";

import type { SSEEvent } from "../types";

const log = aiLogger("quiz");

interface StreamPipelineParams {
  lessonPlan: {
    topic?: string | null;
    [key: string]: unknown;
  };
  quizType: string;
  relevantLessons: unknown[];
}

interface StreamPipelineCallbacks {
  onReportUpdate: (report: ReportNode, isComplete: boolean) => void;
  onError: (error: Error) => void;
}

export async function streamPipeline(
  params: StreamPipelineParams,
  callbacks: StreamPipelineCallbacks,
  signal: AbortSignal,
): Promise<void> {
  const { lessonPlan, quizType, relevantLessons } = params;
  const { onReportUpdate, onError } = callbacks;

  const cleanedPlan = {
    ...lessonPlan,
    topic: lessonPlan.topic ?? undefined,
  };

  const response = await fetch("/api/debug/quiz-rag-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lessonPlan: cleanedPlan,
      quizType,
      relevantLessons,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = (await response.json()) as { error?: string };
    throw new Error(errorData.error ?? "Failed to start pipeline");
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6)) as SSEEvent;
          log.info(`Stream event: ${event.type}`);

          if (event.type === "report" || event.type === "complete") {
            onReportUpdate(event.data as ReportNode, event.type === "complete");
          } else if (event.type === "error") {
            const errorData = event.data as { message: string };
            onError(new Error(errorData.message));
          }
        } catch (e) {
          log.error("Failed to parse SSE event:", e);
        }
      }
    }
  }
}
