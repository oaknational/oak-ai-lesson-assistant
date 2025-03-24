import { aiLogger } from "@oakai/logger";
import { omit } from "remeda/dist/commonjs/omit";

import { AilaQuizFactory } from "../generators/AilaQuizGeneratorFactory";
import type {
  AilaQuizGeneratorService,
  FullQuizService,
  QuizSelectorFactory,
} from "../interfaces";
import { AilaQuizRerankerFactoryImpl } from "../rerankers/AilaQuizRerankerFactory";
import type { QuizBuilderSettings } from "../schema";
import { QuizSelectorFactoryImpl } from "../selectors/QuizSelectorFactory";
import { CompositeFullQuizService } from "./CompositeFullQuizService";

const log = aiLogger("quiz");

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

    // log.info(
    //   "Building Composite full quiz service with settings:",
    //   omit(settings, "quizRatingSchema" as unknown),
    // );
    return new CompositeFullQuizService(generatorArray, selector, reranker);
  }
}
