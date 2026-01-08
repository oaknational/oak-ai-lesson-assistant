import { kv } from "@vercel/kv";

import type { FinalReport } from "./Report";
import { ReportStorage } from "./ReportStorage";
import type { StoredQuizReport } from "./storageTypes";

jest.mock("@vercel/kv", () => ({
  kv: {
    set: jest.fn().mockResolvedValue("OK"),
    get: jest.fn().mockResolvedValue(null),
  },
}));

const mockKv = jest.mocked(kv);

const sampleReport: FinalReport = {
  reportId: "test-report-id",
  status: "complete",
  startedAt: 1704067200000,
  completedAt: 1704067205000,
  durationMs: 5000,
  data: { quiz: { version: "v3", questions: [] } },
  children: {
    generator: {
      status: "complete",
      startedAt: 1704067200100,
      completedAt: 1704067204900,
      durationMs: 4800,
      data: {},
      children: {},
    },
  },
};

describe("ReportStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("store", () => {
    it("stores a report with the correct key pattern", async () => {
      await ReportStorage.store(sampleReport);

      expect(mockKv.set).toHaveBeenCalledWith(
        "quiz:generation-report:test-report-id",
        expect.objectContaining({
          reportId: "test-report-id",
          reportVersion: "v1",
          status: "complete",
        }),
      );
    });

    it("includes all report fields in the stored object", async () => {
      await ReportStorage.store(sampleReport);

      const storedReport = mockKv.set.mock.calls[0]?.[1] as StoredQuizReport;

      expect(storedReport.status).toBe("complete");
      expect(storedReport.startedAt).toBe(1704067200000);
      expect(storedReport.completedAt).toBe(1704067205000);
      expect(storedReport.durationMs).toBe(5000);
      expect(storedReport.children.generator).toBeDefined();
    });

    it("throws if kv.set fails", async () => {
      mockKv.set.mockRejectedValueOnce(new Error("KV unavailable"));

      await expect(ReportStorage.store(sampleReport)).rejects.toThrow(
        "KV unavailable",
      );
    });
  });

  describe("get", () => {
    it("retrieves a report by reportId", async () => {
      const storedReport: StoredQuizReport = {
        ...sampleReport,
        reportVersion: "v1",
      };
      mockKv.get.mockResolvedValueOnce(storedReport);

      const result = await ReportStorage.get("test-id");

      expect(mockKv.get).toHaveBeenCalledWith("quiz:generation-report:test-id");
      expect(result).toEqual(storedReport);
    });

    it("returns null if report not found", async () => {
      mockKv.get.mockResolvedValueOnce(null);

      const result = await ReportStorage.get("nonexistent-id");

      expect(result).toBeNull();
    });

    it("throws if kv.get fails", async () => {
      mockKv.get.mockRejectedValueOnce(new Error("KV unavailable"));

      await expect(ReportStorage.get("test-id")).rejects.toThrow(
        "KV unavailable",
      );
    });
  });
});
