import type { PrismaClientWithAccelerate } from "@oakai/db";

import { generateMock } from "@anatine/zod-mock";

import { CompletedLessonPlanSchemaWithoutLength } from "../../../aila/src/protocol/schema";
import type { RagLogger } from "../../types";
import { executePrismaQueryRaw } from "./executePrismaQueryRaw";
import { vectorSearch } from "./search";

jest.mock("./executePrismaQueryRaw", () => ({
  __esModule: true,
  executePrismaQueryRaw: jest.fn(),
}));

describe("vectorSearch", () => {
  const prisma = {} as PrismaClientWithAccelerate;
  const log: RagLogger = {
    info: jest.fn(),
    error: jest.fn(),
  };

  const mockedExecutePrismaQueryRaw =
    executePrismaQueryRaw as jest.MockedFunction<typeof executePrismaQueryRaw>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns only the first five unique lesson plans in the order returned by the database", async () => {
    const baseLessonPlan = {
      ...generateMock(CompletedLessonPlanSchemaWithoutLength),
      keyStage: "ks1",
    };

    const mockRawResults = [
      {
        ragLessonPlanId: "plan-1",
        oakLessonId: 1,
        oakLessonSlug: "slug-1",
        lessonPlan: baseLessonPlan,
        matchedKey: "key",
        matchedValue: "value",
        distance: 0.1,
      },
      {
        ragLessonPlanId: "plan-2",
        oakLessonId: 2,
        oakLessonSlug: "slug-2",
        lessonPlan: { ...baseLessonPlan, keyStage: "ks2" },
        matchedKey: "key",
        matchedValue: "value",
        distance: 0.3,
      },
      {
        ragLessonPlanId: "plan-3",
        oakLessonId: 3,
        oakLessonSlug: "slug-3",
        lessonPlan: { ...baseLessonPlan, keyStage: "ks3" },
        matchedKey: "key",
        matchedValue: "value",
        distance: 0.4,
      },
      {
        ragLessonPlanId: "plan-1",
        oakLessonId: 1,
        oakLessonSlug: "slug-1-duplicate",
        lessonPlan: baseLessonPlan,
        matchedKey: "key",
        matchedValue: "value",
        distance: 0.2,
      },
      {
        ragLessonPlanId: "plan-4",
        oakLessonId: 4,
        oakLessonSlug: "slug-4",
        lessonPlan: { ...baseLessonPlan, keyStage: "ks4" },
        matchedKey: "key",
        matchedValue: "value",
        distance: 0.5,
      },
      {
        ragLessonPlanId: "plan-5",
        oakLessonId: 5,
        oakLessonSlug: "slug-5",
        lessonPlan: { ...baseLessonPlan, keyStage: "ks1" },
        matchedKey: "key",
        matchedValue: "value",
        distance: 0.6,
      },
      {
        ragLessonPlanId: "plan-6",
        oakLessonId: 6,
        oakLessonSlug: "slug-6",
        lessonPlan: { ...baseLessonPlan, keyStage: "ks2" },
        matchedKey: "key",
        matchedValue: "value",
        distance: 0.7,
      },
    ];
    mockedExecutePrismaQueryRaw.mockResolvedValue(mockRawResults);

    const results = await vectorSearch({
      prisma,
      log,
      queryVector: [0.1],
      filters: { keyStageSlugs: ["key-stage-1"], subjectSlugs: ["maths"] },
    });

    expect(results).toHaveLength(5);
    expect(results.map((result) => result.ragLessonPlanId)).toEqual([
      "plan-1",
      "plan-2",
      "plan-3",
      "plan-4",
      "plan-5",
    ]);
    expect(results[0]?.oakLessonSlug).toBe("slug-1");
    expect(results[0]?.lessonPlan.keyStage).toBe("key-stage-1");
  });
});
