/**
 * Task is the context object passed to each child callback.
 * It provides methods to create nested tasks and set data.
 * Each Task knows its path in the tree and updates both Sentry and the Report.
 */
import * as Sentry from "@sentry/nextjs";
import type { Span } from "@sentry/nextjs";

import type { Report } from "./Report";

export class Task {
  constructor(
    private report: Report,
    private path: string[],
    private span?: Span,
  ) {}

  /**
   * Set data on this task. Triggers a report emit for real-time streaming.
   */
  setData(key: string, value: unknown): void {
    this.report.setAtPath(this.path, key, value);
    this.report.emit();
  }

  /**
   * Create a child task. The callback receives a new Task scoped to the child.
   * Updates both the Report tree and creates a Sentry span.
   */
  async child<T>(name: string, fn: (task: Task) => Promise<T>): Promise<T> {
    const childPath = [...this.path, name];

    this.report.startAtPath(childPath);
    this.report.emit();

    return Sentry.startSpan(
      {
        name: `quiz.${name}`,
        op: "quiz.task",
        parentSpan: this.span,
      },
      async (childSpan) => {
        const childTask = new Task(this.report, childPath, childSpan);
        try {
          const result = await fn(childTask);
          this.report.endAtPath(childPath);
          this.report.emit();
          return result;
        } catch (error) {
          this.report.errorAtPath(childPath, error);
          this.report.emit();
          throw error;
        }
      },
    );
  }
}
