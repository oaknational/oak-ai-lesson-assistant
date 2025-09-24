import { RAG } from "@oakai/core/src/rag";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { prisma as globalPrisma } from "@oakai/db/client";
import { aiLogger } from "@oakai/logger";

import type { AilaRagFeature } from ".";
import type { AilaServices } from "../../core/AilaServices";
import { tryWithErrorReporting } from "../../helpers/errorReporting";
import type { PartialLessonPlan } from "../../protocol/schema";
import { minifyLessonPlanForRelevantLessons } from "../../utils/lessonPlan/minifyLessonPlanForRelevantLessons";

const log = aiLogger("aila:rag");

export class AilaRag implements AilaRagFeature {
  private readonly _aila: AilaServices;
  private readonly _rag: RAG;
  private readonly _prisma: PrismaClientWithAccelerate;

  constructor({
    aila,
    prisma,
  }: {
    aila: AilaServices;
    prisma?: PrismaClientWithAccelerate;
  }) {
    this._aila = aila;
    this._prisma = prisma ?? globalPrisma;
    this._rag = new RAG(this._prisma, {
      userId: aila.userId,
      chatId: aila.chatId,
    });
  }

  public async fetchRagContent({
    numberOfRecordsInRag,
    lessonPlan,
  }: {
    numberOfRecordsInRag?: number;
    lessonPlan?: PartialLessonPlan;
  }) {
    // #TODO Refactor to return an array rather than stringified JSON
    let content = "[]";

    const { title, keyStage, subject, topic } =
      lessonPlan ?? this._aila?.document?.content ?? {};
    const chatId = this._aila?.chatId ?? "anonymous"; // #TODO add proper support for CLI RAG requests without a user
    if (!title) {
      return content;
    }
    const ragLessonPlans = await tryWithErrorReporting(
      () => {
        return title && keyStage && subject
          ? this._rag.fetchLessonPlans({
              chatId,
              title,
              keyStage,
              subject,
              topic: topic ?? undefined,
              k:
                numberOfRecordsInRag ??
                this._aila?.options.numberOfRecordsInRag ??
                5,
            })
          : [];
      },
      "Failed to fetch RAG content",
      "info",
    );

    if (ragLessonPlans) {
      const minifiedLessons = ragLessonPlans.map((l) => {
        return minifyLessonPlanForRelevantLessons(l);
      });
      content = JSON.stringify(minifiedLessons, null, 2);
    }

    log.info("Got RAG content, length:", content.length);

    return content;
  }
}
