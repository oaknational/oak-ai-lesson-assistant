import type {
  AilaQuizGeneratorService,
  AilaQuizService,
} from "../AilaServices";
import { AilaQuiz } from "./AilaQuiz";
import { SimpleFullQuizService } from "./BaseFullQuizService";
import { BasedOnQuizService } from "./BasedOnQuizService";
import { DemoFullQuizService } from "./DemoFullQuizService";
import { QuizSelectorFactoryImpl } from "./QuizSelectorFactory";
import type { FullQuizService } from "./interfaces";
import type {
  AilaQuizVariantService,
  AilaQuizRerankerFactory,
  QuizSelectorFactory,
} from "./interfaces";
import type { FullServiceFactory } from "./interfaces";
import type { QuizServiceSettings } from "./schema";

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
