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
import { buildQuizFromQuestions } from "../buildQuizObject";
import type { Task } from "../instrumentation";
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
    ailaRagRelevantLessons: AilaRagRelevantLesson[],
    task: Task,
  ): Promise<LatestQuiz> {
    // Run all generators in parallel
    const poolPromises = this.quizGenerators.map((generator) =>
      task.child(generator.name, async (t) => {
        const pools =
          quizType === "/starterQuiz"
            ? await generator.generateMathsStarterQuizCandidates(
                lessonPlan,
                ailaRagRelevantLessons,
              )
            : await generator.generateMathsExitQuizCandidates(
                lessonPlan,
                ailaRagRelevantLessons,
              );

        t.addData({
          poolCount: pools.length,
          questionCount: pools.reduce((sum, p) => sum + p.questions.length, 0),
        });
        return pools;
      }),
    );

    const poolArrays = await Promise.all(poolPromises);
    const questionPools = poolArrays.flat();

    // Rerank the question pools
    const quizRankings = await task.child("reranker", async (t) => {
      const rankings = await this.quizReranker.evaluateQuizArray(
        questionPools,
        lessonPlan,
        quizType,
      );
      t.addData({ rankingCount: rankings.length });
      return rankings;
    });

    // Select final questions
    const selectedQuestions = await task.child("selector", async (t) => {
      const questions = await this.quizSelector.selectQuestions(
        questionPools,
        quizRankings,
        lessonPlan,
        quizType,
      );
      t.addData({ selectedCount: questions.length });
      return questions;
    });

    return buildQuizFromQuestions(selectedQuestions);
  }
}
