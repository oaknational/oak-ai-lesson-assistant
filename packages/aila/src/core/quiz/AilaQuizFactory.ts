import type { LooseLessonPlan } from "../../protocol/schema";
import type { AilaQuizService } from "../AilaServices";
import { AilaQuiz } from "./AilaQuiz";
import type { AilaQuizFactory } from "./interfaces";
import type { QuizRecommenderType } from "./schema";

export class AilaQuizFactoryImpl implements AilaQuizFactory {
  private containsMath(subject: string | undefined | null): boolean {
    return subject?.toLowerCase().includes("math") ?? false;
  }

  public quizStrategySelector(
    lessonPlan: LooseLessonPlan,
  ): QuizRecommenderType {
    // Determine the quiz strategy based on the lesson plan
    const isMathsLesson = this.containsMath(lessonPlan.subject);
    return isMathsLesson ? "maths" : "default";
  }

  public createQuizRecommender(lessonPlan: LooseLessonPlan): AilaQuizService {
    // Determine the quiz strategy based on the lesson plan
    const quizType = this.quizStrategySelector(lessonPlan);

    // Create the appropriate quiz recommender
    switch (quizType) {
      case "maths":
        return new AilaQuiz();
      case "default":
        return new AilaQuiz();
    }
  }
}