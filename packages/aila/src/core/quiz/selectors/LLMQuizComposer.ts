import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import { zodResponseFormat } from "openai/helpers/zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type {
  QuizQuestionPool,
  QuizSelector,
  RagQuizQuestion,
  RatingResponse,
} from "../interfaces";
import { ImageDescriptionService } from "../services/ImageDescriptionService";
import type { Span } from "../tracing";
import {
  type CompositionResponse,
  CompositionResponseSchema,
  buildCompositionPrompt,
} from "./LLMQuizComposerPrompts";

const log = aiLogger("aila:quiz");

const OPENAI_MODEL = "o4-mini";
const IS_REASONING_MODEL = true;

/**
 * LLM-based Quiz Composer that actively selects questions from candidate pools
 *
 * Implements QuizSelector but ignores the ratings parameter - instead uses
 * LLM reasoning to intelligently select 6 questions from multiple candidate pools, ensuring:
 * - Coverage of all prior knowledge points or key learning points
 * - Pedagogical diversity (cognitive levels, question types)
 * - Alignment with lesson plan objectives
 */
export class LLMQuizComposer implements QuizSelector {
  /**
   * Select questions from candidate pools using LLM reasoning.
   * @param span - Optional tracing span. When provided, records prompt, response, and selections.
   */
  public async selectQuestions(
    questionPools: QuizQuestionPool[],
    ratings: RatingResponse[], // Ignored - composer makes its own decisions
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    span?: Span,
  ): Promise<RagQuizQuestion[]> {
    this.logCompositionStart(questionPools, quizType);

    if (questionPools.length === 0) {
      log.warn("No question pools provided to composer");
      return [];
    }

    // Process images: extract URLs, get/generate descriptions, replace in text
    const imageService = new ImageDescriptionService();
    const imageSpan = span?.startChild("image-descriptions");
    const { descriptions, cacheHits, cacheMisses, generatedCount } =
      await imageService.getImageDescriptions(questionPools, imageSpan);
    imageSpan?.end();

    log.info(
      `Image descriptions: ${descriptions.size} total (${cacheHits} cached, ${generatedCount} generated)`,
    );

    // Replace images with descriptions for LLM composition
    const poolsWithDescriptions =
      ImageDescriptionService.applyDescriptionsToQuestions(
        questionPools,
        descriptions,
      );

    const prompt = buildCompositionPrompt(
      poolsWithDescriptions,
      lessonPlan,
      quizType,
    );

    const llmSpan = span?.startChild("llm-call");
    const response = await this.callOpenAI(prompt);
    llmSpan?.end();

    const selectedQuestions = this.mapResponseToQuestions(
      response,
      questionPools,
    );

    // Record debug data if span is provided
    if (span) {
      span.setData("prompt", prompt);
      span.setData("response", response);
      span.setData(
        "selectedQuestions",
        selectedQuestions.map((q) => ({
          sourceUid: q.sourceUid,
          questionText:
            q.question.question.substring(0, 100) +
            (q.question.question.length > 100 ? "..." : ""),
        })),
      );
    }

    log.info(`LLM Composer: selected ${selectedQuestions.length} questions`);

    return selectedQuestions;
  }

  private logCompositionStart(
    questionPools: QuizQuestionPool[],
    quizType: QuizPath,
  ): void {
    const totalQuestions = questionPools.reduce(
      (sum, pool) => sum + pool.questions.length,
      0,
    );
    log.info(
      `LLM Composer: composing ${quizType} from ${questionPools.length} pools`,
    );
    log.info(`LLM Composer: ${totalQuestions} total candidate questions`);
  }

  private async callOpenAI(prompt: string): Promise<CompositionResponse> {
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
      log.error("Failed to compose quiz with OpenAI:", error);
      throw new Error("Quiz composition failed");
    }
  }

  private mapResponseToQuestions(
    response: CompositionResponse,
    questionPools: QuizQuestionPool[],
  ): RagQuizQuestion[] {
    log.info(`Overall strategy: ${response.overallStrategy}`);

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

        log.info(`Selected: ${selection.questionUid} - ${selection.reasoning}`);
        return question;
      })
      .filter((q): q is RagQuizQuestion => q !== null);

    if (selectedQuestions.length < 6) {
      log.warn(
        `Only found ${selectedQuestions.length} of 6 requested questions`,
      );
    }

    return selectedQuestions;
  }
}
