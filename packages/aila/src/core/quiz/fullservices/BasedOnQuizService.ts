import type { AilaQuizGeneratorService } from "../../AilaServices";
import type { BaseSchema, BaseType } from "../ChoiceModels";
import { AilaQuizFactory } from "../generators/AilaQuizGeneratorFactory";
import type { AilaQuizReranker, QuizSelector } from "../interfaces";
import { AilaQuizRerankerFactoryImpl } from "../rerankers/AilaQuizRerankerFactory";
import { QuizSelectorFactoryImpl } from "../selectors/QuizSelectorFactory";
import { BaseFullQuizService } from "./BaseFullQuizService";

export class BasedOnQuizService extends BaseFullQuizService {
  public quizGenerators: AilaQuizGeneratorService[] = [
    AilaQuizFactory.createQuizGenerator("basedOnRag"),
  ];
  public quizReranker: AilaQuizReranker<typeof BaseSchema> =
    new AilaQuizRerankerFactoryImpl().createAilaQuizReranker("return-first");

  public quizSelector: QuizSelector<BaseType> =
    new QuizSelectorFactoryImpl().createQuizSelector("simple");
}