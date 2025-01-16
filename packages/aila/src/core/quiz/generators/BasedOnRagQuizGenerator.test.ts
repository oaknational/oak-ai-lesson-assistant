import type { LooseLessonPlan, QuizQuestion } from "../../../protocol/schema";
import { QuizSchema } from "../../../protocol/schema";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";

describe("BasedOnRagQuizGenerator", () => {
  let quizGenerator: BasedOnRagQuizGenerator;
  let mockLessonPlan: LooseLessonPlan;

  beforeEach(() => {
    quizGenerator = new BasedOnRagQuizGenerator();
    mockLessonPlan = CircleTheoremLesson;
  });

  it("should generate a valid quiz", async () => {
    const quiz =
      await quizGenerator.generateMathsStarterQuizPatch(mockLessonPlan);
    console.log(JSON.stringify(quiz));
    console.log("QUIZ ABOVE");
    expect(QuizSchema.safeParse(quiz[0]).success).toBe(true);
  });

  //TODO: GCLOMAX - We should abstract these out across all quiz generators.

  // it("should generate a question array from plan Id", async () => {
  //   const questionArray: QuizQuestion[] =
  //     await quizGenerator.questionArrayFromPlanId("clna7lofy0og0p4qxju5j6z56");
  //   expect(questionArray).toBeDefined();
  //   expect(QuizSchema.safeParse(questionArray).success).toBe(true);
  //   expect(questionArray.length).toBeGreaterThan(0);
  // });

  // it("should get lesson slug from plan id", async () => {
  //   const lessonSlug = await quizGenerator.getLessonSlugFromPlanId(
  //     "clna7lofy0og0p4qxju5j6z56",
  //   );
  //   expect(lessonSlug).toBeDefined();
  //   expect(lessonSlug).toBe("reading-timetables-6wwkgt");
  // });
});
