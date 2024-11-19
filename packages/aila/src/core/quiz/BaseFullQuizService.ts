import type {
  LooseLessonPlan,
  Quiz,
  QuizQuestion,
} from "../../protocol/schema";
import type { AilaQuizGeneratorService } from "../AilaServices";
import type { BaseType } from "./ChoiceModels";
import type {
  AilaQuizReranker,
  FullQuizService,
  QuizSelector,
} from "./interfaces";
import type { quizPatchType } from "./interfaces";

export abstract class BaseFullQuizService implements FullQuizService {
  public quizSelector: QuizSelector<BaseType>;
  public quizRerankers: AilaQuizReranker<BaseType>[];
  public quizGenerators: AilaQuizGeneratorService[];
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
    const quizRankings = [];
    for (const reranker of this.quizRerankers) {
      if (reranker.ratingSchema) {
        quizRankings.push(
          await reranker.evaluateQuizArray(
            quizzes,
            lessonPlan,
            reranker.ratingSchema,
            quizType,
          ),
        );
      }
    }

    const bestQuiz = this.quizSelector.selectBestQuiz(quizRankings);
    return bestQuiz;
  }
}

export class SimpleFullQuizService extends BaseFullQuizService {
  public createBestQuiz(): QuizQuestion[] {
    return [];
  }
}
