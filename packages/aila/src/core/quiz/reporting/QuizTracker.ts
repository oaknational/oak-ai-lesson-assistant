/**
 * QuizTracker is the main entry point for instrumenting the quiz pipeline.
 * It coordinates between the Report (for debug UI streaming) and Sentry (for production observability).
 */
import * as Sentry from "@sentry/nextjs";
import { nanoid } from "nanoid";

import { type FinalReport, Report } from "./Report";
import { Task } from "./Task";

export interface QuizTrackerOptions {
  /**
   * Callback invoked on every report update.
   * Used for streaming updates to the debug UI.
   */
  onUpdate?: (snapshot: FinalReport) => void;
}

export interface QuizTracker {
  /**
   * Run the quiz pipeline with instrumentation.
   * The callback receives a Task for creating child tasks and the reportId
   * to pass through to buildQuiz.
   */
  run<T>(fn: (task: Task, reportId: string) => Promise<T>): Promise<T>;

  /**
   * Get the final report ready for storage.
   */
  getReport(): FinalReport;
}

/**
 * Create a tracker for instrumenting quiz generation.
 * Creates Sentry spans and optionally streams report updates for debug UI.
 *
 * @example
 * const tracker = createQuizTracker({ onUpdate });
 * const quiz = await tracker.run((task, reportId) =>
 *   service.buildQuiz(quizType, lessonPlan, lessons, task, reportId)
 * );
 * await ReportStorage.store(tracker.getReport());
 */
export function createQuizTracker(
  options: QuizTrackerOptions = {},
): QuizTracker {
  const reportId = nanoid(16);
  const report = new Report(reportId, options.onUpdate);

  return {
    async run<T>(fn: (task: Task, reportId: string) => Promise<T>): Promise<T> {
      return Sentry.startSpan(
        {
          name: "quiz.pipeline",
          op: "quiz.pipeline",
        },
        async (rootSpan) => {
          const rootTask = new Task(report, [], rootSpan);
          try {
            const result = await fn(rootTask, reportId);
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

    getReport(): FinalReport {
      return report.getSnapshot();
    },
  };
}
