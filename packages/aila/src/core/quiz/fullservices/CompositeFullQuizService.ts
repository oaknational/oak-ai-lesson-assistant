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
  public quizReranker: AilaQuizReranker;
  public quizGenerators: AilaQuizGeneratorService[];

  constructor(
    generators: AilaQuizGeneratorService[],
    selector: QuizSelector<BaseType>,
    reranker: AilaQuizReranker,
  ) {
    super();
    this.quizGenerators = generators;
    this.quizSelector = selector;
    this.quizReranker = reranker;
  }
}
