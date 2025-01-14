import type { FullQuizService, FullServiceFactory } from "../interfaces";
import type { QuizServiceSettings } from "../schema";
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
