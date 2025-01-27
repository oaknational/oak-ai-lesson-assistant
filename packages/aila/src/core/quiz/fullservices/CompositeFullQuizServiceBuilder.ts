import type { AilaQuizGeneratorService } from "../../AilaServices";
import { AilaQuizFactory } from "../generators/AilaQuizGeneratorFactory";
import type { FullQuizService, QuizSelectorFactory } from "../interfaces";
import { AilaQuizRerankerFactoryImpl } from "../rerankers/AilaQuizRerankerFactory";
import type { QuizBuilderSettings } from "../schema";
import { QuizSelectorFactoryImpl } from "../selectors/QuizSelectorFactory";
import { CompositeFullQuizService } from "./CompositeFullQuizService";

export class CompositeFullQuizServiceBuilder {
  private readonly generatorFactory: AilaQuizFactory = new AilaQuizFactory();
  private readonly selectorFactory: QuizSelectorFactory =
    new QuizSelectorFactoryImpl();
  private readonly rerankerFactory: AilaQuizRerankerFactoryImpl =
    new AilaQuizRerankerFactoryImpl();
  public build(settings: QuizBuilderSettings): FullQuizService {
    const generatorArray: AilaQuizGeneratorService[] = [];

    const selector = this.selectorFactory.createQuizSelector(
      settings.quizSelector,
    );

    const reranker = this.rerankerFactory.createAilaQuizReranker(
      settings.quizReranker,
    );

    for (const generator of settings.quizGenerators) {
      generatorArray.push(AilaQuizFactory.createQuizGenerator(generator));
    }

    return new CompositeFullQuizService(generatorArray, selector, reranker);
  }
}
