import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import LockingModerationView from "./locking-moderation-view";

export type ToxicModerationViewProps = Readonly<{
  chatId: string;
  moderation: PersistedModerationBase;
}>;

const ToxicModerationView = ({
  chatId,
  moderation,
}: ToxicModerationViewProps) => (
  <LockingModerationView
    chatId={chatId}
    moderation={moderation}
    heading="Potential misuse of Aila detected"
    body="Aila is designed to create classroom-appropriate content. This lesson has been identified as potentially unsuitable, preventing you from continuing to create this lesson. Continuing to generate inappropriate content will result in your account being blocked. If you believe this is an error, please provide feedback."
  />
);

export default ToxicModerationView;
