import type {
  AilaQuizGeneratorService,
  AilaQuizService,
} from "../AilaServices";
import { AilaQuiz } from "./AilaQuiz";
import { SimpleFullQuizService } from "./BaseFullQuizService";
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
    if (settings === "simple") {
      return new SimpleFullQuizService();
    }
    if (settings === "demo") {
      return new DemoFullQuizService();
    }
    throw new Error("Invalid quiz service settings");
  }
}
