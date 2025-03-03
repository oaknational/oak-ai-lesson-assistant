import type { z } from "zod";

import type { BaseType } from "../ChoiceModels";
import type {
  AilaQuizGeneratorService,
  AilaQuizReranker,
  QuizSelector,
} from "../interfaces";
import { BaseFullQuizService } from "./BaseFullQuizService";

export class CompositeFullQuizService extends BaseFullQuizService {
  public quizSelector: QuizSelector<BaseType>;
  public quizReranker: AilaQuizReranker<z.ZodType<BaseType>>;
  public quizGenerators: AilaQuizGeneratorService[];

  constructor(
    generators: AilaQuizGeneratorService[],
    selector: QuizSelector<BaseType>,
    reranker: AilaQuizReranker<z.ZodType<BaseType>>,
  ) {
    super();
    this.quizGenerators = generators;
    this.quizSelector = selector;
    this.quizReranker = reranker;
  }
}
