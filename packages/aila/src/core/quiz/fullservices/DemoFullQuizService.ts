import type { LooseLessonPlan, QuizQuestion } from "../../../protocol/schema";
import type { AilaQuizGeneratorService } from "../../AilaServices";
import type { BaseType } from "../ChoiceModels";
import type { BaseSchema } from "../ChoiceModels";
import { cachedQuiz } from "../fixtures/fixtures_for_matt";
import { MLQuizGenerator } from "../generators/MLQuizGenerator";
import type { QuizSelector } from "../interfaces";
import type { AilaQuizReranker } from "../interfaces";
import type { quizPatchType } from "../interfaces";
import { testRatingSchema } from "../rerankers/RerankerStructuredOutputSchema";
import { TestSchemaReranker } from "../rerankers/SchemaReranker";
import { SimpleQuizSelector } from "../selectors/SimpleQuizSelector";
import { BaseFullQuizService } from "./BaseFullQuizService";

export class DemoFullQuizService extends BaseFullQuizService {
  public quizSelector: QuizSelector<BaseType> =
    new SimpleQuizSelector<BaseType>();
  public quizReranker: AilaQuizReranker<typeof BaseSchema> =
    new TestSchemaReranker(testRatingSchema, "/starterQuiz");
  public quizGenerators: AilaQuizGeneratorService[] = [new MLQuizGenerator()];

  public override async createBestQuiz(
    quizType: quizPatchType,
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestion[]> {
    // For demo purposes, always return the cached quiz
    return cachedQuiz;
  }
}
