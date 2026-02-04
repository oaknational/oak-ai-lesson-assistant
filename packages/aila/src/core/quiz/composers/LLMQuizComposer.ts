import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import { zodResponseFormat } from "openai/helpers/zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type {
  ComposerResult,
  QuizComposer,
  QuizQuestionPool,
  RagQuizQuestion,
} from "../interfaces";
import type { Task } from "../reporting";
import {
  type CompositionResponse,
  CompositionResponseSchema,
  type SuccessData,
  buildCompositionPrompt,
} from "./LLMQuizComposerPrompts";

const log = aiLogger("aila:quiz");

const OPENAI_MODEL = "o4-mini";
const IS_REASONING_MODEL = true;

const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);

/**
 * LLM-based Quiz Composer that intelligently selects questions from candidate pools.
 * Uses LLM reasoning to select 6 questions ensuring:
 * - Coverage of all prior knowledge points or key learning points
 * - Pedagogical diversity (cognitive levels, question types)
 * - Alignment with lesson plan objectives
 *
 * Note: Question pools should be pre-enriched (e.g., with image descriptions)
 * before being passed to the composer.
 */
export class LLMComposer implements QuizComposer {
  public readonly name = "llmComposer";

  public async compose(
    questionPools: QuizQuestionPool[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    task: Task,
    userInstructions?: string | null,
  ): Promise<ComposerResult> {
    this.logCompositionStart(questionPools, quizType);

    if (questionPools.length === 0) {
      throw new Error("No question pools provided to composer");
    }

    // Build prompt (separate task so streaming can show prompt while waiting for LLM)
    const prompt = await task.child("buildPrompt", (t) => {
      const builtPrompt = buildCompositionPrompt(
        questionPools,
        lessonPlan,
        quizType,
        userInstructions,
      );
      const count = sum(questionPools.map((p) => p.questions.length));
      t.addData({
        prompt: builtPrompt,
        candidateCount: count,
        userInstructions,
      });
      return Promise.resolve(builtPrompt);
    });

    // Call LLM
    const result = await task.child("llmCall", async (t) => {
      const response = await this.callOpenAI(prompt);
      t.addData({ response });

      if (response.status === "bail" || !response.success) {
        const bailReason = response.bail?.reason ?? "Unknown reason";
        log.warn(`LLM Composer bailed: ${bailReason}`);
        return { status: "bail" as const, questions: [] as [], bailReason };
      }

      const questions = this.mapResponseToQuestions(
        response.success,
        questionPools,
      );
      t.addData({ selectedQuestions: questions });

      return { status: "success" as const, questions };
    });

    log.info(`LLM Composer: selected ${result.questions.length} questions`);

    return result;
  }

  private logCompositionStart(
    questionPools: QuizQuestionPool[],
    quizType: QuizPath,
  ): void {
    const totalQuestions = sum(questionPools.map((p) => p.questions.length));
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
          ? { max_completion_tokens: 16000 }
          : { max_tokens: 8000 }),
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
    successData: SuccessData,
    questionPools: QuizQuestionPool[],
  ): RagQuizQuestion[] {
    log.info(`Overall strategy: ${successData.overallStrategy}`);

    // Build lookup map of UID -> question from all pools
    const questionsByUid = new Map<string, RagQuizQuestion>();
    questionPools.forEach((pool) => {
      pool.questions.forEach((question) => {
        questionsByUid.set(question.sourceUid, question);
      });
    });

    // Map selections to questions, filtering out any not found
    const selectedQuestions = successData.selectedQuestions
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

    return selectedQuestions;
  }
}
