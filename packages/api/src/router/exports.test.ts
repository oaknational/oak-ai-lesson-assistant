import * as Sentry from "@sentry/nextjs";
import type * as Zod from "zod";

import {
  getExistingExportData,
  getLessonPlanCacheKeyInput,
} from "../export/exportHelpers";
import { exportLessonPlan } from "../export/exportLessonPlan";
import { exportLessonSlides } from "../export/exportLessonSlides";
import type * as Trpc from "../trpc";
import { exportsRouter } from "./exports";

jest.mock("@oakai/core/src/utils/sendEmail", () => ({ sendEmail: jest.fn() }));
jest.mock("@clerk/nextjs/server", () => ({ clerkClient: jest.fn() }));
jest.mock("@vercel/kv", () => ({ kv: {} }));
jest.mock("@oakai/exports", () => {
  const { z } = jest.requireActual<typeof Zod>("zod");
  return {
    exportDocLessonPlanSchema: z.object({}).passthrough(),
    exportDocQuizSchema: z.object({}).passthrough(),
    exportDocsWorksheetSchema: z.object({}).passthrough(),
    exportSlidesFullLessonSchema: z.object({}).passthrough(),
  };
});
jest.mock("@sentry/nextjs", () => ({ captureException: jest.fn() }));
jest.mock("@sentry/node", () => ({
  trpcMiddleware: jest.fn(
    () =>
      ({ next }: { next: () => unknown }) =>
        next(),
  ),
}));
jest.mock("../middleware/auth", () => ({
  protectedProcedure:
    jest.requireActual<typeof Trpc>("../trpc").publicProcedure,
}));
jest.mock("../export/exportHelpers", () => ({
  getExistingExportData: jest.fn(),
  getLessonPlanCacheKeyInput: jest.fn(),
}));
jest.mock("../export/exportLessonPlan", () => ({
  exportLessonPlan: jest.fn(),
}));
jest.mock("../export/exportLessonSlides", () => ({
  exportLessonSlides: jest.fn(),
}));
jest.mock("../export/exportAdditionalMaterialsDoc", () => ({
  exportAdditionalMaterialsDoc: jest.fn(),
}));
jest.mock("../export/exportQuizDoc", () => ({ exportQuizDoc: jest.fn() }));
jest.mock("../export/exportWorksheets", () => ({
  exportWorksheets: jest.fn(),
}));

const createCaller = () => exportsRouter.createCaller({ prisma: {} } as never);
const input = {
  chatId: "chat",
  messageId: "message",
  data: {},
  lessonSnapshot: {},
} as never;

describe("export failure diagnostics", () => {
  it.each([
    "checkIfLessonPlanDownloadExists",
    "checkIfSlideDownloadExists",
    "checkIfAdditionalMaterialsDownloadExists",
    "checkIfWorksheetDownloadExists",
    "checkIfQuizDownloadExists",
  ] as const)(
    "reports %s failures while preserving the response",
    async (method) => {
      const error = new Error("Query engine unreachable");
      jest
        .mocked(getLessonPlanCacheKeyInput)
        .mockResolvedValue({ cacheKeyInput: {} } as never);
      jest.mocked(getExistingExportData).mockRejectedValue(error);

      const result = await createCaller()[method](input);

      expect(result).toMatchObject({ error, message: expect.any(String) });
      expect(Sentry.captureException).toHaveBeenCalledTimes(1);
      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: { chatId: "chat", error, message: expect.any(String) },
      });
    },
  );

  it.each(["exportLessonPlanDoc", "generateAllAssetExports"] as const)(
    "reports %s failures while preserving the response",
    async (method) => {
      const error = new Error("Database unavailable");
      jest.mocked(exportLessonPlan).mockRejectedValue(error);

      expect(await createCaller()[method](input)).toMatchObject({
        error,
        message: expect.any(String),
      });
      expect(Sentry.captureException).toHaveBeenCalledTimes(1);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.any(Object),
      );
    },
  );

  it("reports an aggregate error result once and preserves its cause", async () => {
    const cause = new Error("Query engine unreachable");
    jest.mocked(exportLessonSlides).mockResolvedValue({
      error: cause,
      message: "Failed to export lesson",
    });

    const result = await createCaller().generateAllAssetExports(input);

    expect(result).toMatchObject({
      error: { message: "Failed to export lesson", cause },
      message: "Failed to generate all asset exports",
    });
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ cause }),
      expect.any(Object),
    );
  });

  it("does not report a missing export as an error", async () => {
    jest
      .mocked(getExistingExportData)
      .mockResolvedValue({ exportData: undefined } as never);
    expect(
      await createCaller().checkIfSlideDownloadExists(input),
    ).toBeUndefined();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
