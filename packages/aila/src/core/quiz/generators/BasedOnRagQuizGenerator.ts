import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  Quiz,
  QuizQuestion,
} from "../../../protocol/schema";
import type { LooseLessonPlan } from "../../../protocol/schema";
import { BaseQuizGenerator } from "./BaseQuizGenerator";

const log = aiLogger("aila:quiz");

// RAG-based Quiz Generator
export class BasedOnRagQuizGenerator extends BaseQuizGenerator {
  //   This parameter is not used but we keep it for consistency with the other quiz generators
  async generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons?: AilaRagRelevantLesson[],
  ): Promise<Quiz[]> {
    // If quiz is basedOn, give them the default quiz as a starter quiz
    log.info(
      "Generating maths starter quiz for lesson plan id:",
      lessonPlan.basedOn?.id,
    );
    if (!lessonPlan.basedOn?.id) {
      throw new Error("Lesson plan basedOn is undefined");
    }
    return [await this.questionArrayFromPlanId(lessonPlan.basedOn?.id)];
  }

  async generateMathsExitQuizPatch(
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons?: AilaRagRelevantLesson[],
  ): Promise<Quiz[]> {
    // If quiz is basedOn, give them the default quiz as an exit quiz
    log.info(
      "Generating maths exit quiz for lesson plan id:",
      lessonPlan.basedOn?.id,
    );
    if (!lessonPlan.basedOn?.id) {
      throw new Error("Lesson plan basedOn is undefined");
    }
    return [await this.questionArrayFromPlanId(lessonPlan.basedOn?.id)];
  }
}