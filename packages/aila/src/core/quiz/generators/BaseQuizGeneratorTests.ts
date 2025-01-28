import type {
  AilaRagRelevantLesson,
  LooseLessonPlan,
} from "../../../protocol/schema";
import { QuizSchema } from "../../../protocol/schema";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import type { BaseQuizGenerator } from "./BaseQuizGenerator";

export const runCommonQuizGeneratorTests = (
  name: string,
  createGenerator: () => BaseQuizGenerator,
) => {
  describe(`${name} Common Tests`, () => {
    let generator: BaseQuizGenerator;
    let mockRelevantLessons: AilaRagRelevantLesson[];

    beforeEach(() => {
      generator = createGenerator();
      mockRelevantLessons = [
        { lessonPlanId: "clna7k8j400egp4qxrqmjx0qo", title: "test-title-2" },
        { lessonPlanId: "clna7k8kq00fip4qxsjvrmykv", title: "test-title-3" },
        { lessonPlanId: "clna7k8pq00j1p4qxa9euac1c", title: "test-title-4" },
        { lessonPlanId: "clna7k8zr00qfp4qx44fdvikl", title: "test-title-5" },
        { lessonPlanId: "clna7k93700sap4qx741wdrz4", title: "test-title-6" },
        { lessonPlanId: "clna7k98j00vup4qx9nyfjtpm", title: "test-title-7" },
        { lessonPlanId: "clna7k8zr00qfp4qx44fdvikl", title: "test-title-8" },
        { lessonPlanId: "clna7k93700sap4qx741wdrz4", title: "test-title-9" },
        { lessonPlanId: "clna7k98j00vup4qx9nyfjtpm", title: "test-title-10" },
        // {
        //   lessonPlanId: "clna7lofy0og0p4qxju5j6z56",
        //   title: "TEST-LESSON-READING-TIMETABLES",
        // },
      ];
    });

    describe("Starter Quiz Generation", () => {
      it("should generate a valid starter quiz array", async () => {
        const result = await generator.generateMathsStarterQuizPatch(
          CircleTheoremLesson,
          mockRelevantLessons,
        );

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
        const result = await generator.generateMathsExitQuizPatch(
          CircleTheoremLesson,
          mockRelevantLessons,
        );

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

    // [
    //   'DSemIaiDytA0PtrHTo9Zq',
    //   '0ChBXkONXh8IOVS00iTlm',
    //   'LnViNV0cVTEaiunKzumPs',
    //   'R3IrL-ct9sSAhpsz7lgrE',
    //   'AGtKSucW7OTUKiswiHfJ9'
    // ]
    describe("Question Array From Plan Id", () => {
      it("should handle invalid lesson plans gracefully", async () => {
        await expect(
          generator.questionArrayFromPlanId("invalid-plan-id"),
        ).rejects.toBeDefined();
      });
      it("should handle valid lesson plans gracefully", async () => {
        const result = await generator.questionArrayFromPlanId(
          "DSemIaiDytA0PtrHTo9Zq",
        );
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });
};
