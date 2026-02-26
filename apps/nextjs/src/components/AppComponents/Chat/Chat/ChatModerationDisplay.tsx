import React from "react";

import { getSafetyResult } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { Flex } from "@radix-ui/themes";

import HighlySensitiveModerationView from "../highly-sensitive-moderation-view";
import ToxicModerationView from "../toxic-moderation-view";

export type ModerationDisplayProps = Readonly<{
  lockingModeration: PersistedModerationBase | null;
  chatId: string;
}>;

export const ChatModerationDisplay: React.FC<ModerationDisplayProps> = ({
  lockingModeration,
  chatId,
}) => {
  if (!lockingModeration) return null;

  const safety = getSafetyResult(lockingModeration);

  return (
    <Flex width="100%" height="100%" justify="center" align="center" grow="1">
      {safety === "highly-sensitive" ? (
        <HighlySensitiveModerationView
          chatId={chatId}
          moderation={lockingModeration}
        />
      ) : (
        <ToxicModerationView chatId={chatId} moderation={lockingModeration} />
      )}
    </Flex>
  );
};
