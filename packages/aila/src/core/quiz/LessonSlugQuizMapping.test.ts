import type { PrismaClientWithAccelerate } from "@oakai/db";

import {
  DBLessonQuizLookup,
  InMemoryLessonQuizLookup,
} from "./LessonSlugQuizMapping";
import type { LessonSlugQuizMapping } from "./interfaces";

describe("InMemoryLessonQuizLookup", () => {
  const mockQuizMap: LessonSlugQuizMapping = {
    "lesson-1": {
      starterQuiz: ["q1", "q2"],
      exitQuiz: ["q3", "q4"],
    },
    "lesson-2": {
      starterQuiz: ["q5"],
      exitQuiz: ["q6"],
    },
  };

  const lookup = new InMemoryLessonQuizLookup(mockQuizMap);

  describe("getStarterQuiz", () => {
    it("should return starter quiz questions for valid lesson slug", () => {
      const result = lookup.getStarterQuiz("lesson-1");
      expect(result).toEqual(["q1", "q2"]);
    });

    it("should throw error for invalid lesson slug", () => {
      expect(() => lookup.getStarterQuiz("non-existent")).toThrow(
        "No starter quiz found for lesson slug: non-existent",
      );
    });
  });

  describe("getExitQuiz", () => {
    it("should return exit quiz questions for valid lesson slug", () => {
      const result = lookup.getExitQuiz("lesson-1");
      expect(result).toEqual(["q3", "q4"]);
    });

    it("should throw error for invalid lesson slug", () => {
      expect(() => lookup.getExitQuiz("non-existent")).toThrow(
        "No exit quiz found for lesson slug: non-existent",
      );
    });
  });

  describe("hasStarterQuiz", () => {
    it("should return true when starter quiz exists", () => {
      expect(lookup.hasStarterQuiz("lesson-1")).toBe(true);
    });

    it("should return false when starter quiz doesn't exist", () => {
      expect(lookup.hasStarterQuiz("non-existent")).toBe(false);
    });
  });

  describe("hasExitQuiz", () => {
    it("should return true when exit quiz exists", () => {
      expect(lookup.hasExitQuiz("lesson-1")).toBe(true);
    });

    it("should return false when exit quiz doesn't exist", () => {
      expect(lookup.hasExitQuiz("non-existent")).toBe(false);
    });
  });
});

describe("DBLessonQuizLookup", () => {
  const mockPrisma = {
    // Add mock methods as needed
  } as unknown as PrismaClientWithAccelerate;

  const dbLookup = new DBLessonQuizLookup(mockPrisma);

  describe("unimplemented methods", () => {
    it("getStarterQuiz should throw not implemented error", () => {
      expect(() => dbLookup.getStarterQuiz("any-slug")).toThrow(
        "Not implemented",
      );
    });

    it("getExitQuiz should throw not implemented error", () => {
      expect(() => dbLookup.getExitQuiz("any-slug")).toThrow("Not implemented");
    });

    it("hasStarterQuiz should throw not implemented error", () => {
      expect(() => dbLookup.hasStarterQuiz("any-slug")).toThrow(
        "Not implemented",
      );
    });

    it("hasExitQuiz should throw not implemented error", () => {
      expect(() => dbLookup.hasExitQuiz("any-slug")).toThrow("Not implemented");
    });
  });
});
