import type {
  AilaQuizGeneratorService,
  AilaQuizService,
} from "../../AilaServices";
import { AilaQuiz } from "../AilaQuiz";
import type { AilaQuizVariantService } from "../interfaces";
import type { FullQuizService } from "../interfaces";
import type { FullServiceFactory } from "../interfaces";
import type { QuizServiceSettings } from "../schema";
import { QuizSelectorFactoryImpl } from "../selectors/QuizSelectorFactory";
import { SimpleFullQuizService } from "./BaseFullQuizService";
import { BasedOnQuizService } from "./BasedOnQuizService";
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
