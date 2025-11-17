import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  LatestQuiz,
  PartialLessonPlan,
} from "../../../protocol/schema";
import type { BaseType } from "../ChoiceModels";
import { coerceQuizQuestionWithJsonArray } from "../CoerceQuizQuestionWithJson";
import type {
  AilaQuizCandidateGenerator,
  AilaQuizReranker,
  FullQuizService,
  QuizSelector,
  quizPatchType,
} from "../interfaces";

const log = aiLogger("aila:quiz");

export abstract class BaseFullQuizService implements FullQuizService {
  public abstract quizSelector: QuizSelector<BaseType>;
  public abstract quizReranker: AilaQuizReranker;
  public abstract quizGenerators: AilaQuizCandidateGenerator[];
  // TODO: MG - does having ailaRagRelevantLessons as a default parameter work? It feels a bit hacky.
  public async createBestQuiz(
    quizType: quizPatchType,
    lessonPlan: PartialLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[] = [],
  ): Promise<LatestQuiz> {
    const poolPromises = this.quizGenerators.map((quizGenerator) => {
      if (quizType === "/starterQuiz") {
        return quizGenerator.generateMathsStarterQuizCandidates(
          lessonPlan,
          ailaRagRelevantLessons,
        );
      } else if (quizType === "/exitQuiz") {
        return quizGenerator.generateMathsExitQuizCandidates(
          lessonPlan,
          ailaRagRelevantLessons,
        );
      }
      throw new Error(`Invalid quiz type: ${quizType as string}`);
    });

    const poolArrays = await Promise.all(poolPromises);
    const questionPools = poolArrays.flat();

    const quizRankings = await this.quizReranker.evaluateQuizArray(
      questionPools,
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

    const bestQuiz = this.quizSelector.selectBestQuiz(
      questionPools,
      quizRankings,
    );
    return coerceQuizQuestionWithJsonArray(bestQuiz);
  }
}
