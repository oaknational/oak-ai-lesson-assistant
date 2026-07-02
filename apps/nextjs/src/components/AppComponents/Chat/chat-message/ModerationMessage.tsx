import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { isSafe } from "@oakai/core/src/utils/ailaModeration/safetyResult";
import { getDisplayCategories } from "@oakai/core/src/utils/ailaModeration/severityLevel";

import { OakBox, type OakBoxProps } from "@oaknational/oak-components";

import { ContentGuidanceBanner } from "@/components/AppComponents/Moderation/ContentGuidanceBanner";
import type { ParsedMessage } from "@/stores/chatStore/types";

import { isModeration } from "./protocol";

function getMessageModeration(
  message: ParsedMessage,
  persistedModerations: PersistedModerationBase[],
) {
  const moderationMessagePart = message.parts.find(
    (m) => isModeration(m.document) && m.document?.id,
  )?.document as PersistedModerationBase | undefined;

  const messageId = message.id;

  const matchingPersistedModeration: PersistedModerationBase | undefined =
    persistedModerations.find((m) => m.messageId === messageId);

  return matchingPersistedModeration ?? moderationMessagePart ?? null;
}

function moderationSignature(moderation: PersistedModerationBase): string {
  return getDisplayCategories(moderation)
    .map((category) => category.code)
    .sort()
    .join("|");
}

export function getModerationsToDisplay(
  messages: ParsedMessage[],
  persistedModerations: PersistedModerationBase[],
): Map<string, PersistedModerationBase> {
  const moderationsToDisplay = new Map<string, PersistedModerationBase>();
  let previousSignature: string | null = null;

  for (const message of messages) {
    const moderation = getMessageModeration(message, persistedModerations);
    if (!moderation) {
      continue;
    }

    if (isSafe(moderation)) {
      previousSignature = null;
      continue;
    }

    const signature = moderationSignature(moderation);
    if (signature !== previousSignature) {
      moderationsToDisplay.set(message.id, moderation);
    }
    previousSignature = signature;
  }

  return moderationsToDisplay;
}

export function Moderation({
  moderation,
  ...boxProps
}: Readonly<{ moderation: PersistedModerationBase | null } & OakBoxProps>) {
  if (!moderation) {
    return null;
  }

  const categories = getDisplayCategories(moderation);

  return (
    <OakBox {...boxProps}>
      <ContentGuidanceBanner categories={categories} />
    </OakBox>
  );
}
