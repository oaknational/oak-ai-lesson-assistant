import type { Quiz, QuizQuestion } from "../../protocol/schema";
import type { LooseLessonPlan } from "../../protocol/schema";
import { QuizSchema } from "../../protocol/schema";
import type { BaseQuizGenerator } from "./AilaQuizVariants";
import { CircleTheoremLesson } from "./fixtures/CircleTheoremsExampleOutput";

export const runCommonQuizGeneratorTests = (
  name: string,
  createGenerator: () => BaseQuizGenerator,
) => {
  describe(`${name} Common Tests`, () => {
    let generator: BaseQuizGenerator;

    beforeEach(() => {
      generator = createGenerator();
    });

    describe("Starter Quiz Generation", () => {
      it("should generate a valid starter quiz array", async () => {
        const result =
          await generator.generateMathsStarterQuizPatch(CircleTheoremLesson);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);

        // Each item in the array should be a valid Quiz (array of QuizQuestion)
        result.forEach((quiz) => {
          expect(Array.isArray(quiz)).toBe(true);
          expect(quiz.length).toBeGreaterThan(0);
          expect(QuizSchema.safeParse(quiz).success).toBe(true);
        });
      });
    });

    describe("Exit Quiz Generation", () => {
      it("should generate a valid exit quiz array", async () => {
        const result =
          await generator.generateMathsExitQuizPatch(CircleTheoremLesson);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);

        // Each item in the array should be a valid Quiz
        result.forEach((quiz) => {
          expect(Array.isArray(quiz)).toBe(true);
          expect(quiz.length).toBeGreaterThan(0);
          expect(QuizSchema.safeParse(quiz).success).toBe(true);
        });
      });
    });

    describe("Error Handling", () => {
      it("should handle invalid lesson plans gracefully", async () => {
        const invalidLessonPlan = {} as LooseLessonPlan;

        await expect(
          generator.generateMathsStarterQuizPatch(invalidLessonPlan),
        ).rejects.toBeDefined();

        await expect(
          generator.generateMathsExitQuizPatch(invalidLessonPlan),
        ).rejects.toBeDefined();
      });
    });
  });
};
