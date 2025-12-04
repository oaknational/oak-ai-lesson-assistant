/**
 * Testing utilities for the instrumentation system.
 * Provides a mock Task that doesn't require Sentry or real Report.
 */
import { Report } from "./Report";
import { Task } from "./Task";

/**
 * Create a mock Task for testing.
 * Doesn't emit to Sentry, just records data in a Report.
 */
export function createMockTask(): Task {
  const report = new Report();
  return new Task(report, []);
}
