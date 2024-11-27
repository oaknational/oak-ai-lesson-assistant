import type { z } from "zod";

import type { LooseLessonPlan } from "../../../protocol/schema";
import { AilaQuiz } from "../AilaQuiz";
import type { BaseType } from "../ChoiceModels";
import type { BaseSchema } from "../ChoiceModels";
import type {
  AilaQuizFactory,
  AilaQuizReranker,
  AilaQuizRerankerFactory,
} from "../interfaces";
import type { QuizRerankerType } from "../schema";
import { BasedOnRagAilaQuizReranker } from "./AilaQuizReranker";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";
import { ReturnFirstReranker } from "./ReturnFirstReranker";
import { TestSchemaReranker } from "./SchemaReranker";

export class AilaQuizRerankerFactoryImpl implements AilaQuizRerankerFactory {
  public createAilaQuizReranker(
    quizType: QuizRerankerType,
  ): AilaQuizReranker<typeof BaseSchema> {
    switch (quizType) {
      case "schema-reranker":
        return new TestSchemaReranker(testRatingSchema, "/starterQuiz");
      case "return-first":
        // TODO: GCLOMAX - This needs refactoring and is an issue.
        return new ReturnFirstReranker(testRatingSchema, "/starterQuiz");
    }
  }
}

// export class AilaQuizFactoryImpl implements AilaQuizFactory {
//   private containsMath(subject: string | undefined | null): boolean {
//     return subject?.toLowerCase().includes("math") ?? false;
//   }

//   public quizStrategySelector(
//     lessonPlan: LooseLessonPlan,
//   ): quizRecommenderType {
//     // Determine the quiz strategy based on the lesson plan
//     const isMathsLesson = this.containsMath(lessonPlan.subject);
//     return isMathsLesson ? "maths" : "default";
//   }

//   public createQuizRecommender(lessonPlan: LooseLessonPlan): AilaQuizService {
//     // Determine the quiz strategy based on the lesson plan
//     const quizType = this.quizStrategySelector(lessonPlan);

//     // Create the appropriate quiz recommender
//     switch (quizType) {
//       case "maths":
//         return new AilaQuiz();
//       case "default":
//         return new AilaQuiz();
//     }
//   }
// }
