import { aiLogger } from "@oakai/logger";

import type { PartialLessonPlan } from "../../../protocol/schema";
import { QuizV1QuestionSchema } from "../../../protocol/schemas/quiz/quizV1";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";

const log = aiLogger("aila");

const shouldSkipTests = process.env.TEST_QUIZZES === "false";

(shouldSkipTests ? describe.skip : describe)("BasedOnRagQuizGenerator", () => {
  let quizGenerator: BasedOnRagQuizGenerator;
  let mockLessonPlan: PartialLessonPlan;

  beforeEach(() => {
    quizGenerator = new BasedOnRagQuizGenerator();
    mockLessonPlan = CircleTheoremLesson;
  });

  it("should generate a valid quiz", async () => {
    const pools =
      await quizGenerator.generateMathsStarterQuizCandidates(mockLessonPlan);
    log.info(JSON.stringify(pools));
    log.info("QUIZ ABOVE");
    expect(pools[0]!.questions[0]).toBeDefined();
    expect(QuizV1QuestionSchema.safeParse(pools[0]!.questions[0]).success).toBe(
      true,
    );
  });
});
