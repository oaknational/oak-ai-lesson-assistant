import type { AilaQuizGeneratorService } from "../AilaServices";
import { AilaQuizFactory } from "./AilaQuizGeneratorFactory";
import { BaseFullQuizService } from "./BaseFullQuizService";
import type { BaseSchema, BaseType } from "./ChoiceModels";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";
import { TestSchemaReranker } from "./SchemaReranker";
import { SimpleQuizSelector } from "./SimpleQuizSelector";
import type { AilaQuizReranker, QuizSelector } from "./interfaces";

export class BasedOnQuizService extends BaseFullQuizService {
  public quizGenerators: AilaQuizGeneratorService[] = [
    AilaQuizFactory.createQuizGenerator("basedOnRag"),
  ];
  public quizReranker: AilaQuizReranker<typeof BaseSchema> =
    new TestSchemaReranker(testRatingSchema, "/starterQuiz");

  public quizSelector: QuizSelector<BaseType> =
    new SimpleQuizSelector<BaseType>();
}
