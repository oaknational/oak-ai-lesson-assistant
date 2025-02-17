import { isSafe } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { useChatModeration } from "@/components/ContextProviders/ChatModerationContext";
import { Icon } from "@/components/Icon";
import { useModerationStore } from "@/stores/AilaStoresProvider";
import type { ParsedMessage } from "@/stores/chatStore/types";

import { Message } from ".";
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
}: Readonly<{ forMessage: ParsedMessage }>) {
  const persistedModerations = useModerationStore((state) => state.moderations);
  const moderation = getModeration(forMessage, persistedModerations);
  const { moderationModalHelpers } = useChatModeration();

  if (!moderation) {
    return null;
  }

  return (
    <Message.Container roleType="moderation">
      <Message.Content>
        <div className="flex items-center">
          <Icon icon="warning" size="sm" className="mr-6" />
          <aside className="pt-3 text-sm">
            <a
              href="#"
              onClick={() => {
                moderationModalHelpers.openModal({
                  moderation,
                  closeModal: moderationModalHelpers.closeModal,
                });
              }}
              className="underline"
            >
              View content guidance
            </a>
          </aside>
        </div>
      </Message.Content>
    </Message.Container>
  );
}
