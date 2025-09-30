import { generateAdditionalMaterialModeration } from "@oakai/additional-materials";
import {
  type AdditionalMaterialSchemas,
  type GenerateAdditionalMaterialInput,
  additionalMaterialsConfigMap,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { generateAdditionalMaterialObject } from "@oakai/additional-materials/src/documents/additionalMaterials/generateAdditionalMaterialObject";
import { resourceTypesConfig } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { baseQuizSchema } from "@oakai/additional-materials/src/documents/additionalMaterials/sharedSchema";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import * as Sentry from "@sentry/nextjs";
import { pick } from "remeda";

import type { RateLimitInfo } from "../../types";
import { recordSafetyViolation } from "./safetyUtils";

const log = aiLogger("additional-materials");

/**
 * Deterministically shuffles quiz options within each question while keeping question order stable
 */
function shuffleQuizOptions(quiz: ReturnType<typeof baseQuizSchema.parse>) {
  // Deterministic hash (mirrors approach used in quiz-utils)
  const simpleHash = (str: string) => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // force 32-bit int
    }
    return Math.abs(hash);
  };

  // Shuffle the options within each question deterministically,
  // keeping question order stable.
  const questionsWithShuffledOptions = quiz.questions.map((q) => {
    const shuffledOptions = [...q.options]
      .map((opt) => ({
        ...opt,
        _sortKey: simpleHash(`${q.question}|${opt.text}`),
      }))
      .sort((a, b) => a._sortKey - b._sortKey)
      .map(({ _sortKey, ...opt }) => opt);

    return { ...q, options: shuffledOptions };
  });

  return {
    ...quiz,
    questions: questionsWithShuffledOptions,
  };
}

export type GenerateAdditionalMaterialParams = {
  prisma: PrismaClientWithAccelerate;
  auth: SignedInAuthObject;
  rateLimit: RateLimitInfo;
  userId: string;
  input: GenerateAdditionalMaterialInput & {
    lessonId?: string | null;
  };
};

export type GenerateAdditionalMaterialResponse = {
  resource: AdditionalMaterialSchemas | null;
  moderation: ModerationResult;
  resourceId: string;
};

/**s
 * Generates additional educational material based on the provided input
 */
export async function generateAdditionalMaterial({
  prisma,
  userId,
  input,
  auth,
  rateLimit,
}: GenerateAdditionalMaterialParams) {
  log.info("Generating additional material");
  const resourceTypes = resourceTypesConfig[input.documentType];
  const lessonPartsToUse =
    input.source === "aila"
      ? resourceTypes.lessonParts
      : resourceTypes.owaLessonParts;

  const lesson = pick(input.context.lessonPlan, [
    "title",
    "year",
    "keyStage",
    "subject",
    "topic",
    ...lessonPartsToUse,
  ]);

  log.info(
    "Lesson parts  used in generation",
    JSON.stringify(lessonPartsToUse),
  );
  let result: AdditionalMaterialSchemas;
  result = await generateAdditionalMaterialObject({
    provider: "openai",
    parsedInput: {
      documentType: input.documentType,
      context: { ...input.context, lessonPlan: lesson },
    },
  });

  if (!result) {
    const error = new Error(
      `Failed to generate additional material -  Doctype: ${input.documentType} - lessonId ${input.lessonId}`,
    );
    Sentry.captureException(error);
    throw error;
  }

  if (
    input.documentType === "additional-starter-quiz" ||
    input.documentType === "additional-exit-quiz"
  ) {
    const quiz = baseQuizSchema.parse(result);
    result = shuffleQuizOptions(quiz);
  }
  const moderation = await generateAdditionalMaterialModeration({
    input: JSON.stringify(result),
    provider: "openai",
  });

  if (!moderation) {
    const error = new Error(
      `Failed to generate moderation -  Doctype: ${input.documentType} - lessonId ${input.lessonId}`,
    );
    Sentry.captureException(error);
    throw error;
  }

  const { resourceId, adaptsOutputId, documentType } = input;
  const version = additionalMaterialsConfigMap[documentType].version;
  let interaction: { id: string };

  if (resourceId) {
    log.info("Updating existing additional material interaction", {
      resourceId,
      adaptsOutputId,
      documentType,
      version,
    });

    interaction = await prisma.additionalMaterialInteraction.update({
      where: { id: resourceId },
      data: {
        adaptsOutputId: adaptsOutputId ?? null,
        output: result,
        outputModeration: moderation,
        derivedFromId: input.lessonId,
      },
    });
  } else {
    log.info("Creating new additional material interaction", {
      adaptsOutputId,
      documentType,
      version,
    });
    // CREATE: Make new record for adapted materials - adaptsOutputId
    interaction = await prisma.additionalMaterialInteraction.create({
      data: {
        userId,
        config: {
          resourceType: documentType,
          resourceTypeVersion: version,
          adaptation: input.context.refinement,
        },
        adaptsOutputId: adaptsOutputId ?? null,
        output: result,
        outputModeration: moderation,
        derivedFromId: input.lessonId,
      },
    });
  }

  if (isToxic(moderation)) {
    await recordSafetyViolation({
      prisma,
      auth,
      interactionId: interaction.id,
      violationType: "MODERATION",
      userAction: "ADDITIONAL_MATERIAL_GENERATION",
      moderation,
    });

    log.error("Toxic content detected in moderation", moderation);
    return {
      resource: null,
      moderation,
      resourceId: interaction.id,
      rateLimit,
    };
  }

  return {
    resource: result,
    moderation,
    resourceId: interaction.id,
    rateLimit,
  };
}
