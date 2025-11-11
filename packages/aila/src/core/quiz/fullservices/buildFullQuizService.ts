/**
 * Quiz Generation Pipeline Factory
 *
 * This factory builds a complete quiz generation service by composing three configurable parts:
 *
 * 1. **Generators** (1 or more): Generate candidate quiz questions from various sources
 *    - `rag`: Questions from AILA RAG-retrieved lesson content
 *    - `ml`: Semantic search of questions with Cohere reranking (older single-term approach)
 *    - `ml-multi-term`: (NEW) Multiple semantic searches based on multiple search terms, then
 *      Cohere reranking - this is the main ML approach we're now using
 *    - `basedOnRag`: Retrieves quiz from the lesson the user specified to base their lesson on
 *      (very high signal when populated)
 *
 * 2. **Reranker** (1): Evaluates and ranks all candidate questions
 *    - `ai-evaluator`: Uses AI to score each pool of questions (older approach)
 *    - `return-first`: Rates the first pool highest, all others as 0
 *    - `no-op`: Returns empty ratings array (for use with LLM composer selector)
 *
 * 3. **Selector** (1): Chooses final questions from ranked candidates
 *    - `simple`: Selects top-ranked questions to meet quiz requirements
 *    - `llm-quiz-composer`: (NEW) Uses AI to pick the best questions from each generator pool,
 *      mixing results rather than picking a single best generator
 *
 * Current recommended pipeline: basedOn + rag + ml-multi-term generators → return-first reranker
 * → llm-quiz-composer selector
 *
 * Pipeline flow: Generators → Reranker → Selector → Final Quiz
 */
import { aiLogger } from "@oakai/logger";

import { AilaRagQuizGenerator } from "../generators/AilaRagQuizGenerator";
import { BasedOnRagQuizGenerator } from "../generators/BasedOnRagQuizGenerator";
import { MLQuizGenerator } from "../generators/MLQuizGenerator";
import type {
  AilaQuizCandidateGenerator,
  AilaQuizReranker,
  FullQuizService,
  QuizSelector,
} from "../interfaces";
import { AiEvaluatorQuizReranker } from "../rerankers/AiEvaluatorQuizReranker";
import { NoOpReranker } from "../rerankers/NoOpReranker";
import { ReturnFirstReranker } from "../rerankers/ReturnFirstReranker";
import type {
  QuizBuilderSettings,
  QuizGeneratorType,
  QuizRerankerType,
  QuizSelectorType,
} from "../schema";
import { LLMQuizComposer } from "../selectors/LLMQuizComposer";
import { SimpleQuizSelector } from "../selectors/SimpleQuizSelector";
import { BaseFullQuizService } from "./BaseFullQuizService";

const log = aiLogger("quiz");

function createGenerator(type: QuizGeneratorType): AilaQuizCandidateGenerator {
  switch (type) {
    case "rag":
      return new AilaRagQuizGenerator();
    case "ml":
      return new MLQuizGenerator();
    case "basedOnRag":
      return new BasedOnRagQuizGenerator();
  }
}

function createReranker(type: QuizRerankerType): AilaQuizReranker {
  switch (type) {
    case "ai-evaluator":
      return new AiEvaluatorQuizReranker();
    case "return-first":
      return new ReturnFirstReranker();
    case "no-op":
      return new NoOpReranker();
  }
}

function createSelector(type: QuizSelectorType): QuizSelector {
  switch (type) {
    case "simple":
      return new SimpleQuizSelector();
    case "llm-quiz-composer":
      return new LLMQuizComposer();
  }
}

export function buildFullQuizService(
  settings: QuizBuilderSettings,
): FullQuizService {
  const generatorArray: AilaQuizCandidateGenerator[] = [];

  const selector = createSelector(settings.quizSelector);
  const reranker = createReranker(settings.quizReranker);

  for (const generatorType of settings.quizGenerators) {
    generatorArray.push(createGenerator(generatorType));
  }

  log.info("Building full quiz service with settings:", {
    ...settings,
    quizRatingSchema: "[redacted]",
    quizSchema: "redacted to reduce log noise",
  });
  return new BaseFullQuizService(generatorArray, selector, reranker);
}
