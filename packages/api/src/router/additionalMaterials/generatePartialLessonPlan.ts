import { generateAdditionalMaterialModeration } from "@oakai/additional-materials";
import { generatePartialLessonPlanObject } from "@oakai/additional-materials/src/documents/partialLessonPlan/generateLessonPlan";
import { type PartialLessonContextSchemaType } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { performLakeraThreatCheck } from "@oakai/additional-materials/src/threatDetection/lakeraThreatCheck";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { SignedInAuthObject } from "@clerk/backend/internal";

import { handleContentSafetyIssue } from "./contentSafetyUtils";
import { recordSafetyViolation } from "./safetyUtils";

const log = aiLogger("additional-materials");

interface GeneratePartialLessonPlanParams {
  prisma: PrismaClientWithAccelerate;
  userId: string;
  input: PartialLessonContextSchemaType;
  auth: SignedInAuthObject;
}

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

  const lakeraResult = await performLakeraThreatCheck({
    messages: [{ role: "user", content: `${input.subject} - ${input.title}` }],
  });

  const lesson = await generatePartialLessonPlanObject({
    provider: "openai",
    parsedInput: { context: input },
  });

  if (!lesson) {
    throw new Error("Failed to generate lesson plan");
  }

  const moderation = await generateAdditionalMaterialModeration({
    input: JSON.stringify(lesson),
    provider: "openai",
  });

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
        flagged: lakeraResult.flagged,
        metadata: lakeraResult,
      },
    },
  });

  if (isToxic(moderation)) {
    await recordSafetyViolation({
      prisma,
      auth,
      interactionId: interaction.id,
      violationType: "MODERATION",
    });

    return {
      threatDetection: true,
      lesson: null,
      lessonId: interaction.id,
      moderation,
    };
  }

  if (lakeraResult.flagged) {
    await recordSafetyViolation({
      prisma,
      auth,
      interactionId: interaction.id,
      violationType: "THREAT",
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
    moderation,
  };
}
