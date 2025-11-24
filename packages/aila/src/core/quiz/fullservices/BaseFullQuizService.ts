/**
 * Quiz Generation Pipeline Orchestrator
 *
 * Coordinates a three-stage pipeline for generating high-quality quiz questions:
 *
 * 1. **Generation Stage**: Multiple generators run in parallel, each producing
 *    candidate question pools from different sources:
 *    - AILA RAG system (lesson content)
 *    - ML semantic search (single or multi-term with Cohere reranking)
 *    - BasedOn lessons (user-specified source lessons - high signal)
 *
 * 2. **Reranking Stage**: Evaluates and ranks candidate question pools
 *    - AI evaluator: Older approach that uses AI to score each pool's quality
 *    - Return-first: Rates first pool=1, others=0 (simple fallback)
 *    - No-op: Returns empty ratings (used with LLM composer selector)
 *
 * 3. **Selection Stage**: Final questions are selected from the candidate pools
 *    - Simple selector: Picks top-ranked questions
 *    - LLM Quiz Composer (NEW): Uses AI to mix the best questions from each
 *      generator pool, rather than picking a single best generator
 *
 * Each stage is pluggable, allowing different strategies to be composed via
 * the factory pattern (see buildFullQuizService.ts).
 */
import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  LatestQuiz,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import { convertHasuraQuizToV3 } from "../../../protocol/schemas/quiz/conversion/rawQuizIngest";
import type {
  AilaQuizCandidateGenerator,
  AilaQuizReranker,
  FullQuizService,
  QuizSelector,
} from "../interfaces";

const log = aiLogger("aila:quiz");

export class BaseFullQuizService implements FullQuizService {
  public quizSelector: QuizSelector;
  public quizReranker: AilaQuizReranker;
  public quizGenerators: AilaQuizCandidateGenerator[];

  constructor(
    generators: AilaQuizCandidateGenerator[],
    selector: QuizSelector,
    reranker: AilaQuizReranker,
  ) {
    this.quizGenerators = generators;
    this.quizSelector = selector;
    this.quizReranker = reranker;
  }

  public async buildQuiz(
    quizType: QuizPath,
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

    const selectedQuestions = await this.quizSelector.selectQuestions(
      questionPools,
      quizRankings,
      lessonPlan,
      quizType,
    );
    return convertHasuraQuizToV3(selectedQuestions.map((q) => q.source));
  }
}
