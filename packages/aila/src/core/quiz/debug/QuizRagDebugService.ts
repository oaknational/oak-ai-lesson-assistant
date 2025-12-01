import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import { buildFullQuizService } from "../fullservices/buildFullQuizService";
import type { RagQuizQuestion } from "../interfaces";
import type { CompletedSpan, Tracer } from "../tracing";
import type {
  CohereRerankDebug,
  ComposerLlmResult,
  ComposerPromptResult,
  ElasticsearchHitDebug,
  GeneratorDebugResult,
  ImageDescriptionDebugResult,
  MLMultiTermDebugResult,
  MLSearchTermDebugResult,
  QuizRagDebugResult,
} from "./types";

const log = aiLogger("aila:quiz");

/**
 * Debug service that runs the production Quiz RAG pipeline with tracing
 * and extracts detailed debug information from completed spans.
 */
export class QuizRagDebugService {
  /**
   * Run the debug pipeline with a tracer for streaming updates.
   * Uses production buildQuiz and extracts debug info from spans.
   */
  async runDebugPipeline(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    relevantLessons: AilaRagRelevantLesson[],
    tracer: Tracer,
  ): Promise<QuizRagDebugResult> {
    const startTime = Date.now();

    log.info(`QuizRagDebugService: Starting pipeline for ${quizType}`);

    // Use production service with tracer
    const service = buildFullQuizService({
      quizGenerators: ["basedOnRag", "rag", "ml-multi-term"],
      quizReranker: "no-op",
      quizSelector: "llm-quiz-composer",
    });

    const finalQuiz = await service.buildQuiz(
      quizType,
      lessonPlan,
      relevantLessons,
      tracer,
    );

    const totalMs = Date.now() - startTime;
    log.info(`QuizRagDebugService: Pipeline complete in ${totalMs}ms`);

    // Extract debug results from completed spans
    const spans = tracer.getCompletedSpans();
    const debugResult = this.extractDebugResultFromSpans(
      spans,
      lessonPlan,
      quizType,
      relevantLessons,
      finalQuiz,
      totalMs,
    );

    return debugResult;
  }

