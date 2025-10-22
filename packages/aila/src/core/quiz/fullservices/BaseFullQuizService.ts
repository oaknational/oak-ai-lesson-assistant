import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  LatestQuiz,
  PartialLessonPlan,
  QuizV1Question,
} from "../../../protocol/schema";
import type { BaseType } from "../ChoiceModels";
import { coerceQuizQuestionWithJsonArray } from "../CoerceQuizQuestionWithJson";
import type {
  AilaQuizGeneratorService,
  AilaQuizReranker,
  FullQuizService,
  QuizQuestionWithRawJson,
  QuizSelector,
  quizPatchType,
} from "../interfaces";

const log = aiLogger("aila:quiz");

export abstract class BaseFullQuizService implements FullQuizService {
  public abstract quizSelector: QuizSelector<BaseType>;
  public abstract quizReranker: AilaQuizReranker;
  public abstract quizGenerators: AilaQuizGeneratorService[];
  // TODO: MG - does having ailaRagRelevantLessons as a default parameter work? It feels a bit hacky.
  public async createBestQuiz(
    quizType: quizPatchType,
    lessonPlan: PartialLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[] = [],
  ): Promise<LatestQuiz> {
    const quizPromises = this.quizGenerators.map((quizGenerator) => {
      if (quizType === "/starterQuiz") {
        return quizGenerator.generateMathsStarterQuizPatch(
          lessonPlan,
          ailaRagRelevantLessons,
        );
      } else if (quizType === "/exitQuiz") {
        return quizGenerator.generateMathsExitQuizPatch(
          lessonPlan,
          ailaRagRelevantLessons,
        );
      }
      throw new Error(`Invalid quiz type: ${quizType as string}`);
    });

    const quizArrays = await Promise.all(quizPromises);
    const quizzes = quizArrays.flat();

    const quizRankings = await this.quizReranker.evaluateQuizArray(
      quizzes,
      lessonPlan,
      quizType,
    );

    if (!quizRankings[0]) {
      log.error(
        `Quiz rankings are undefined. No quiz of quiz type: ${quizType} found for lesson plan: ${lessonPlan.title}`,
      );
      return {
        version: "v3",
        questions: [],
        imageMetadata: [],
      };
    }

    const bestQuiz = this.quizSelector.selectBestQuiz(quizzes, quizRankings);
    return coerceQuizQuestionWithJsonArray(bestQuiz);
  }
}
