import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { parseKeyStage } from "@oakai/core/src/data/parseKeyStage";
import type { TemplateProps } from "@oakai/core/src/prompts/lesson-assistant";
import { template } from "@oakai/core/src/prompts/lesson-assistant";
import { prisma as globalPrisma } from "@oakai/db/client";
import { aiLogger } from "@oakai/logger";
import { getRelevantLessonPlans, parseSubjectsForRagSearch } from "@oakai/rag";

import { DEFAULT_NUMBER_OF_RECORDS_IN_RAG } from "../../../constants";
import { tryWithErrorReporting } from "../../../helpers/errorReporting";
import { LLMResponseJsonSchema } from "../../../protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "../../../protocol/schema";
import { LessonPlanJsonSchema } from "../../../protocol/schema";
import { compressedLessonPlanForRag } from "../../../utils/lessonPlan/compressedLessonPlanForRag";
import { fetchLessonPlan } from "../../../utils/lessonPlan/fetchLessonPlan";
import type { RagLessonPlan } from "../../../utils/rag/fetchRagContent";
import { fetchRagContent } from "../../../utils/rag/fetchRagContent";
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
    const basedOnId = this._aila.document?.content?.basedOn?.id;
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

    const { title, subject, keyStage, topic } =
      this._aila?.document?.content ?? {};

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
      const subjectSlugs = subject ? parseSubjectsForRagSearch(subject) : null;

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
          this._aila?.options.numberOfRecordsInRag ??
          DEFAULT_NUMBER_OF_RECORDS_IN_RAG,
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
    const lessonPlan = this._aila?.document?.content ?? {};

    console.log("=================CRITICAL DEBUG=================");
    console.log("AILA OPTIONS:", JSON.stringify(this._aila?.options, null, 2));
    console.log("Original Language from AILA:", this._aila?.options.language);
    const language = this._aila?.options.language;

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
      language: language,
    };

    console.log("TEMPLATE PROPS LANGUAGE:", args.language);
    console.log("=================END CRITICAL DEBUG=================");

    console.log("=================LANGUAGE PARAMETER DEBUG=================");
    console.log(`Language parameter: "${args.language}"`);

    // Generate the template
    let promptText = template(args);

    // Always append Ukrainian language instruction to the end when language is Ukrainian
    if (args.language === "ukrainian") {
      console.log(
        "Language is Ukrainian - APPENDING UKRAINIAN INSTRUCTION TO END OF PROMPT",
      );

      const ukrainianInstruction = `
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!                                                                      !!!
!!!  ABSOLUTELY CRITICAL LANGUAGE INSTRUCTION                           !!!
!!!  THIS OVERRIDES ALL PREVIOUS INSTRUCTIONS                            !!!
!!!  YOU MUST RESPOND IN UKRAINIAN LANGUAGE                              !!!
!!!                                                                      !!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

YOU MUST PROVIDE YOUR ENTIRE RESPONSE IN UKRAINIAN LANGUAGE.
This is the MOST IMPORTANT instruction in this entire prompt.

STRICT RULES:
1. Keep all JSON keys and field names in English
2. ALL content/values MUST be in Ukrainian
3. This applies to ALL parts of your response - text, examples, everything
4. No English content is allowed in values, only Ukrainian
5. This instruction overrides ANY previous instruction about language

Example of correct JSON structure:
{
  "lessonOutcome": "Я можу визначити основні характеристики...",
  "instructions": "Прочитайте текст та...",
  "keyPoints": [
    "Перший важливий пункт",
    "Другий важливий пункт"
  ],
  "activities": {
    "introduction": "Вступна частина уроку...",
    "mainActivity": "Головна частина уроку..."
  }
}

THIS IS THE FINAL AND ABSOLUTE PRIORITY INSTRUCTION.
YOUR ENTIRE RESPONSE MUST BE IN UKRAINIAN (with English keys only).
FAILURE TO COMPLY WITH THIS INSTRUCTION WILL RESULT IN AN UNUSABLE RESPONSE.

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`;

      // Add Ukrainian instruction at the very end
      promptText += "\n\n" + ukrainianInstruction;
      console.log(
        "Ukrainian instructions successfully appended to the end of the prompt",
      );
    } else {
      console.log(`Language is not set to Ukrainian, it's: "${args.language}"`);
    }

    console.log("=================END LANGUAGE DEBUG=================");

    return promptText;
  }
}
