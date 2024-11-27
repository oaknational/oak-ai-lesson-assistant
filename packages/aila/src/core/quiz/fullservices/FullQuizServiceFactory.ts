import type {
  AilaQuizGeneratorService,
  AilaQuizService,
} from "../../AilaServices";
import { AilaQuiz } from "../AilaQuiz";
import { AilaQuizFactory } from "../generators/AilaQuizGeneratorFactory";
import type {
  AilaQuizVariantService,
  QuizSelectorFactory,
} from "../interfaces";
import type { FullQuizService } from "../interfaces";
import type { FullServiceFactory } from "../interfaces";
import { AilaQuizRerankerFactoryImpl } from "../rerankers/AilaQuizRerankerFactory";
import type { QuizBuilderSettings, QuizServiceSettings } from "../schema";
import { QuizSelectorFactoryImpl } from "../selectors/QuizSelectorFactory";
import { SimpleFullQuizService } from "./BaseFullQuizService";
import { BasedOnQuizService } from "./BasedOnQuizService";
import { CompositeFullQuizService } from "./CompositeFullQuizService";
import { DemoFullQuizService } from "./DemoFullQuizService";

export class FullQuizServiceFactory implements FullServiceFactory {
  public create(settings: QuizServiceSettings): FullQuizService {
    switch (settings) {
      case "simple":
        return new SimpleFullQuizService();
      case "demo":
        return new DemoFullQuizService();
      case "basedOn":
        return new BasedOnQuizService();
    }
    throw new Error("Invalid quiz service settings");
  }
}
