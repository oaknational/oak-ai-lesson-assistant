import { generateAdditionalMaterialModeration } from "@oakai/additional-materials";
import {
  type AdditionalMaterialSchemas,
  type GenerateAdditionalMaterialInput,
  additionalMaterialsConfigMap,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { generateAdditionalMaterialObject } from "@oakai/additional-materials/src/documents/additionalMaterials/generateAdditionalMaterialObject";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import * as Sentry from "@sentry/nextjs";

import type { RateLimitInfo } from "../../types";
import { recordSafetyViolation } from "./safetyUtils";

const log = aiLogger("additional-materials");

type GenerateAdditionalMaterialParams = {
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

  const result = await generateAdditionalMaterialObject({
    provider: "openai",
    parsedInput: {
      documentType: input.documentType,
      context: input.context,
    },
    action: input.action,
  });

  if (!result) {
    const error = new Error(
      `Failed to generate additional material - Action: ${input.action} - Doctype: ${input.documentType} - lessonId ${input.lessonId}`,
    );
    Sentry.captureException(error);
  }

  const moderation = await generateAdditionalMaterialModeration({
    input: JSON.stringify(result),
    provider: "openai",
  });

  const { resourceId, documentType } = input;
  const version = additionalMaterialsConfigMap[documentType].version;

  const interaction = await prisma.additionalMaterialInteraction.create({
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
