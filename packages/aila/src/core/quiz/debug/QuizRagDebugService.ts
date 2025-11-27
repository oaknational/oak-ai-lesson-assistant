import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import { zodResponseFormat } from "openai/helpers/zod";

import type {
  AilaRagRelevantLesson,
  LatestQuiz,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import { buildQuizFromQuestions } from "../buildQuizObject";
import { AilaRagQuizGenerator } from "../generators/AilaRagQuizGenerator";
import { BasedOnRagQuizGenerator } from "../generators/BasedOnRagQuizGenerator";
import type {
  QuizQuestionPool,
  RagQuizQuestion,
  RatingResponse,
} from "../interfaces";
import { NoOpReranker } from "../rerankers/NoOpReranker";
import {
  CompositionResponseSchema,
  buildCompositionPrompt,
} from "../selectors/LLMQuizComposerPrompts";
import { ImageDescriptionService } from "../services/ImageDescriptionService";
import { MLQuizGeneratorMultiTermDebug } from "./MLQuizGeneratorMultiTermDebug";
import type {
  GeneratorDebugResult,
  ImageDescriptionDebugResult,
  ImageDescriptionEntry,
  MLMultiTermDebugResult,
  QuizRagDebugResult,
} from "./types";

const log = aiLogger("aila:quiz");

const OPENAI_MODEL = "o4-mini";
const IS_REASONING_MODEL = true;

/**
 * Debug service that orchestrates the Quiz RAG pipeline with full visibility
 * into intermediate results at each stage.
 */
export class QuizRagDebugService {
  /**
   * Run the full debug pipeline and return all intermediate results
   */
  async runDebugPipeline(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    relevantLessons: AilaRagRelevantLesson[] = [],
  ): Promise<QuizRagDebugResult> {
    const startTime = Date.now();

    log.info(`QuizRagDebugService: Starting debug pipeline for ${quizType}`);

    // Stage 1: Run generators with timing
    const generatorsStart = Date.now();
    const generatorResults = await this.runGeneratorsWithDebug(
      lessonPlan,
      quizType,
      relevantLessons,
    );
    const generatorsMs = Date.now() - generatorsStart;

    // Combine all pools
    const allPools = [
      ...(generatorResults.basedOnRag?.pools ?? []),
      ...(generatorResults.ailaRag?.pools ?? []),
      ...(generatorResults.mlMultiTerm?.pools ?? []),
    ];

    log.info(
      `QuizRagDebugService: Generators produced ${allPools.length} pools`,
    );

    // Stage 2: Reranker (no-op)
    const rerankerStart = Date.now();
    const reranker = new NoOpReranker();
    const ratings = await reranker.evaluateQuizArray(
      allPools,
      lessonPlan,
      quizType,
    );
    const rerankerMs = Date.now() - rerankerStart;

    // Stage 3: Selector with debug
    const selectorStart = Date.now();
    const selectorResult = await this.runSelectorWithDebug(
      allPools,
      lessonPlan,
      quizType,
    );
    const selectorMs = Date.now() - selectorStart;

    // Build final quiz
    const finalQuiz = buildQuizFromQuestions(selectorResult.selectedQuestions);

    const totalMs = Date.now() - startTime;
    log.info(`QuizRagDebugService: Pipeline complete in ${totalMs}ms`);

    return {
      input: { lessonPlan, quizType, relevantLessons },
      generators: generatorResults,
      reranker: { type: "no-op", ratings },
      selector: {
        type: "llm-quiz-composer",
        ...selectorResult,
      },
      finalQuiz,
      timing: {
        totalMs,
        generatorsMs,
        rerankerMs,
        selectorMs,
      },
    };
  }

  /**
   * Run all generators and capture debug results
   */
  private async runGeneratorsWithDebug(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    relevantLessons: AilaRagRelevantLesson[],
  ): Promise<QuizRagDebugResult["generators"]> {
    const results: QuizRagDebugResult["generators"] = {};

    // Run in parallel
    const [basedOnResult, ailaRagResult, mlResult] = await Promise.all([
      this.runBasedOnGenerator(lessonPlan, quizType),
      this.runAilaRagGenerator(lessonPlan, quizType, relevantLessons),
      this.runMLMultiTermGenerator(lessonPlan, quizType),
    ]);

    if (basedOnResult) results.basedOnRag = basedOnResult;
    if (ailaRagResult) results.ailaRag = ailaRagResult;
    if (mlResult) results.mlMultiTerm = mlResult;

    return results;
  }

  /**
   * Run BasedOnRag generator
   */
  private async runBasedOnGenerator(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<GeneratorDebugResult | undefined> {
    if (!lessonPlan.basedOn?.id) {
      log.info(
        "QuizRagDebugService: No basedOn lesson, skipping BasedOnRag generator",
      );
      return undefined;
    }

    const start = Date.now();
    const generator = new BasedOnRagQuizGenerator();

    const pools =
      quizType === "/starterQuiz"
        ? await generator.generateMathsStarterQuizCandidates(lessonPlan)
        : await generator.generateMathsExitQuizCandidates(lessonPlan);

    if (pools.length === 0) {
      return undefined;
    }

    return {
      generatorType: "basedOnRag",
      pools,
      metadata: {
        sourceLesson: lessonPlan.basedOn.title,
        sourceLessonSlug: lessonPlan.basedOn.id,
      },
      timingMs: Date.now() - start,
    };
  }

  /**
   * Run AilaRag generator
   */
  private async runAilaRagGenerator(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    relevantLessons: AilaRagRelevantLesson[],
  ): Promise<GeneratorDebugResult | undefined> {
    if (relevantLessons.length === 0) {
      log.info(
        "QuizRagDebugService: No relevant lessons, skipping AilaRag generator",
      );
      return undefined;
    }

    const start = Date.now();
    const generator = new AilaRagQuizGenerator();

    const pools =
      quizType === "/starterQuiz"
        ? await generator.generateMathsStarterQuizCandidates(
            lessonPlan,
            relevantLessons,
          )
        : await generator.generateMathsExitQuizCandidates(
            lessonPlan,
            relevantLessons,
          );

    if (pools.length === 0) {
      return undefined;
    }

    return {
      generatorType: "rag",
      pools,
      metadata: {
        sourceLesson: relevantLessons.map((l) => l.title).join(", "),
      },
      timingMs: Date.now() - start,
    };
  }

  /**
   * Run ML Multi-Term generator with full debug output
   */
  private async runMLMultiTermGenerator(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<MLMultiTermDebugResult | undefined> {
    const generator = new MLQuizGeneratorMultiTermDebug();
    const result = await generator.generateWithDebug(lessonPlan, quizType);

    if (result.pools.length === 0) {
      return undefined;
    }

    return result;
  }

  /**
   * Run selector stage with debug output
   */
  private async runSelectorWithDebug(
    questionPools: QuizQuestionPool[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<{
    imageDescriptions: ImageDescriptionDebugResult;
    composerPrompt: string;
    composerResponse: {
      overallStrategy: string;
      selectedQuestions: { questionUid: string; reasoning: string }[];
    };
    selectedQuestions: RagQuizQuestion[];
  }> {
    if (questionPools.length === 0) {
      return {
        imageDescriptions: {
          totalImages: 0,
          cacheHits: 0,
          cacheMisses: 0,
          generatedCount: 0,
          descriptions: [],
        },
        composerPrompt: "",
        composerResponse: {
          overallStrategy: "No pools provided",
          selectedQuestions: [],
        },
        selectedQuestions: [],
      };
    }

    // Process images
    const imageService = new ImageDescriptionService();
    const { descriptions, cacheHits, cacheMisses, generatedCount } =
      await imageService.getImageDescriptions(questionPools);

    // Build debug-friendly image descriptions list
    const imageDescriptionEntries: ImageDescriptionEntry[] = [];
    const allImageUrls = this.extractAllImageUrls(questionPools);
    for (const url of allImageUrls) {
      const description = descriptions.get(url);
      if (description) {
        imageDescriptionEntries.push({
          url,
          description,
          wasCached:
            cacheHits > 0 && imageDescriptionEntries.length < cacheHits,
        });
      }
    }

    const imageDescriptionsDebug: ImageDescriptionDebugResult = {
      totalImages: descriptions.size,
      cacheHits,
      cacheMisses,
      generatedCount,
      descriptions: imageDescriptionEntries,
    };

    log.info(
      `QuizRagDebugService: Image descriptions - ${descriptions.size} total (${cacheHits} cached, ${generatedCount} generated)`,
    );

    // Replace images with descriptions for LLM composition
    const poolsWithDescriptions =
      ImageDescriptionService.applyDescriptionsToQuestions(
        questionPools,
        descriptions,
      );

    // Build composition prompt
    const composerPrompt = buildCompositionPrompt(
      poolsWithDescriptions,
      lessonPlan,
      quizType,
    );

    // Call OpenAI
    const composerResponse = await this.callOpenAI(composerPrompt);

    // Map response to questions
    const selectedQuestions = this.mapResponseToQuestions(
      composerResponse,
      questionPools,
    );

    return {
      imageDescriptions: imageDescriptionsDebug,
      composerPrompt,
      composerResponse,
      selectedQuestions,
    };
  }

  /**
   * Extract all image URLs from question pools
   */
  private extractAllImageUrls(questionPools: QuizQuestionPool[]): string[] {
    const poolsJson = JSON.stringify(questionPools);
    const imageRegex = /!\[[^\]]*\]\(([^)]{1,2000})\)/g;

    const urlSet = new Set<string>();
    [...poolsJson.matchAll(imageRegex)]
      .map((match) => match[1])
      .filter((url): url is string => Boolean(url))
      .forEach((url) => urlSet.add(url));

    return Array.from(urlSet);
  }

  /**
   * Call OpenAI for quiz composition
   */
  private async callOpenAI(prompt: string) {
    const openai = createOpenAIClient({ app: "quiz-composer" });

    try {
      const response = await openai.beta.chat.completions.parse({
        model: OPENAI_MODEL,
        ...(IS_REASONING_MODEL
          ? { max_completion_tokens: 4000 }
          : { max_tokens: 4000 }),
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: zodResponseFormat(
          CompositionResponseSchema,
          "QuizComposition",
        ),
      });

      const parsed = response.choices[0]?.message?.parsed;
      if (!parsed) {
        throw new Error("OpenAI returned no parsed response");
      }

      return parsed;
    } catch (error) {
      log.error(
        "QuizRagDebugService: Failed to compose quiz with OpenAI:",
        error,
      );
      throw new Error("Quiz composition failed");
    }
  }

  /**
   * Map OpenAI response to actual question objects
   */
  private mapResponseToQuestions(
    response: {
      overallStrategy: string;
      selectedQuestions: { questionUid: string; reasoning: string }[];
    },
    questionPools: QuizQuestionPool[],
  ): RagQuizQuestion[] {
    // Build lookup map of UID -> question from all pools
    const questionsByUid = new Map<string, RagQuizQuestion>();
    questionPools.forEach((pool) => {
      pool.questions.forEach((question) => {
        questionsByUid.set(question.sourceUid, question);
      });
    });

    // Map selections to questions, filtering out any not found
    const selectedQuestions = response.selectedQuestions
      .map((selection) => {
        const question = questionsByUid.get(selection.questionUid);
        if (!question) {
          log.warn(`Question ${selection.questionUid} not found in any pool`);
          return null;
        }
        return question;
      })
      .filter((q): q is RagQuizQuestion => q !== null);

    return selectedQuestions;
  }
}
