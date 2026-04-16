import type { ReportNode } from "@oakai/aila/src/core/quiz/reporting";
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
  userInstructions: string;
}

interface StreamPipelineCallbacks {
  onReportUpdate: (report: ReportNode, isComplete: boolean) => void;
  onError: (error: Error) => void;
}

function processSSEEvent(
  event: SSEEvent,
  callbacks: StreamPipelineCallbacks,
): void {
  const { onReportUpdate, onError } = callbacks;

  if (event.type === "report" || event.type === "complete") {
    onReportUpdate(event.data as ReportNode, event.type === "complete");
  } else if (event.type === "error") {
    const errorData = event.data as { message: string };
    onError(new Error(errorData.message));
  }
}

function processSSELine(
  line: string,
  callbacks: StreamPipelineCallbacks,
): void {
  if (!line.startsWith("data: ")) {
    return;
  }

  try {
    const event = JSON.parse(line.slice(6)) as SSEEvent;
    log.info(`Stream event: ${event.type}`);
    processSSEEvent(event, callbacks);
  } catch (e) {
    log.error("Failed to parse SSE event:", e);
  }
}

export async function streamPipeline(
  params: StreamPipelineParams,
  callbacks: StreamPipelineCallbacks,
  signal: AbortSignal,
): Promise<void> {
  const { lessonPlan, quizType, relevantLessons, userInstructions } = params;

  const cleanedPlan = {
    ...lessonPlan,
    topic: lessonPlan.topic ?? undefined,
  };

  const response = await fetch("/api/debug/quiz-playground-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lessonPlan: cleanedPlan,
      quizType,
      relevantLessons,
      userInstructions: userInstructions || null,
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
      processSSELine(line, callbacks);
    }
  }
}
