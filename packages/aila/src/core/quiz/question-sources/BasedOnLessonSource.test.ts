import { aiLogger } from "@oakai/logger";

import type { PartialLessonPlan } from "../../../protocol/schema";
import { QuizV3QuestionSchema } from "../../../protocol/schemas/quiz/quizV3";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { createMockTask } from "../instrumentation";
import { BasedOnLessonSource } from "./BasedOnLessonSource";

const log = aiLogger("aila");

const shouldSkipTests = process.env.TEST_QUIZZES === "false";

(shouldSkipTests ? describe.skip : describe)("BasedOnLessonSource", () => {
  let source: BasedOnLessonSource;
  let mockLessonPlan: PartialLessonPlan;

  beforeEach(() => {
    source = new BasedOnLessonSource();
    mockLessonPlan = CircleTheoremLesson;
  });

  it("should get valid quiz candidates", async () => {
    const task = createMockTask();
    const pools = await source.getStarterQuizCandidates(
      mockLessonPlan,
      [],
      task,
    );
    log.info(JSON.stringify(pools));
    log.info("QUIZ ABOVE");
    expect(pools[0]!.questions[0]).toBeDefined();
    expect(
      QuizV3QuestionSchema.safeParse(pools[0]!.questions[0]!.question).success,
    ).toBe(true);
  });
});
