import type {
  LooseLessonPlan,
  Quiz,
  QuizQuestion,
} from "../../protocol/schema";
import type { AilaQuizGeneratorService } from "../AilaServices";
import type { BaseType } from "./ChoiceModels";
import { SimpleQuizSelector } from "./SimpleQuizSelector";
import type {
  AilaQuizReranker,
  FullQuizService,
  QuizSelector,
} from "./interfaces";
import type { quizPatchType } from "./interfaces";

export abstract class BaseFullQuizService implements FullQuizService {
  public abstract quizSelector: QuizSelector<BaseType>;
  public abstract quizReranker: AilaQuizReranker<BaseType>;
  public abstract quizGenerators: AilaQuizGeneratorService[];

  public async createBestQuiz(
    quizType: quizPatchType,
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestion[]> {
    const quizzes: Quiz[] = [];
    for (const quizGenerator of this.quizGenerators) {
      if (quizType === "/starterQuiz") {
        quizzes.push(
          ...(await quizGenerator.generateMathsStarterQuizPatch(lessonPlan)),
        );
      } else if (quizType === "/exitQuiz") {
        quizzes.push(
          ...(await quizGenerator.generateMathsExitQuizPatch(lessonPlan)),
        );
      }
    }
    // TODO: GCLOMAX - make the typing stricter here.
    // TODO: GCLOMAX - make sure that the rating schema is the same for all rerankers.
    if (!this.quizReranker.ratingSchema) {
      throw new Error("Reranker rating schema is undefined");
    }

    const quizRankings = await this.quizReranker.evaluateQuizArray(
      quizzes,
      lessonPlan,
      this.quizReranker.ratingSchema,
      quizType,
    );

    const bestQuiz = this.quizSelector.selectBestQuiz(quizzes, quizRankings);
    return bestQuiz;
  }
}

export class SimpleFullQuizService extends BaseFullQuizService {
  public quizSelector: QuizSelector<BaseType> = new SimpleQuizSelector();
  public quizReranker: AilaQuizReranker<BaseType> = new ;
  public quizGenerators: AilaQuizGeneratorService[] = [];
}
