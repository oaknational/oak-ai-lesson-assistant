import type { PrismaClientWithAccelerate } from "@oakai/db";

import {
  DBLessonQuizLookup,
  InMemoryLessonQuizLookup,
} from "./LessonSlugQuizMapping";
import type { LessonSlugQuizMapping } from "./interfaces";

// describe("InMemoryLessonQuizLookup", () => {
//   const mockQuizMap: LessonSlugQuizMapping = {
//     "lesson-1": {
//       starterQuiz: ["q1", "q2"],
//       exitQuiz: ["q3", "q4"],
//     },
//     "lesson-2": {
//       starterQuiz: ["q5"],
//       exitQuiz: ["q6"],
//     },
//   };

//   const lookup = new InMemoryLessonQuizLookup(mockQuizMap);

//   describe("getStarterQuiz", () => {
//     it("should return starter quiz questions for valid lesson slug", () => {
//       const result = lookup.getStarterQuiz("lesson-1");
//       expect(result).toEqual(["q1", "q2"]);
//     });

//     it("should throw error for invalid lesson slug", () => {
//       expect(() => {
//         lookup.getStarterQuiz("non-existent");
//       }).toThrow("No starter quiz found for lesson slug: non-existent");
//     });
//   });

//   describe("getExitQuiz", () => {
//     it("should return exit quiz questions for valid lesson slug", () => {
//       const result = lookup.getExitQuiz("lesson-1");
//       expect(result).toEqual(["q3", "q4"]);
//     });

//     it("should throw error for invalid lesson slug", () => {
//       expect(() => lookup.getExitQuiz("non-existent")).toThrow(
//         "No exit quiz found for lesson slug: non-existent",
//       );
//     });
//   });

//   describe("hasStarterQuiz", () => {
//     it("should return true when starter quiz exists", () => {
//       expect(lookup.hasStarterQuiz("lesson-1")).toBe(true);
//     });

//     it("should return false when starter quiz doesn't exist", () => {
//       expect(lookup.hasStarterQuiz("non-existent")).toBe(false);
//     });
//   });

//   describe("hasExitQuiz", () => {
//     it("should return true when exit quiz exists", () => {
//       expect(lookup.hasExitQuiz("lesson-1")).toBe(true);
//     });

//     it("should return false when exit quiz doesn't exist", () => {
//       expect(lookup.hasExitQuiz("non-existent")).toBe(false);
//     });
//   });
// });

describe("DBLessonQuizLookup", () => {
  let dbLookup: DBLessonQuizLookup;

  beforeEach(() => {
    dbLookup = new DBLessonQuizLookup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("quiz methods", () => {
    const mockSearchResponse = {
      hits: {
        hits: [
          {
            _source: {
              text: {
                starterQuiz: ["q1", "q2"],
                exitQuiz: ["q3", "q4"],
              },
            },
          },
        ],
      },
    };

    beforeEach(() => {
      // @ts-ignore - Mock the Elasticsearch client search method
      dbLookup.client = {
        search: jest.fn().mockResolvedValue(mockSearchResponse),
      };
    });

    describe("getStarterQuiz", () => {
      it("should return starter quiz questions for valid lesson slug", async () => {
        const result = await dbLookup.getStarterQuiz("test-lesson");
        expect(result).toEqual(["q1", "q2"]);
        // @ts-ignore
        expect(dbLookup.client.search).toHaveBeenCalledWith({
          index: "lesson-slug-lookup",
          query: {
            bool: {
              must: [
                { term: { "metadata.lessonSlug.keyword": "test-lesson" } },
              ],
            },
          },
        });
      });

      it("should throw error when no quiz found", async () => {
        // @ts-ignore
        dbLookup.client.search.mockResolvedValueOnce({ hits: { hits: [] } });
        await expect(dbLookup.getStarterQuiz("non-existent")).rejects.toThrow(
          "No /starterQuiz found for lesson slug: non-existent",
        );
      });

      it("should throw error when quiz data is invalid", async () => {
        // @ts-ignore
        dbLookup.client.search.mockResolvedValueOnce({
          hits: {
            hits: [{ _source: { text: { starterQuiz: null } } }],
          },
        });
        await expect(dbLookup.getStarterQuiz("test-lesson")).rejects.toThrow(
          "Invalid /starterQuiz data for lesson slug: test-lesson",
        );
      });
    });

    describe("getExitQuiz", () => {
      it("should return exit quiz questions for valid lesson slug", async () => {
        const result = await dbLookup.getExitQuiz("test-lesson");
        expect(result).toEqual(["q3", "q4"]);
        // @ts-ignore
        expect(dbLookup.client.search).toHaveBeenCalledWith({
          index: "lesson-slug-lookup",
          query: {
            bool: {
              must: [
                { term: { "metadata.lessonSlug.keyword": "test-lesson" } },
              ],
            },
          },
        });
      });

      it("should throw error when no quiz found", async () => {
        // @ts-ignore
        dbLookup.client.search.mockResolvedValueOnce({ hits: { hits: [] } });
        await expect(dbLookup.getExitQuiz("non-existent")).rejects.toThrow(
          "No /exitQuiz found for lesson slug: non-existent",
        );
      });

      it("should throw error when quiz data is invalid", async () => {
        // @ts-ignore
        dbLookup.client.search.mockResolvedValueOnce({
          hits: {
            hits: [{ _source: { text: { exitQuiz: null } } }],
          },
        });
        await expect(dbLookup.getExitQuiz("test-lesson")).rejects.toThrow(
          "Invalid /exitQuiz data for lesson slug: test-lesson",
        );
      });
    });

    describe("hasStarterQuiz", () => {
      it("should return true when starter quiz exists", async () => {
        const result = await dbLookup.hasStarterQuiz("test-lesson");
        expect(result).toBe(true);
      });

      it("should return false when starter quiz doesn't exist", async () => {
        // @ts-ignore
        dbLookup.client.search.mockResolvedValueOnce({ hits: { hits: [] } });
        const result = await dbLookup.hasStarterQuiz("non-existent");
        expect(result).toBe(false);
      });
    });

    describe("hasExitQuiz", () => {
      it("should return true when exit quiz exists", async () => {
        const result = await dbLookup.hasExitQuiz("test-lesson");
        expect(result).toBe(true);
      });

      it("should return false when exit quiz doesn't exist", async () => {
        // @ts-ignore
        dbLookup.client.search.mockResolvedValueOnce({ hits: { hits: [] } });
        const result = await dbLookup.hasExitQuiz("non-existent");
        expect(result).toBe(false);
      });
    });
  });
});

describe("DBLessonQuizLookup integrations tests", () => {
  it("Should pass integration test for starter quiz", async () => {
    const dbLookup = new DBLessonQuizLookup();
    const result = await dbLookup.getStarterQuiz(
      "sketching-quadratic-graphs-part-2-61h62d",
    );
    expect(result).toEqual([
      "QUES-EYPJ1-67826",
      "QUES-KBWC1-67827",
      "QUES-SLVS1-67828",
      "QUES-MCWI1-67829",
      "QUES-HJPP1-67830",
    ]);
  });
  it("Should pass integration test for exit quiz", async () => {
    const dbLookup = new DBLessonQuizLookup();
    const result = await dbLookup.getExitQuiz(
      "sketching-quadratic-graphs-part-2-61h62d",
    );
    expect(result).toEqual([
      "QUES-FTIZ1-76446",
      "QUES-ITJT1-76447",
      "QUES-YYMU1-76448",
      "QUES-TTEF1-76449",
      "QUES-FRFV1-76452",
    ]);
  });
});
