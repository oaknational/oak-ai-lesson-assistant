import * as Sentry from "@sentry/nextjs";

import { generateMock } from "@anatine/zod-mock";

import { CompletedLessonPlanSchema } from "../../aila/src/protocol/schema";
import { QuizV1Schema } from "../../aila/src/protocol/schemas/quiz/quizV1";
import { QuizV2Schema } from "../../aila/src/protocol/schemas/quiz/quizV2";
import { getRagLessonPlansByIds } from "./getRagLessonPlansByIds";

jest.mock("@oakai/db", () => ({
  __esModule: true,
  prisma: {
    ragLessonPlan: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@sentry/nextjs", () => ({
  __esModule: true,
  captureException: jest.fn(),
}));

type DbRow = {
  id: string;
  ingestLessonId: string | null;
  oakLessonId: number | null;
  oakLessonSlug: string;
  lessonPlan: unknown;
};

function makeRow(overrides: Partial<DbRow> = {}): DbRow {
  return {
    id: "rag-id",
    ingestLessonId: null,
    oakLessonId: 1,
    oakLessonSlug: "slug",
    lessonPlan: generateMock(CompletedLessonPlanSchema),
    ...overrides,
  };
}

describe("getRagLessonPlansByIds", () => {
  let findManyMock: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    const dbModule = await import("@oakai/db");
    findManyMock = (
      dbModule as unknown as {
        prisma: { ragLessonPlan: { findMany: jest.Mock } };
      }
    ).prisma.ragLessonPlan.findMany;
  });

  describe("query construction", () => {
    it("queries findMany with id IN lessonPlanIds", async () => {
      findManyMock.mockResolvedValue([]);

      await getRagLessonPlansByIds({ lessonPlanIds: ["a", "b", "c"] });

      expect(findManyMock).toHaveBeenCalledTimes(1);
      expect(findManyMock).toHaveBeenCalledWith({
        where: { id: { in: ["a", "b", "c"] } },
      });
    });

    it("returns an empty array when no lesson plan IDs are requested", async () => {
      findManyMock.mockResolvedValue([]);

      const result = await getRagLessonPlansByIds({ lessonPlanIds: [] });

      expect(result).toEqual([]);
    });

    it("returns an empty array when findMany matches no rows", async () => {
      findManyMock.mockResolvedValue([]);

      const result = await getRagLessonPlansByIds({
        lessonPlanIds: ["missing"],
      });

      expect(result).toEqual([]);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe("row mapping", () => {
    it("returns the expected fields for a valid v3 lesson plan", async () => {
      findManyMock.mockResolvedValue([
        makeRow({
          id: "rag-1",
          ingestLessonId: "ingest-1",
          oakLessonId: 100,
          oakLessonSlug: "slug-1",
        }),
      ]);

      const result = await getRagLessonPlansByIds({ lessonPlanIds: ["rag-1"] });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        ragLessonPlanId: "ingest-1",
        oakLessonId: 100,
        oakLessonSlug: "slug-1",
      });
      expect(result[0]?.lessonPlan).toBeDefined();
    });

    it("uses ingestLessonId for ragLessonPlanId when present", async () => {
      findManyMock.mockResolvedValue([
        makeRow({ id: "rag-x", ingestLessonId: "ingest-x" }),
      ]);

      const result = await getRagLessonPlansByIds({ lessonPlanIds: ["rag-x"] });

      expect(result[0]?.ragLessonPlanId).toBe("ingest-x");
    });

    it("falls back to the input id for ragLessonPlanId when ingestLessonId is null", async () => {
      findManyMock.mockResolvedValue([
        makeRow({ id: "rag-y", ingestLessonId: null }),
      ]);

      const result = await getRagLessonPlansByIds({ lessonPlanIds: ["rag-y"] });

      expect(result[0]?.ragLessonPlanId).toBe("rag-y");
    });

    it("preserves a null oakLessonId", async () => {
      findManyMock.mockResolvedValue([makeRow({ oakLessonId: null })]);

      const result = await getRagLessonPlansByIds({ lessonPlanIds: ["rag-id"] });

      expect(result[0]?.oakLessonId).toBeNull();
    });
  });

  describe("schema migration", () => {
    it("migrates a v2 quiz lesson plan to v3 (regression for empty-basedOn bug)", async () => {
      const baseLesson = generateMock(CompletedLessonPlanSchema);
      const v2Quiz = generateMock(QuizV2Schema);

      findManyMock.mockResolvedValue([
        makeRow({
          id: "rag-v2",
          lessonPlan: {
            ...baseLesson,
            starterQuiz: v2Quiz,
            exitQuiz: v2Quiz,
          },
        }),
      ]);

      const result = await getRagLessonPlansByIds({
        lessonPlanIds: ["rag-v2"],
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.lessonPlan.starterQuiz.version).toBe("v3");
      expect(result[0]?.lessonPlan.exitQuiz.version).toBe("v3");
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("migrates a v1 quiz lesson plan through to v3", async () => {
      const baseLesson = generateMock(CompletedLessonPlanSchema);
      const v1Quiz = generateMock(QuizV1Schema);

      findManyMock.mockResolvedValue([
        makeRow({
          id: "rag-v1",
          lessonPlan: {
            ...baseLesson,
            starterQuiz: v1Quiz,
            exitQuiz: v1Quiz,
          },
        }),
      ]);

      const result = await getRagLessonPlansByIds({
        lessonPlanIds: ["rag-v1"],
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.lessonPlan.starterQuiz.version).toBe("v3");
      expect(result[0]?.lessonPlan.exitQuiz.version).toBe("v3");
    });
  });

  describe("error handling", () => {
    it("drops a malformed lesson plan and reports it to Sentry", async () => {
      findManyMock.mockResolvedValue([
        makeRow({
          id: "rag-bad",
          oakLessonId: 999,
          lessonPlan: { totally: "wrong", shape: 123 },
        }),
      ]);

      const result = await getRagLessonPlansByIds({
        lessonPlanIds: ["rag-bad"],
      });

      expect(result).toEqual([]);
      expect(Sentry.captureException).toHaveBeenCalledTimes(1);
      expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), {
        extra: { ragLessonPlanId: "rag-bad", oakLessonId: 999 },
      });
    });

    it("returns the surviving rows when only some plans fail validation", async () => {
      const validLesson = generateMock(CompletedLessonPlanSchema);

      findManyMock.mockResolvedValue([
        makeRow({ id: "rag-good", lessonPlan: validLesson }),
        makeRow({ id: "rag-bad", lessonPlan: { broken: true } }),
      ]);

      const result = await getRagLessonPlansByIds({
        lessonPlanIds: ["rag-good", "rag-bad"],
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.ragLessonPlanId).toBe("rag-good");
      expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    });
  });
});
