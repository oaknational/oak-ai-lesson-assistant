import { generateAdditionalMaterialModeration } from "@oakai/additional-materials";
import {
  type GenerateAdditionalMaterialInput,
  additionalMaterialsConfigMap,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { generateAdditionalMaterialObject } from "@oakai/additional-materials/src/documents/additionalMaterials/generateAdditionalMaterialObject";
import { generatePartialLessonPlanObject } from "@oakai/additional-materials/src/documents/partialLessonPlan/generateLessonPlan";
import { type PartialLessonContextSchemaType } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { performLakeraThreatCheck } from "@oakai/additional-materials/src/threatDetection/lakeraThreatCheck";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { LooseLessonPlan } from "../../../../aila/src/protocol/schema";

const log = aiLogger("additional-materials");

interface GenerateAdditionalMaterialParams {
  prisma: PrismaClientWithAccelerate;
  userId: string;
  input: GenerateAdditionalMaterialInput & {
    lessonId?: string | null;
  };
}

export async function generateAdditionalMaterial({
  prisma,
  userId,
  input,
}: GenerateAdditionalMaterialParams) {
  log.info("Generating additional material");

  const result = await generateAdditionalMaterialObject({
    provider: "openai",
    parsedInput: {
      documentType: input.documentType,
      context: input.context,
    },
    action: input.action,
  });

  if (!result) {
    throw new Error("Failed to generate additional material");
  }

  const moderation = await generateAdditionalMaterialModeration({
    input: JSON.stringify(result),
    provider: "openai",
  });

  const { resourceId, documentType } = input;
  const version = additionalMaterialsConfigMap[documentType].version;

  const interaction = await prisma.interaction.create({
    data: {
      userId,
      config: {
        resourceType: documentType,
        resourceTypeVersion: version,
        adaptation: input.context.refinement,
      },
      adaptsOutputId:
        input.action === "refine" && resourceId ? resourceId : null,
      output: result,
      outputModeration: moderation,
      derivedFromId: input.lessonId,
    },
  });

  if (isToxic(moderation)) {
    log.error("Toxic content detected in moderation", moderation);
    return {
      resource: null,
      moderation,
      resourceId: interaction.id,
    };
  }

  return {
    resource: result,
    moderation,
    resourceId: interaction.id,
  };
}

interface GeneratePartialLessonPlanParams {
  prisma: PrismaClientWithAccelerate;
  userId: string;
  input: PartialLessonContextSchemaType;
}

function handleContentSafetyIssue({
  logMessage,
  threatDetection,
  lesson,
  lessonId,
  moderation,
}: {
  logMessage: string;
  threatDetection: boolean;
  lesson: LooseLessonPlan | null;
  lessonId: string;
  moderation: ModerationResult;
}) {
  log.error(logMessage, { moderation });
  return {
    threatDetection,
    lesson,
    lessonId,
    moderation,
  };
}

export async function generatePartialLessonPlan({
  prisma,
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

  const interaction = await prisma.interaction.create({
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
    return handleContentSafetyIssue({
      logMessage: "Toxic content detected in moderation",
      threatDetection: lakeraResult.flagged,
      lesson: null,
      lessonId: interaction.id,
      moderation,
    });
  }

  if (lakeraResult.flagged) {
    return handleContentSafetyIssue({
      logMessage: "Threat detected in input",
      threatDetection: true,
      lesson: null,
      lessonId: interaction.id,
      moderation,
    });
  }

  return {
    threatDetection: false,
    lesson,
    lessonId: interaction.id,
    moderation,
  };
}
