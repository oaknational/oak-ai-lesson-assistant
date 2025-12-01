import * as Sentry from "@sentry/node";

import type { QuizRagStreamingReport } from "../debug/types";

/**
 * Known stage names that map to report fields.
 * Imported from types for type safety.
 */
import type { PipelineStage, StreamingStageState } from "../debug/types";
import type {
  CompletedSpan,
  InstrumentationStrategy,
  ReportStreamingInstrumentationResult,
  Span,
  StreamEvent,
  StreamingInstrumentationResult,
} from "./types";

/**
 * Sentry instrumentation strategy.
 * Creates breadcrumbs for each completed span, useful for debugging
 * production issues.
 */
export const sentryInstrumentation: InstrumentationStrategy = {
  onSpanEnd: (span: CompletedSpan) => {
    Sentry.addBreadcrumb({
      category: "quiz-rag",
      message: span.name,
      data: {
        durationMs: span.durationMs,
        ...span.data,
      },
      level: "info",
    });
  },
};

/**
 * No-op instrumentation strategy.
 * Spans are still collected by the tracer but no callbacks are invoked.
 * Useful when you only need to retrieve spans via tracer.getCompletedSpans().
 */
export const noopInstrumentation: InstrumentationStrategy = {};

/**
 * Creates a streaming instrumentation that emits events via an async iterator.
 * Used for real-time updates to the debug UI as pipeline stages execute.
 *
 * Events are queued and yielded to consumers. The iterator blocks waiting
 * for new events when the queue is empty.
 *
 * Call `complete()` when the pipeline finishes to signal the iterator to end.
 */
export function createStreamingInstrumentation(): StreamingInstrumentationResult {
  const eventQueue: StreamEvent[] = [];
  let resolveNext: ((event: StreamEvent | null) => void) | null = null;
  let isComplete = false;

  const pushEvent = (event: StreamEvent) => {
    if (isComplete) return;

    if (resolveNext) {
      resolveNext(event);
      resolveNext = null;
    } else {
      eventQueue.push(event);
    }
  };

  const instrumentation: InstrumentationStrategy = {
    onSpanStart: (span: Span) => {
      pushEvent({
        type: "start",
        stage: span.name,
        timestamp: Date.now(),
      });
    },
    onSpanEnd: (span: CompletedSpan) => {
      pushEvent({
        type: "end",
        stage: span.name,
        data: span.data,
        timestamp: Date.now(),
      });
    },
  };

  const eventIterator: AsyncIterable<StreamEvent> = {
    [Symbol.asyncIterator]() {
      return {
        async next(): Promise<IteratorResult<StreamEvent>> {
          // Return queued events first
          if (eventQueue.length > 0) {
            return { value: eventQueue.shift()!, done: false };
          }

          // If complete and queue is empty, we're done
          if (isComplete) {
            return { value: undefined as unknown as StreamEvent, done: true };
          }

          // Wait for next event
          const event = await new Promise<StreamEvent | null>((resolve) => {
            resolveNext = resolve;
          });

          if (event === null) {
            return { value: undefined as unknown as StreamEvent, done: true };
          }

          return { value: event, done: false };
        },
      };
    },
  };

  const complete = () => {
    isComplete = true;
    // Resolve any pending wait with null to signal completion
    if (resolveNext) {
      resolveNext(null);
      resolveNext = null;
    }
  };

  return { instrumentation, eventIterator, complete };
}

const REPORT_STAGES: Set<PipelineStage> = new Set([
  "basedOnRag",
  "ailaRag",
  "mlMultiTerm",
  "imageDescriptions",
  "composerPrompt",
  "composerLlm",
]);

function isReportStage(name: string): name is PipelineStage {
  return REPORT_STAGES.has(name as PipelineStage);
}

interface QuestionLike {
  sourceUid: string;
}

interface PoolLike {
  questions: QuestionLike[];
}

/**
 * Extract searchTerms data from mlMultiTerm child spans.
 * This allows streaming the detailed search data without waiting for
 * QuizRagDebugService to reconstruct it post-pipeline.
 */
