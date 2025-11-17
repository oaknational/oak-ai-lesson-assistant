import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import { zodResponseFormat } from "openai/helpers/zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type {
  QuizQuestionPool,
  QuizQuestionWithSourceData,
  QuizSelector,
  RatingResponse,
} from "../interfaces";
import {
  type CompositionResponse,
  CompositionResponseSchema,
  buildCompositionPrompt,
} from "./LLMQuizComposerPrompts";

const log = aiLogger("aila:quiz");

const OPENAI_MODEL = "gpt-4o-mini";
const IS_REASONING_MODEL = false;

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
  public async selectQuestions(
    questionPools: QuizQuestionPool[],
    ratings: RatingResponse[], // Ignored - composer makes its own decisions
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<QuizQuestionWithSourceData[]> {
    this.logCompositionStart(questionPools, quizType);

    if (questionPools.length === 0) {
      log.warn("No question pools provided to composer");
      return [];
    }

    const prompt = buildCompositionPrompt(questionPools, lessonPlan, quizType);
    const response = await this.callOpenAI(prompt);
    const selectedQuestions = this.mapResponseToQuestions(
      response,
      questionPools,
    );

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
  ): QuizQuestionWithSourceData[] {
    log.info(`Overall strategy: ${response.overallStrategy}`);

    // Build lookup map of UID -> question from all pools
    const questionsByUid = new Map<string, QuizQuestionWithSourceData>();
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
      .filter((q): q is QuizQuestionWithSourceData => q !== null);

    if (selectedQuestions.length < 6) {
      log.warn(
        `Only found ${selectedQuestions.length} of 6 requested questions`,
      );
    }

    return selectedQuestions;
  }
}
