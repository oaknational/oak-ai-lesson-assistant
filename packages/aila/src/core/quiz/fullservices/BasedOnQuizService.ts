import { BasedOnRagQuizGenerator } from "../generators/BasedOnRagQuizGenerator";
import { ReturnFirstReranker } from "../rerankers/ReturnFirstReranker";
import { SimpleQuizSelector } from "../selectors/SimpleQuizSelector";
import { BaseFullQuizService } from "./BaseFullQuizService";

export class BasedOnQuizService extends BaseFullQuizService {
  constructor() {
    const generators = [new BasedOnRagQuizGenerator()];
    const reranker = new ReturnFirstReranker();
    const selector = new SimpleQuizSelector();

    super(generators, selector, reranker);
  }
}
