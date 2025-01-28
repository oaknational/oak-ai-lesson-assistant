import { aiLogger } from "@oakai/logger";

import type { LooseLessonPlan } from "../../../protocol/schema";
import { QuizSchema } from "../../../protocol/schema";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";

const log = aiLogger("aila");

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
    log.info(JSON.stringify(quiz));
    log.info("QUIZ ABOVE");
    expect(QuizSchema.safeParse(quiz[0]).success).toBe(true);
  });
});
