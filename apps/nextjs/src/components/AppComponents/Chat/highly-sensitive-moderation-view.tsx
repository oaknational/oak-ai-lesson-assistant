import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import LockingModerationView from "./locking-moderation-view";

export type HighlySensitiveModerationViewProps = Readonly<{
  chatId: string;
  moderation: PersistedModerationBase;
}>;

const HighlySensitiveModerationView = ({
  chatId,
  moderation,
}: HighlySensitiveModerationViewProps) => (
  <LockingModerationView
    chatId={chatId}
    moderation={moderation}
    heading="Highly sensitive topic"
    body="Aila is not able to plan lessons on this topic. While important and potentially suitable for the classroom, some topics are too complex or sensitive for AI to reliably generate content on at the moment. Please consider planning lessons on a different topic or title."
  />
);

export default HighlySensitiveModerationView;
