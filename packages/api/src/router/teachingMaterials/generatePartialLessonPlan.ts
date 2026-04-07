import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { moderateWithOakService } from "@oakai/core/src/utils/ailaModeration/oakModerationService";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/safetyResult";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import { generateTeachingMaterialModeration } from "@oakai/teaching-materials";
import { generatePartialLessonPlanObject } from "@oakai/teaching-materials/src/documents/partialLessonPlan/generateLessonPlan";
import { type PartialLessonContextSchemaType } from "@oakai/teaching-materials/src/documents/partialLessonPlan/schema";
import { performThreatCheck } from "@oakai/teaching-materials/src/threatDetection/performThreatCheck";

import type { SignedInAuthObject } from "@clerk/backend/internal";

import type { PartialLessonPlan } from "../../../../aila/src/protocol/schema";
import { recordSafetyViolation } from "./safetyUtils";

const log = aiLogger("teaching-materials");

interface GeneratePartialLessonPlanParams {
  prisma: PrismaClientWithAccelerate;
  userId: string;
  input: PartialLessonContextSchemaType;
  auth: SignedInAuthObject;
}

export type GeneratePartialLessonPlanResponse =
  | {
      threatDetection: boolean;
      lesson: PartialLessonPlan | null;
      lessonId: string;
      moderation: ModerationResult;
    }
  | {
      threatDetection: boolean;
      lesson: null;
      lessonId: string;
      moderation: ModerationResult;
    };
/**
 * Generates a partial lesson plan based on the provided context
 */
export async function generatePartialLessonPlan({
  prisma,
  auth,
  userId,
  input,
}: GeneratePartialLessonPlanParams) {
  log.info("Generating partial lesson plan");

  const mockModerationResult = getMockModerationResult(input.title);
  const mockToxicResult = mockModerationResult && isToxic(mockModerationResult);

  // Store messages for threat detection
  const messages = [
    { role: "user" as const, content: `${input.subject} - ${input.title}` },
  ];

  const threatDetection = await performThreatCheck({
    messages,
  });

  const lesson = await generatePartialLessonPlanObject({
    provider: "openai",
    parsedInput: { context: input },
  });

  if (!lesson) {
    throw new Error("Failed to generate lesson plan");
  }

  const useOakService =
    process.env.OAK_MODERATION_TEACHING_MATERIALS_V1_PRIMARY === "true";

  let moderation: ModerationResult;
  if (useOakService) {
    const baseUrl = process.env.MODERATION_API_URL;
    if (!baseUrl) {
      throw new Error(
        "MODERATION_API_URL is required when OAK_MODERATION_TEACHING_MATERIALS_V1_PRIMARY is enabled",
      );
    }
    moderation = await moderateWithOakService(JSON.stringify(lesson), {
      baseUrl,
      protectionBypassSecret:
        process.env.MODERATION_API_BYPASS_SECRET ?? undefined,
    });
  } else {
    moderation = await generateTeachingMaterialModeration({
      input: JSON.stringify(lesson),
      provider: "openai",
    });
  }

  const interaction = await prisma.additionalMaterialInteraction.create({
    data: {
      userId,
      inputText: `${input.subject} - ${input.title}`,
      config: {
        resourceType: "partial-lesson-plan",
        resourceTypeVersion: 1,
      },
      output: lesson,
      outputModeration: moderation,
      inputThreatDetection: {
        flagged: threatDetection.isThreat,
        provider: threatDetection.provider,
        metadata: threatDetection.rawResponse,
      },
    },
  });

  if (isToxic(moderation) || mockToxicResult) {
    await recordSafetyViolation({
      prisma,
      auth,
      interactionId: interaction.id,
      violationType: "MODERATION",
      userAction: "PARTIAL_LESSON_GENERATION",
      moderation: mockModerationResult ?? moderation,
    });

    return {
      threatDetection: false,
      lesson: null,
      lessonId: interaction.id,
      moderation: mockModerationResult ?? moderation,
    };
  }

  if (threatDetection.isThreat) {
    await recordSafetyViolation({
      prisma,
      auth,
      interactionId: interaction.id,
      violationType: "THREAT",
      userAction: "PARTIAL_LESSON_GENERATION",
      messages: messages,
      threatDetection,
    });

    return {
      threatDetection: true,
      lesson: null,
      lessonId: interaction.id,
      moderation,
    };
  }

  return {
    threatDetection: false,
    lesson,
    lessonId: interaction.id,
    moderation: mockModerationResult ?? moderation,
  };
}
