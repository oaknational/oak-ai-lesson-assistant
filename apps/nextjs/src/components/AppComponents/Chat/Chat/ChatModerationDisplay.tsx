import React from "react";

import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { Flex } from "@radix-ui/themes";

import ToxicModerationView from "../toxic-moderation-view";

export type ModerationDisplayProps = Readonly<{
  toxicModeration: PersistedModerationBase | null;
  chatId: string;
}>;

export const ChatModerationDisplay: React.FC<ModerationDisplayProps> = ({
  toxicModeration,
  chatId,
}) => {
  if (!toxicModeration) return null;

  return (
    <Flex width="100%" height="100%" justify="center" align="center" grow="1">
      <ToxicModerationView chatId={chatId} moderation={toxicModeration} />
    </Flex>
  );
};
