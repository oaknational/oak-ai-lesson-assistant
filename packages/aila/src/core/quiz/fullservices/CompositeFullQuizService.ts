import type { BaseSchema, BaseType } from "../ChoiceModels";
import type { AilaQuizGeneratorService } from "../interfaces";
import type { AilaQuizReranker, QuizSelector } from "../interfaces";
import { BaseFullQuizService } from "./BaseFullQuizService";

export class CompositeFullQuizService extends BaseFullQuizService {
  public quizSelector: QuizSelector<BaseType>;
  public quizReranker: AilaQuizReranker<typeof BaseSchema>;
  public quizGenerators: AilaQuizGeneratorService[];

  constructor(
    generators: AilaQuizGeneratorService[],
    selector: QuizSelector<BaseType>,
    reranker: AilaQuizReranker<typeof BaseSchema>,
  ) {
    super();
    this.quizGenerators = generators;
    this.quizSelector = selector;
    this.quizReranker = reranker;
  }
}
