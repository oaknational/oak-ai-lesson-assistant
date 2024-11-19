import type {
  AilaQuizGeneratorService,
  AilaQuizService,
} from "../AilaServices";
import { AilaQuiz } from "./AilaQuiz";
import { QuizSelectorFactoryImpl } from "./QuizSelectorFactory";
import type { BodgeFactory, FullQuizService } from "./interfaces";
import type {
  AilaQuizVariantService,
  AilaQuizRerankerFactory,
  QuizSelectorFactory,
  QuizServiceSettings,
} from "./interfaces";
import type { FullServiceFactory } from "./interfaces";

export class SimpleBodgeFactory implements FullServiceFactory {
  //   public quizSelectorFactory: QuizSelectorFactory = new QuizSelectorFactoryImpl();
  //   public quizRerankerFactory: AilaQuizRerankerFactory = new ;
  //   public quizGeneratorService: AilaQuizGeneratorService = ;
  public create(settings: QuizServiceSettings): FullQuizService {
    return new AilaQuiz();
  }
}
