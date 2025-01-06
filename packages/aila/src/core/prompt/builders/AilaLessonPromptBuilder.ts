import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import type { TemplateProps } from "@oakai/core/src/prompts/lesson-assistant";
import { template } from "@oakai/core/src/prompts/lesson-assistant";
import { prisma as globalPrisma } from "@oakai/db/client";
import { aiLogger } from "@oakai/logger";
import { getRelevantLessonPlans } from "@oakai/rag";

import { DEFAULT_RAG_LESSON_PLANS } from "../../../constants";
import { tryWithErrorReporting } from "../../../helpers/errorReporting";
import { LLMResponseJsonSchema } from "../../../protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "../../../protocol/schema";
import { LessonPlanJsonSchema } from "../../../protocol/schema";
import { compressedLessonPlanForRag } from "../../../utils/lessonPlan/compressedLessonPlanForRag";
import { fetchLessonPlan } from "../../../utils/lessonPlan/fetchLessonPlan";
import type { RagLessonPlan } from "../../../utils/rag/fetchRagContent";
import { fetchRagContent } from "../../../utils/rag/fetchRagContent";
import { parseKeyStage } from "../../../utils/rag/parseKeyStage";
import { parseSubjects } from "../../../utils/rag/parseSubjects";
import type { AilaServices } from "../../AilaServices";
import { AilaPromptBuilder } from "../AilaPromptBuilder";

const log = aiLogger("aila:prompt");

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
    if (!userId) {
      throw new Error("User ID is required to fetch relevant lesson plans");
    }

    if (!this._aila?.options.useRag || !chatId) {
      return {
        ragLessonPlans: [],
        stringifiedRelevantLessonPlans: noRelevantLessonPlans,
      };
    }

    const { title, subject, keyStage, topic } = this._aila?.lessonPlan ?? {};

    if (!title || !subject || !keyStage) {
      log.error("Missing title, subject or keyStage, returning empty content");
      return {
        ragLessonPlans: [],
        stringifiedRelevantLessonPlans: noRelevantLessonPlans,
      };
    }

    const newRagEnabled = await posthogAiBetaServerClient.isFeatureEnabled(
      "rag-schema-2024-12",
      userId,
    );

    if (newRagEnabled) {
      log.info("Using new RAG schema");

      const keyStageSlugs = keyStage ? [parseKeyStage(keyStage)] : null;
      const subjectSlugs = subject ? parseSubjects(subject) : null;

      const relevantLessonPlans = await getRelevantLessonPlans({
        title,
        keyStageSlugs,
        subjectSlugs,
      });
      const stringifiedRelevantLessonPlans = JSON.stringify(
        relevantLessonPlans,
        null,
        2,
      );

      return {
        ragLessonPlans: relevantLessonPlans.map((l) => ({
          ...l.lessonPlan,
          id: l.ragLessonPlanId,
        })),
        stringifiedRelevantLessonPlans,
      };
    }

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

    log.info("Fetched relevant lesson plans", relevantLessonPlans.length);
    const stringifiedRelevantLessonPlans = JSON.stringify(
      relevantLessonPlans,
      null,
      2,
    );

    log.info("Got RAG content, length:", stringifiedRelevantLessonPlans.length);

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
      americanisms: this._aila.americanisms.findAmericanisms(lessonPlan),
      baseLessonPlan: baseLessonPlan
        ? compressedLessonPlanForRag(baseLessonPlan)
        : undefined,
      lessonPlanJsonSchema: JSON.stringify(LessonPlanJsonSchema),
      llmResponseJsonSchema: JSON.stringify(LLMResponseJsonSchema),
      isUsingStructuredOutput:
        process.env.NEXT_PUBLIC_STRUCTURED_OUTPUTS_ENABLED === "true",
    };

    return template(args);
  }
}
