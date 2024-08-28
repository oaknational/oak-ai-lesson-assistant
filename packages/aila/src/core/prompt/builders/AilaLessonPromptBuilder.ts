import {
  TemplateProps,
  template,
} from "@oakai/core/src/prompts/lesson-assistant";
import { prisma as globalPrisma } from "@oakai/db";

import { DEFAULT_RAG_LESSON_PLANS } from "../../../constants";
import { tryWithErrorReporting } from "../../../helpers/errorReporting";
import { LooseLessonPlan } from "../../../protocol/schema";
import { findAmericanisms } from "../../../utils/language/findAmericanisms";
import { compressedLessonPlanForRag } from "../../../utils/lessonPlan/compressedLessonPlanForRag";
import { fetchLessonPlan } from "../../../utils/lessonPlan/fetchLessonPlan";
import { fetchRagContent } from "../../../utils/rag/fetchRagContent";
import { AilaServices } from "../../AilaServices";
import { AilaPromptBuilder } from "../AilaPromptBuilder";

export class AilaLessonPromptBuilder extends AilaPromptBuilder {
  constructor(aila: AilaServices) {
    super(aila);
  }

  public async build(): Promise<string> {
    const relevantLessonPlans = await this.fetchRelevantLessonPlans();
    const baseLessonPlan = await this.fetchBaseLessonPlan();
    return this.systemPrompt(relevantLessonPlans, baseLessonPlan);
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

  private async fetchRelevantLessonPlans(): Promise<string> {
    const noRelevantLessonPlans = "None";
    const { chatId, userId } = this._aila;
    if (!this._aila?.options.useRag) {
      return noRelevantLessonPlans;
    }
    if (!chatId) {
      return noRelevantLessonPlans;
    }
    const { title, subject, keyStage, topic } = this._aila?.lessonPlan ?? {};

    let relevantLessonPlans = noRelevantLessonPlans;
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
    return relevantLessonPlans;
  }

  private systemPrompt(
    relevantLessonPlans: string,
    baseLessonPlan: LooseLessonPlan | undefined,
  ): string {
    const lessonPlan = this._aila?.lessonPlan ?? {};
    const { title, subject, keyStage, topic } = lessonPlan;
    const args: TemplateProps = {
      subject,
      lessonTitle: title,
      keyStage,
      topic,
      currentLessonPlan: compressedLessonPlanForRag(lessonPlan),
      relevantLessonPlans,
      summaries: "None",
      responseMode: "interactive",
      useRag: this._aila?.options.useRag ?? true,
      americanisms: findAmericanisms(lessonPlan),
      baseLessonPlan: baseLessonPlan
        ? compressedLessonPlanForRag(baseLessonPlan)
        : undefined,
    };

    return template(args);
  }
}
