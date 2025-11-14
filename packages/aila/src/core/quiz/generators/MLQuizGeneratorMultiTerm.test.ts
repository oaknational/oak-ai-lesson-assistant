import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { MLQuizGeneratorMultiTerm } from "./MLQuizGeneratorMultiTerm";

describe("MLQuizGeneratorMultiTerm", () => {
  let generator: MLQuizGeneratorMultiTerm;

  // Set timeout to 60 seconds for integration tests
  jest.setTimeout(60000);

  beforeEach(() => {
    generator = new MLQuizGeneratorMultiTerm();
  });

  it("should generate multiple search queries (3-6)", async () => {
    const result = await generator.generateSemanticSearchQueries(
      CircleTheoremLesson,
      "/starterQuiz",
    );

    expect(Array.isArray(result.queries)).toBe(true);
    expect(result.queries.length).toBeGreaterThanOrEqual(3);
    expect(result.queries.length).toBeLessThanOrEqual(6);

    result.queries.forEach((query) => {
      expect(typeof query).toBe("string");
      expect(query.length).toBeGreaterThan(0);
    });
  });

  it("should generate separate pools for starter quiz", async () => {
    const result =
      await generator.generateMathsStarterQuizPatch(CircleTheoremLesson);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Each pool should be an array of questions
    result.forEach((pool) => {
      expect(Array.isArray(pool)).toBe(true);
      pool.forEach((question) => {
        expect(question).toHaveProperty("question");
        expect(question).toHaveProperty("answers");
        expect(question).toHaveProperty("distractors");
      });
    });
  });

  it("should generate separate pools for exit quiz", async () => {
    const result =
      await generator.generateMathsExitQuizPatch(CircleTheoremLesson);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Each pool should be an array of questions
    result.forEach((pool) => {
      expect(Array.isArray(pool)).toBe(true);
      pool.forEach((question) => {
        expect(question).toHaveProperty("question");
        expect(question).toHaveProperty("answers");
        expect(question).toHaveProperty("distractors");
      });
    });
  });

  it("should return pools with ~3 questions each", async () => {
    const result =
      await generator.generateMathsStarterQuizPatch(CircleTheoremLesson);

    // Should have multiple pools (3-6 queries)
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.length).toBeLessThanOrEqual(6);

    // Each pool should have approximately 3 questions (allowing for variation)
    result.forEach((pool) => {
      expect(pool.length).toBeGreaterThanOrEqual(1);
      expect(pool.length).toBeLessThanOrEqual(5);
    });
  });
});
