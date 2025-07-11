"use server";

import {
  additionalMaterialTypeEnum,
  additionalMaterialsConfigMap,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type {
  AilaPersistedChat,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { chatSchema } from "@oakai/aila/src/protocol/schema";
import type { Prisma } from "@oakai/db";
import { prisma } from "@oakai/db";

import * as Sentry from "@sentry/nextjs";

const OPENAI_AUTH_TOKEN = process.env.OPENAI_AUTH_TOKEN;

function parseChatAndReportError({
  sessionOutput,
  id,
  userId,
}: {
  sessionOutput: Prisma.JsonValue;
  id: string;
  userId: string;
}): AilaPersistedChat | undefined {
  if (typeof sessionOutput !== "object") {
    throw new Error("sessionOutput is not an object");
  }
  const parseResult = chatSchema.safeParse({
    ...sessionOutput,
    userId,
    id,
  });

  if (!parseResult.success) {
    const error = new Error("Failed to parse chat");
    Sentry.captureException(error, {
      extra: {
        id,
        userId,
        sessionOutput,
        zodError: parseResult.error.flatten(),
      },
    });
  }

  return parseResult.data;
}

export async function getChatById(
  id: string,
): Promise<AilaPersistedChat | null> {
  const session = await prisma?.appSession.findUnique({
    where: { id, deletedAt: null },
  });

  if (!session) {
    return null;
  }

  return (
    parseChatAndReportError({
      id,
      sessionOutput: session.output,
      userId: session.userId,
    }) ?? null
  );
}

export async function getSharedChatById(
  id: string,
): Promise<AilaPersistedChat | null> {
  const chat = await getChatById(id);

  if (!chat || !chat.isShared) {
    return null;
  }

  return chat;
}

export const createTeachingMaterialInteraction = async (
  input: { documentType: string },
  auth: { userId: string },
) => {
  const parsedDocType = additionalMaterialTypeEnum.parse(input.documentType);
  const version = additionalMaterialsConfigMap[parsedDocType]?.version;

  if (!version) {
    throw new Error(`Unknown document type: ${input.documentType}`);
  }

  const interaction = await prisma.additionalMaterialInteraction.create({
    data: {
      userId: auth.userId,
      config: {
        resourceType: parsedDocType,
        resourceTypeVersion: version,
      },
    },
  });

  return interaction;
};

export const createLessonPlanInteraction = async (
  auth: { userId: string },
  lesson: Partial<LooseLessonPlan>,
) => {
  const interaction = await prisma.additionalMaterialInteraction.create({
    data: {
      userId: auth.userId,
      config: {
        resourceType: "partial-lesson-plan-owa",
        resourceTypeVersion: 1,
      },
      output: lesson,
    },
  });

  return interaction;
};
