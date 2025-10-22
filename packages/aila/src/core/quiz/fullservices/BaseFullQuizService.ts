import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  LatestQuiz,
  PartialLessonPlan,
  QuizV1Question,
} from "../../../protocol/schema";
import type { BaseType } from "../ChoiceModels";
import { coerceQuizQuestionWithJsonArray } from "../CoerceQuizQuestionWithJson";
import { AilaRagQuizGenerator } from "../generators/AilaRagQuizGenerator";
import { BasedOnRagQuizGenerator } from "../generators/BasedOnRagQuizGenerator";
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
    override: boolean = false,
  ): Promise<LatestQuiz> {
    if (override) {
      return this.createBestQuizOverride(
        quizType,
        lessonPlan,
        ailaRagRelevantLessons,
      );
    }
    return this.defaultCreateBestQuiz(
      quizType,
      lessonPlan,
      ailaRagRelevantLessons,
    );
  }

  private async defaultCreateBestQuiz(
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
  // Creates a best quiz in a hierarchy of quiz types.
  private async createBestQuizOverride(
    quizType: quizPatchType,
    lessonPlan: PartialLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[] = [],
  ): Promise<LatestQuiz> {
    // If basedOnRag Quiz generator present: Generate a quiz, check it isn't empty, then return that.
    // In the absence of a basedOnRag Quiz generator, generate a quiz using the rest of default quiz generators and return a schema.

    const basedOnRagQuizGenerator = this.quizGenerators.find(
      (cls) => cls instanceof BasedOnRagQuizGenerator,
    );
    if (basedOnRagQuizGenerator) {
      // We have based on generator.
      let quizArray: QuizQuestionWithRawJson[][] = [];
      if (quizType === "/starterQuiz") {
        quizArray = await basedOnRagQuizGenerator.generateMathsStarterQuizPatch(
          lessonPlan,
          ailaRagRelevantLessons,
        );
      } else if (quizType === "/exitQuiz") {
        quizArray = await basedOnRagQuizGenerator.generateMathsExitQuizPatch(
          lessonPlan,
          ailaRagRelevantLessons,
        );
      }
      if (quizArray && quizArray[0] && quizArray[0].length > 0) {
        return coerceQuizQuestionWithJsonArray(quizArray[0]);
      }
    }

    // If we don't have a based on rag quiz generator, or it didn't produce a quiz, generate a quiz using the rest of the quiz generators.
    const quizGenerators = this.quizGenerators.filter(
      (cls) =>
        !(cls instanceof BasedOnRagQuizGenerator) ||
        cls instanceof AilaRagQuizGenerator,
    );

    const quizPromises = quizGenerators.map((quizGenerator) => {
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
