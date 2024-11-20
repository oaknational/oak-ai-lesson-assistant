import type {
  AilaQuizGeneratorService,
  AilaQuizService,
} from "../AilaServices";
import { AilaQuiz } from "./AilaQuiz";
import { SimpleFullQuizService } from "./BaseFullQuizService";
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
  //   public quizSelectorFactory: QuizSelectorFactory = new QuizSelectorFactoryImpl();
  //   public quizRerankerFactory: AilaQuizRerankerFactory = new ;
  //   public quizGeneratorService: AilaQuizGeneratorService = ;
  public create(settings: QuizServiceSettings): FullQuizService {
    if (settings === "simple") {
      return new SimpleFullQuizService();
    }
    throw new Error("Invalid quiz service settings");
  }
}
