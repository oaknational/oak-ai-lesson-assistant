import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";
import type { z } from "zod";

import type {
  AilaRagRelevantLesson,
  LooseLessonPlan,
  Quiz,
  QuizQuestion,
} from "../../../protocol/schema";
import type { BaseType } from "../ChoiceModels";
import { AilaRagQuizGenerator } from "../generators/AilaRagQuizGenerator";
import { BasedOnRagQuizGenerator } from "../generators/BasedOnRagQuizGenerator";
import type {
  AilaQuizGeneratorService,
  AilaQuizReranker,
  FullQuizService,
  QuizSelector,
  quizPatchType,
} from "../interfaces";

const log = aiLogger("aila:quiz");

export abstract class BaseFullQuizService implements FullQuizService {
  public abstract quizSelector: QuizSelector<BaseType>;
  public abstract quizReranker: AilaQuizReranker<z.ZodType<BaseType>>;
  public abstract quizGenerators: AilaQuizGeneratorService[];
  // TODO: MG - does having ailaRagRelevantLessons as a default parameter work? It feels a bit hacky.
  public async createBestQuiz(
    quizType: quizPatchType,
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[] = [],
    override: boolean = false,
  ): Promise<QuizQuestion[]> {
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
      throw new Error(`Invalid quiz type: ${quizType as string}`);
    });

    const quizArrays = await Promise.all(quizPromises);
    const quizzes = quizArrays.flat();
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
  // Creates a best quiz in a hierarchy of quiz types.
  private async createBestQuizOverride(
    quizType: quizPatchType,
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[] = [],
  ): Promise<QuizQuestion[]> {
    // If basedOnRag Quiz generator present: Generate a quiz, check it isnt empty, then return that.
    // In the absence of a basedOnRag Quiz generator, generate a quiz using the rest of default quiz generators and return a schema.

    const basedOnRagQuizGenerator = this.quizGenerators.find(
      (cls) => cls instanceof BasedOnRagQuizGenerator,
    );
    if (basedOnRagQuizGenerator) {
      // We have based on generator.
      let quizArray: Quiz[] = [];
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
        return quizArray[0];
      }
    }

    // If we dont have a based on rag quiz generator, or it didnt produce a quiz, generate a quiz using the rest of the quiz generators.
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
    invariant(
      this.quizReranker.ratingSchema,
      "Reranker rating schema is undefined",
    );
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
    const ratingSchema = this.quizReranker.ratingSchema;
    const parsedRankings = quizRankings.map((ranking) =>
      ratingSchema.parse(ranking),
    );

    const bestQuiz = this.quizSelector.selectBestQuiz(quizzes, parsedRankings);
    return bestQuiz;
  }
}
