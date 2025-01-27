import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  LooseLessonPlan,
  QuizQuestion,
} from "../../../protocol/schema";
import type { AilaQuizGeneratorService } from "../../AilaServices";
import type { BaseSchema, BaseType } from "../ChoiceModels";
import type {
  AilaQuizReranker,
  FullQuizService,
  quizPatchType,
  QuizSelector,
} from "../interfaces";

const log = aiLogger("aila:quiz");

export abstract class BaseFullQuizService implements FullQuizService {
  public abstract quizSelector: QuizSelector<BaseType>;
  public abstract quizReranker: AilaQuizReranker<typeof BaseSchema>;
  public abstract quizGenerators: AilaQuizGeneratorService[];
  // TODO: MG - does having ailaRagRelevantLessons as a default parameter work? It feels a bit hacky.
  public async createBestQuiz(
    quizType: quizPatchType,
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[] = [],
  ): Promise<QuizQuestion[]> {
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
      throw new Error(`Invalid quiz type: ${quizType}`);
    });

    const quizArrays = await Promise.all(quizPromises);
    const quizzes = quizArrays.flat();
    // TODO: GCLOMAX - make the typing stricter here.
    // TODO: GCLOMAX - make sure that the rating schema is the same for all rerankers.
    if (!this.quizReranker.ratingSchema) {
      throw new Error("Reranker rating schema is undefined");
    }
    // TODO: GCLOMAX - This is changed to be cached.
    const quizRankings = await this.quizReranker.evaluateQuizArray(
      quizzes,
      lessonPlan,
      this.quizReranker.ratingSchema,
      quizType,
    );
    // this is hacky, but typescript gets annoyed with the zod and inference stuff.
    if (!quizRankings[0]) {
      log.error(
        `Quiz rankings are undefined. No quiz of quiz type: ${quizType} found for lesson plan: ${lessonPlan.title}`,
      );
      return [];
    }
    const parsedRankings = quizRankings.map((ranking) =>
      this.quizReranker.ratingSchema!.parse(ranking),
    );

    const bestQuiz = this.quizSelector.selectBestQuiz(quizzes, parsedRankings);
    return bestQuiz;
  }
}
