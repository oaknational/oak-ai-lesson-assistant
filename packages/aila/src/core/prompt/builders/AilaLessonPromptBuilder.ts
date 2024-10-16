import {
  TemplateProps,
  template,
} from "@oakai/core/src/prompts/lesson-assistant";
import { prisma as globalPrisma } from "@oakai/db";

import { DEFAULT_RAG_LESSON_PLANS } from "../../../constants";
import { tryWithErrorReporting } from "../../../helpers/errorReporting";
import { LLMResponseJsonSchema } from "../../../protocol/jsonPatchProtocol";
import {
  LessonPlanJsonSchema,
  LooseLessonPlan,
} from "../../../protocol/schema";
import { findAmericanisms } from "../../../utils/language/findAmericanisms";
import { compressedLessonPlanForRag } from "../../../utils/lessonPlan/compressedLessonPlanForRag";
import { fetchLessonPlan } from "../../../utils/lessonPlan/fetchLessonPlan";
import {
  fetchRagContent,
  RagLessonPlan,
} from "../../../utils/rag/fetchRagContent";
import { AilaServices } from "../../AilaServices";
import { AilaPromptBuilder } from "../AilaPromptBuilder";

export class AilaLessonPromptBuilder extends AilaPromptBuilder {
  constructor(aila: AilaServices) {
    super(aila);
  }

  public async build(): Promise<string> {
    const relevantLessonPlans = await this.fetchRelevantLessonPlans();
    this._aila.chat.relevantLessons = relevantLessonPlans.ragLessonPlans.map(
      (lesson) => ({
        lessonPlanId: lesson.id,
        title: lesson.title,
      }),
    );

    const baseLessonPlan = await this.fetchBaseLessonPlan();
    return this.systemPrompt(
      relevantLessonPlans.stringifiedRelevantLessonPlans,
      baseLessonPlan,
    );
  }

  private async fetchBaseLessonPlan(): Promise<LooseLessonPlan | undefined> {
    const basedOnId = this._aila.lesson?.plan?.basedOn?.id;
    if (!basedOnId) {
      return;
    }
    const plan = await fetchLessonPlan({ id: basedOnId, prisma: globalPrisma });
    if (plan) {
      return plan;
    }
  }

  private async fetchRelevantLessonPlans(): Promise<{
    ragLessonPlans: RagLessonPlan[];
    stringifiedRelevantLessonPlans: string;
  }> {
    const noRelevantLessonPlans = "None";
    const { chatId, userId } = this._aila;
    if (!this._aila?.options.useRag || !chatId) {
      return {
        ragLessonPlans: [],
        stringifiedRelevantLessonPlans: noRelevantLessonPlans,
      };
    }

    const { title, subject, keyStage, topic } = this._aila?.lessonPlan ?? {};

    let relevantLessonPlans: RagLessonPlan[] = [];
    await tryWithErrorReporting(async () => {
      relevantLessonPlans = await fetchRagContent({
        title: title ?? "unknown",
        subject,
        topic,
        keyStage,
        id: chatId,
        k:
          this._aila?.options.numberOfLessonPlansInRag ??
          DEFAULT_RAG_LESSON_PLANS,
        prisma: globalPrisma,
        chatId,
        userId,
      });
    }, "Did not fetch RAG content. Continuing");

    console.log("Fetched relevant lesson plans", relevantLessonPlans.length);
    const stringifiedRelevantLessonPlans = JSON.stringify(
      relevantLessonPlans,
      null,
      2,
    );

    console.log(
      "Got RAG content, length:",
      stringifiedRelevantLessonPlans.length,
    );

    return {
      ragLessonPlans: relevantLessonPlans,
      stringifiedRelevantLessonPlans,
    };
  }

  private systemPrompt(
    relevantLessonPlans: string,
    baseLessonPlan: LooseLessonPlan | undefined,
  ): string {
    const lessonPlan = this._aila?.lessonPlan ?? {};
    const args: TemplateProps = {
      lessonPlan,
      relevantLessonPlans,
      summaries: "None",
      responseMode: this._aila?.options.mode ?? "interactive",
      useRag: this._aila?.options.useRag ?? true,
      americanisms: findAmericanisms(lessonPlan),
      baseLessonPlan: baseLessonPlan
        ? compressedLessonPlanForRag(baseLessonPlan)
        : undefined,
      lessonPlanJsonSchema: JSON.stringify(LessonPlanJsonSchema),
      llmResponseJsonSchema: JSON.stringify(LLMResponseJsonSchema),
      isUsingStructuredOutput:
        process.env.NEXT_PUBLIC_STRUCTURED_OUTPUTS_ENABLED === "true"
          ? true
          : false,
    };

    return template(args);
  }
}
