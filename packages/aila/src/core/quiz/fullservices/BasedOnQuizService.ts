import type { z } from "zod";

import type { BaseSchema, BaseType } from "../ChoiceModels";
import { AilaQuizFactory } from "../generators/AilaQuizGeneratorFactory";
import type { AilaQuizGeneratorService } from "../interfaces";
import type { AilaQuizReranker, QuizSelector } from "../interfaces";
import { AilaQuizRerankerFactoryImpl } from "../rerankers/AilaQuizRerankerFactory";
import { QuizSelectorFactoryImpl } from "../selectors/QuizSelectorFactory";
import { BaseFullQuizService } from "./BaseFullQuizService";

export class BasedOnQuizService extends BaseFullQuizService {
  public quizGenerators: AilaQuizGeneratorService[] = [
    AilaQuizFactory.createQuizGenerator("basedOnRag"),
  ];
  public quizReranker: AilaQuizReranker<z.ZodType<BaseType>> =
    new AilaQuizRerankerFactoryImpl().createAilaQuizReranker("return-first");

  public quizSelector: QuizSelector<BaseType> =
    new QuizSelectorFactoryImpl().createQuizSelector("simple");
}