  /**
   * Extract QuizRagDebugResult from completed tracer spans.
   * Throws if expected pipeline structure is missing.
   */
  private extractDebugResultFromSpans(
    spans: CompletedSpan[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    relevantLessons: AilaRagRelevantLesson[],
    finalQuiz: QuizRagDebugResult["finalQuiz"],
    totalMs: number,
  ): QuizRagDebugResult {
    const pipelineSpan = spans.find((s) => s.name === "pipeline");
    if (!pipelineSpan) {
      throw new Error(
        "Pipeline span not found - tracer may not have been passed to buildQuiz",
      );
    }

    const generators: QuizRagDebugResult["generators"] = {};

    // Extract generator results
    const basedOnSpan = this.findChildSpan(pipelineSpan, "basedOnRag");
    if (basedOnSpan) {
      const result = basedOnSpan.data["result"] as {
        pools: GeneratorDebugResult["pools"];
      } | null;
      if (result?.pools) {
        generators.basedOnRag = {
          generatorType: "basedOnRag",
          pools: result.pools,
          metadata: {
            sourceLesson: lessonPlan.basedOn?.title,
            sourceLessonSlug: lessonPlan.basedOn?.id,
          },
          timingMs: basedOnSpan.durationMs,
        };
      }
    }

    const ailaRagSpan = this.findChildSpan(pipelineSpan, "ailaRag");
    if (ailaRagSpan) {
      const result = ailaRagSpan.data["result"] as {
        pools: GeneratorDebugResult["pools"];
      } | null;
      if (result?.pools) {
        generators.ailaRag = {
          generatorType: "rag",
          pools: result.pools,
          metadata: {
            sourceLesson: relevantLessons.map((l) => l.title).join(", "),
          },
          timingMs: ailaRagSpan.durationMs,
        };
      }
    }

    const mlSpan = this.findChildSpan(pipelineSpan, "mlMultiTerm");
    if (mlSpan) {
      const result = mlSpan.data["result"] as {
        pools: GeneratorDebugResult["pools"];
      } | null;
      if (result?.pools) {
        const searchTerms = this.extractMLSearchTermsFromSpan(mlSpan);
        generators.mlMultiTerm = {
          generatorType: "ml-multi-term",
          pools: result.pools,
          searchTerms,
          timingMs: mlSpan.durationMs,
        };
      }
    }

    // Extract selector results
    // Note: selector span may not exist if pipeline returned early (e.g., no pools found)
    const selectorSpan = this.findChildSpan(pipelineSpan, "selector");

    // Default empty selector result for early-return case
    const emptySelector = {
      type: "llm-quiz-composer" as const,
      imageDescriptions: {
        totalImages: 0,
        cacheHits: 0,
        cacheMisses: 0,
        generatedCount: 0,
        descriptions: [] as ImageDescriptionDebugResult["descriptions"],
        timingMs: 0,
      },
      composerPrompt: "",
      composerResponse: {
        overallStrategy: "Pipeline returned early - no pools to select from",
        selectedQuestions: [] as { questionUid: string; reasoning: string }[],
      },
      composerTimingMs: 0,
      selectedQuestions: [] as RagQuizQuestion[],
    };

    if (!selectorSpan) {
      // Pipeline returned early (no pools) - return with empty selector
      return {
        input: { lessonPlan, quizType, relevantLessons },
        generators,
        reranker: { type: "no-op", ratings: [] },
        selector: emptySelector,
        finalQuiz,
        timing: {
          totalMs,
          generatorsMs:
            (basedOnSpan?.durationMs ?? 0) +
            (ailaRagSpan?.durationMs ?? 0) +
            (mlSpan?.durationMs ?? 0),
          rerankerMs: 0,
          selectorMs: 0,
        },
      };
    }

    const imageSpan = this.findChildSpan(selectorSpan, "imageDescriptions");
    const promptSpan = this.findChildSpan(selectorSpan, "composerPrompt");
    const llmSpan = this.findChildSpan(selectorSpan, "composerLlm");

    if (!promptSpan || !llmSpan) {
      throw new Error(
        "Composer spans not found - selector started but didn't complete",
      );
    }

    const imageResult = imageSpan?.data["result"] as
      | ImageDescriptionDebugResult
      | undefined;
    const promptResult = promptSpan.data["result"] as
      | ComposerPromptResult
      | undefined;
    const llmResult = llmSpan.data["result"] as ComposerLlmResult | undefined;

    if (!promptResult || !llmResult) {
      throw new Error("Composer result data missing from spans");
    }

    return {
      input: { lessonPlan, quizType, relevantLessons },
      generators,
      reranker: { type: "no-op", ratings: [] },
      selector: {
        type: "llm-quiz-composer",
        imageDescriptions: imageResult ?? emptySelector.imageDescriptions,
        composerPrompt: promptResult.prompt,
        composerResponse: llmResult.response,
        composerTimingMs: llmResult.timingMs,
        selectedQuestions: llmResult.selectedQuestions,
      },
      finalQuiz,
      timing: {
        totalMs,
        generatorsMs:
          (basedOnSpan?.durationMs ?? 0) +
          (ailaRagSpan?.durationMs ?? 0) +
          (mlSpan?.durationMs ?? 0),
        rerankerMs: 0,
        selectorMs: selectorSpan?.durationMs ?? 0,
      },
    };
  }

  /**
   * Find a child span by name.
   */
  private findChildSpan(
    parent: CompletedSpan | undefined,
    name: string,
  ): CompletedSpan | undefined {
    return parent?.children.find((s) => s.name === name);
  }

  /**
   * Extract ML search term debug results from the mlMultiTerm span.
   */
  private extractMLSearchTermsFromSpan(
    mlSpan: CompletedSpan,
  ): MLSearchTermDebugResult[] {
    const results: MLSearchTermDebugResult[] = [];

    // Build a lookup of questionUid -> question from pools
    const pools =
      (
        mlSpan.data["result"] as {
          pools: { questions: RagQuizQuestion[] }[];
        } | null
      )?.pools ?? [];
    const questionsByUid = new Map<string, RagQuizQuestion>();
    pools.forEach((pool) => {
      pool.questions.forEach((q) => {
        questionsByUid.set(q.sourceUid, q);
      });
    });

    // Find query spans (named "query-0", "query-1", etc.)
    const querySpans = mlSpan.children.filter((s) =>
      s.name.startsWith("query-"),
    );

    for (const querySpan of querySpans) {
      const query = querySpan.data["query"] as string | undefined;
      if (!query) continue;

      const esSpan = querySpan.children.find((s) => s.name === "elasticsearch");
      const cohereSpan = querySpan.children.find((s) => s.name === "cohere");

      const elasticsearchHits: ElasticsearchHitDebug[] =
        (esSpan?.data["hitsWithScores"] as ElasticsearchHitDebug[]) ?? [];

      const cohereResults: CohereRerankDebug[] =
        (cohereSpan?.data["allResults"] as CohereRerankDebug[]) ?? [];

      const candidateUids = querySpan.data["finalCandidates"] as
        | string[]
        | undefined;

      const finalCandidates: RagQuizQuestion[] = (candidateUids ?? [])
        .map((uid) => questionsByUid.get(uid))
        .filter((q): q is RagQuizQuestion => q !== undefined);

      results.push({
        query,
        elasticsearchHits,
        cohereResults,
        finalCandidates,
        timingMs: querySpan.durationMs,
      });
    }

    return results;
  }
}