function extractSearchTermsFromChildren(mlSpan: CompletedSpan): unknown[] {
  const searchTerms: unknown[] = [];

  // Build lookup map from pools to convert UIDs to full questions
  const result = mlSpan.data["result"] as { pools?: PoolLike[] } | null;
  const questionsByUid = new Map<string, QuestionLike>();
  if (result?.pools) {
    for (const pool of result.pools) {
      for (const q of pool.questions) {
        questionsByUid.set(q.sourceUid, q);
      }
    }
  }

  // Find query spans (named "query-0", "query-1", etc.)
  const querySpans = mlSpan.children.filter((s) => s.name.startsWith("query-"));

  for (const querySpan of querySpans) {
    const query = querySpan.data["query"] as string | undefined;
    if (!query) continue;

    const esSpan = querySpan.children.find((s) => s.name === "elasticsearch");
    const cohereSpan = querySpan.children.find((s) => s.name === "cohere");

    // Convert candidate UIDs to full question objects
    const candidateUids = (querySpan.data["finalCandidates"] as string[]) ?? [];
    const finalCandidates = candidateUids
      .map((uid) => questionsByUid.get(uid))
      .filter((q): q is QuestionLike => q !== undefined);

    searchTerms.push({
      query,
      elasticsearchHits: esSpan?.data["hitsWithScores"] ?? [],
      cohereResults: cohereSpan?.data["allResults"] ?? [],
      finalCandidates,
      timingMs: querySpan.durationMs,
    });
  }

  return searchTerms;
}

/**
 * Creates a report-based streaming instrumentation that maintains a cumulative
 * report and emits it after each update.
 *
 * The report contains the current state of all pipeline stages. This is cleaner
 * than having the frontend piece together state from individual span events.
 */
export function createReportStreamingInstrumentation(): ReportStreamingInstrumentationResult<QuizRagStreamingReport> {
  // Use Record for internal mutations (allows dynamic property access)
  // Type assertions happen at output boundary when emitting snapshots
  const stages: Record<PipelineStage, StreamingStageState> = {
    basedOnRag: { status: "pending" },
    ailaRag: { status: "pending" },
    mlMultiTerm: { status: "pending" },
    imageDescriptions: { status: "pending" },
    composerPrompt: { status: "pending" },
    composerLlm: { status: "pending" },
  };

  const report: {
    stages: Record<PipelineStage, StreamingStageState>;
    status: "running" | "complete" | "error";
    startedAt: number;
    completedAt?: number;
  } = {
    stages,
    status: "running",
    startedAt: Date.now(),
  };

  // Queue and resolver for async iteration
  const reportQueue: QuizRagStreamingReport[] = [];
  let resolveNext: ((report: QuizRagStreamingReport | null) => void) | null =
    null;
  let isComplete = false;

  const emitReport = () => {
    if (isComplete) return;

    // Clone and cast to QuizRagStreamingReport at output boundary
    const snapshot = JSON.parse(
      JSON.stringify(report),
    ) as QuizRagStreamingReport;

    if (resolveNext) {
      resolveNext(snapshot);
      resolveNext = null;
    } else {
      reportQueue.push(snapshot);
    }
  };

  const instrumentation: InstrumentationStrategy = {
    onSpanStart: (span: Span) => {
      if (!isReportStage(span.name)) return;

      stages[span.name] = {
        status: "running",
        startedAt: Date.now(),
      };
      emitReport();
    },
    onSpanEnd: (span: CompletedSpan) => {
      if (!isReportStage(span.name)) return;

      const startedAt = stages[span.name].startedAt;
      let result = span.data["result"];

      // For mlMultiTerm, extract searchTerms from child spans
      if (span.name === "mlMultiTerm" && span.children.length > 0) {
        const searchTerms = extractSearchTermsFromChildren(span);
        if (searchTerms.length > 0) {
          result = { ...((result as object) ?? {}), searchTerms };
        }
      }

      stages[span.name] = {
        status: "complete",
        startedAt,
        completedAt: Date.now(),
        durationMs: span.durationMs,
        result,
      };
      emitReport();
    },
  };

  const reportIterator: AsyncIterable<QuizRagStreamingReport> = {
    [Symbol.asyncIterator]() {
      return {
        async next(): Promise<IteratorResult<QuizRagStreamingReport>> {
          if (reportQueue.length > 0) {
            return { value: reportQueue.shift()!, done: false };
          }

          if (isComplete) {
            return {
              value: undefined as unknown as QuizRagStreamingReport,
              done: true,
            };
          }

          const nextReport = await new Promise<QuizRagStreamingReport | null>(
            (resolve) => {
              resolveNext = resolve;
            },
          );

          if (nextReport === null) {
            return {
              value: undefined as unknown as QuizRagStreamingReport,
              done: true,
            };
          }

          return { value: nextReport, done: false };
        },
      };
    },
  };

  const complete = () => {
    report.status = "complete";
    report.completedAt = Date.now();
    emitReport();

    isComplete = true;
    if (resolveNext) {
      resolveNext(null);
      resolveNext = null;
    }
  };

  const getReport = () =>
    JSON.parse(JSON.stringify(report)) as QuizRagStreamingReport;

  return { instrumentation, reportIterator, complete, getReport };
}
