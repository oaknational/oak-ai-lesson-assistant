import type { PrismaClientWithAccelerate } from "@oakai/db";

import { RagLogger } from "../types";
import { vectorSearch } from "./search";

// Mocked Prisma client
const mockPrisma = {
  $queryRaw: jest.fn(),
} as unknown as PrismaClientWithAccelerate;

// Mock logger
const mockLog: RagLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

describe("vectorSearch", () => {
  const mockQueryVector = [0.1, 0.2, 0.3];
  const mockFilters = {
    keyStageSlugs: ["ks1", "ks2"],
    subjectSlugs: ["math", "science"],
  };

  const mockResults = [
    {
      rag_lesson_plan_id: "plan1",
      lesson_plan: {
        title: "Lesson Plan 1",
        subject: "Math",
      },
      key: "key1",
      value_text: "value1",
      distance: 0.5,
    },
    {
      rag_lesson_plan_id: "plan2",
      lesson_plan: {
        title: "Lesson Plan 2",
        subject: "Science",
      },
      key: "key2",
      value_text: "value2",
      distance: 0.8,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws an error if no key stages are provided", async () => {
    await expect(
      vectorSearch({
        prisma: mockPrisma,
        log: mockLog,
        queryVector: mockQueryVector,
        filters: {
          keyStageSlugs: [],
          subjectSlugs: mockFilters.subjectSlugs,
        },
      }),
    ).rejects.toThrow("No key stages provided");
  });

  it("throws an error if no subjects are provided", async () => {
    await expect(
      vectorSearch({
        prisma: mockPrisma,
        log: mockLog,
        queryVector: mockQueryVector,
        filters: {
          keyStageSlugs: mockFilters.keyStageSlugs,
          subjectSlugs: [],
        },
      }),
    ).rejects.toThrow("No subjects provided");
  });

  it("fetches and returns unique lesson plans", async () => {
    (mockPrisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResults);

    const result = await vectorSearch({
      prisma: mockPrisma,
      log: mockLog,
      queryVector: mockQueryVector,
      filters: mockFilters,
    });

    expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
    );

    expect(mockLog.info).toHaveBeenCalledWith(
      expect.stringContaining("Lesson Plan 1,\nLesson Plan 2"),
    );

    expect(result).toEqual([
      {
        rag_lesson_plan_id: "plan1",
        lesson_plan: {
          title: "Lesson Plan 1",
          subject: "Math",
        },
        key: "key1",
        value_text: "value1",
        distance: 0.5,
      },
      {
        rag_lesson_plan_id: "plan2",
        lesson_plan: {
          title: "Lesson Plan 2",
          subject: "Science",
        },
        key: "key2",
        value_text: "value2",
        distance: 0.8,
      },
    ]);
  });

  it("logs the processing time and unique lesson plans count", async () => {
    (mockPrisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResults);

    await vectorSearch({
      prisma: mockPrisma,
      log: mockLog,
      queryVector: mockQueryVector,
      filters: mockFilters,
    });

    expect(mockLog.info).toHaveBeenCalledWith(
      expect.stringContaining("Fetched 2 lesson plans"),
    );
    expect(mockLog.info).toHaveBeenCalledWith(
      expect.stringContaining("Unique lesson plans: 2"),
    );
  });
});
