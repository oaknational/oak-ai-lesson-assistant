import { CompletedLessonPlanSchema } from "../aila/src/protocol/schema";
import { mockV3Quiz } from "../aila/src/protocol/schemas/versioning/fixtures/migrationTestData";
import typicalChat from "../api/src/router/testSupport/userPreparation/seedChat/typical.json";

export {
  mockV1Quiz,
  mockV2Quiz,
} from "../aila/src/protocol/schemas/versioning/fixtures/migrationTestData";

/**
 * A realistic complete lesson plan: the lesson seeded for e2e tests, with its
 * legacy quizzes replaced by current ones. Parsed so an invalid fixture fails
 * loudly rather than testing the wrong thing.
 */
export const completedLessonPlanFixture = CompletedLessonPlanSchema.parse({
  ...typicalChat.lessonPlan,
  starterQuiz: mockV3Quiz,
  exitQuiz: mockV3Quiz,
});
