/**
 * QuizTracker is the main entry point for instrumenting the quiz pipeline.
 * It coordinates between the Report (for debug UI streaming) and Sentry (for production observability).
 */
import * as Sentry from "@sentry/nextjs";

import { Report, type ReportNode } from "./Report";
import { Task } from "./Task";

export interface QuizTrackerOptions {
  /**
   * Callback invoked on every report update.
   * Used for streaming updates to the debug UI.
   */
  onUpdate?: (snapshot: ReportNode) => void;
}

export interface QuizTracker {
  /**
   * Run the quiz pipeline with instrumentation.
   * The callback receives a root Task for creating child tasks.
   */
  run<T>(fn: (task: Task) => Promise<T>): Promise<T>;

  /**
   * Get the report snapshot.
   */
  getReport(): ReportNode;
}

/**
 * Create a tracker for instrumenting quiz generation.
 * Always creates Sentry spans. Optionally streams report updates.
 *
 * @example
 * // Production: Sentry only
 * const tracker = createQuizTracker();
 * const quiz = await tracker.run((task) => buildQuiz(..., task));
 * log.info("Quiz complete", { report: tracker.getReport() });
 *
 * @example
 * // Debug UI: Sentry + streaming
 * const tracker = createQuizTracker({
 *   onUpdate: (snapshot) => stream.write(snapshot),
 * });
 */
export function createQuizTracker(
  options: QuizTrackerOptions = {},
): QuizTracker {
  const report = new Report(options.onUpdate);

  return {
    async run<T>(fn: (task: Task) => Promise<T>): Promise<T> {
      return Sentry.startSpan(
        {
          name: "quiz.pipeline",
          op: "quiz.pipeline",
        },
        async (rootSpan) => {
          const rootTask = new Task(report, [], rootSpan);
          try {
            const result = await fn(rootTask);
            report.complete();
            report.emit();
            return result;
          } catch (error) {
            report.complete();
            report.emit();
            throw error;
          }
        },
      );
    },

    getReport(): ReportNode {
      return report.getSnapshot();
    },
  };
}
