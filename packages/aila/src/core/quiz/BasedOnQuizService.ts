import type { AilaQuizGeneratorService } from "../AilaServices";
import { AilaQuizFactory } from "./AilaQuizGeneratorFactory";
import { AilaQuizRerankerFactoryImpl } from "./AilaQuizRerankerFactory";
import { BaseFullQuizService } from "./BaseFullQuizService";
import type { BaseSchema, BaseType } from "./ChoiceModels";
import { QuizSelectorFactoryImpl } from "./QuizSelectorFactory";
import type { AilaQuizReranker, QuizSelector } from "./interfaces";

export class BasedOnQuizService extends BaseFullQuizService {
  public quizGenerators: AilaQuizGeneratorService[] = [
    AilaQuizFactory.createQuizGenerator("basedOnRag"),
  ];
  public quizReranker: AilaQuizReranker<typeof BaseSchema> =
    new AilaQuizRerankerFactoryImpl().createAilaQuizReranker("schema-reranker");

  public quizSelector: QuizSelector<BaseType> =
    new QuizSelectorFactoryImpl().createQuizSelector("simple");
}
