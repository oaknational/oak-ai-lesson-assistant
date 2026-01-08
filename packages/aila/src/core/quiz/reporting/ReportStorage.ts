import { aiLogger } from "@oakai/logger";

import { kv } from "@vercel/kv";

import type { FinalReport } from "./Report";
import type { StoredQuizReport } from "./storageTypes";

const log = aiLogger("aila:quiz:reporting");

const KV_KEY_PREFIX = "quiz:generation-report:";

/**
 * Stores and retrieves quiz generation reports from Vercel KV.
 *
 * Reports are stored indefinitely (no TTL) for historical analysis and evals.
 *
 * NOTE: No formal schema validation yet - stored report structure may evolve.
 * If we need to migrate stored reports in the future, use the reportVersion field.
 */
export const ReportStorage = {
  /**
   * Store a quiz generation report.
   *
   * @param report - The completed report from QuizTracker.getReport()
   */
  async store(report: FinalReport): Promise<void> {
    const { reportId } = report;

    const storedReport: StoredQuizReport = {
      ...report,
      reportVersion: "v1",
    };

    const key = `${KV_KEY_PREFIX}${reportId}`;

    try {
      await kv.set(key, storedReport);
      log.info("Stored quiz generation report", { reportId, key });
    } catch (error) {
      log.error("Failed to store quiz generation report", {
        reportId,
        error,
      });
      throw error;
    }
  },

  /**
   * Retrieve a quiz generation report by its ID.
   *
   * @param reportId - The ID from the stored report
   * @returns The stored report, or null if not found
   */
  async get(reportId: string): Promise<StoredQuizReport | null> {
    const key = `${KV_KEY_PREFIX}${reportId}`;

    try {
      const report = await kv.get<StoredQuizReport>(key);
      return report;
    } catch (error) {
      log.error("Failed to retrieve quiz generation report", {
        reportId,
        error,
      });
      throw error;
    }
  },
};
