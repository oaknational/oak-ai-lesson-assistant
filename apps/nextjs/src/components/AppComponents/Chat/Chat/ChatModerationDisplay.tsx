import React from "react";

import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import {
  type LockingSafetyResult,
  getSafetyResult,
  isLockingSafetyResult,
} from "@oakai/core/src/utils/ailaModeration/safetyResult";

import { useRouter } from "next/navigation";
import invariant from "tiny-invariant";

import { LockingModerationModal } from "../locking-moderation-modal";

export const lockingModerationModalTextMap: Record<
  LockingSafetyResult,
  { heading: string; body: string }
> = {
  "highly-sensitive": {
    heading: "Highly sensitive topic",
    body: "Aila is not able to plan lessons on this topic. While important and potentially suitable for the classroom, some topics are too complex or sensitive for AI to reliably generate content on at the moment. Please consider planning lessons on a different topic or title. If you believe this is an error, please ",
  },
  toxic: {
    heading: "Potential misuse of Aila detected",
    body: "Aila is designed to create classroom-appropriate content. This lesson has been identified as potentially unsuitable, preventing you from continuing to create this lesson. Continuing to generate inappropriate content will result in your account being blocked. If you believe this is an error, please ",
  },
};

export type ModerationDisplayProps = Readonly<{
  lockingModeration: PersistedModerationBase;
  chatId: string;
}>;

export const ChatModerationDisplay: React.FC<ModerationDisplayProps> = ({
  lockingModeration,
  chatId,
}) => {
  const router = useRouter();
  const safety = getSafetyResult(lockingModeration);

  invariant(
    isLockingSafetyResult(safety),
    `ChatModerationDisplay rendered with non-locking safety result: "${safety}"`,
  );

  const modalText = lockingModerationModalTextMap[safety];

  const handleClose = () => {
    router.push("/aila");
  };

  return (
    <LockingModerationModal
      chatId={chatId}
      moderation={lockingModeration}
      heading={modalText.heading}
      body={modalText.body}
      open={true}
      onClose={handleClose}
    />
  );
};
