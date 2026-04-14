import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { isSafe } from "@oakai/core/src/utils/ailaModeration/safetyResult";
import { getDisplayCategories } from "@oakai/core/src/utils/ailaModeration/severityLevel";

import { OakBox, type OakBoxProps } from "@oaknational/oak-components";

import { ContentGuidanceBanner } from "@/components/AppComponents/Moderation/ContentGuidanceBanner";
import { useModerationStore } from "@/stores/AilaStoresProvider";
import type { ParsedMessage } from "@/stores/chatStore/types";

import { isModeration } from "./protocol";

export function getModeration(
  message: ParsedMessage,
  persistedModerations: PersistedModerationBase[],
) {
  const moderationMessagePart = message.parts.find(
    (m) => isModeration(m.document) && m.document?.id,
  )?.document as PersistedModerationBase | undefined;

  const messageId = message.id;

  const matchingPersistedModeration: PersistedModerationBase | undefined =
    persistedModerations.find((m) => m.messageId === messageId);

  const moderation = matchingPersistedModeration ?? moderationMessagePart;
  if (moderation && !isSafe(moderation)) {
    return moderation;
  }
  return null;
}

export function Moderation({
  forMessage,
  ...boxProps
}: Readonly<{ forMessage: ParsedMessage } & OakBoxProps>) {
  const persistedModerations = useModerationStore((state) => state.moderations);
  const moderation = getModeration(forMessage, persistedModerations);

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
