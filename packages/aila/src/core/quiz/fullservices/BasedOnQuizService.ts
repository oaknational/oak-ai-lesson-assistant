import { AilaQuizFactory } from "../generators/AilaQuizGeneratorFactory";
import { ReturnFirstReranker } from "../rerankers/ReturnFirstReranker";
import { SimpleQuizSelector } from "../selectors/SimpleQuizSelector";
import { BaseFullQuizService } from "./BaseFullQuizService";

export class BasedOnQuizService extends BaseFullQuizService {
  constructor() {
    const generators = [AilaQuizFactory.createQuizGenerator("basedOnRag")];
    const selector = new SimpleQuizSelector();
    const reranker = new ReturnFirstReranker();

    super(generators, selector, reranker);
  }
}
