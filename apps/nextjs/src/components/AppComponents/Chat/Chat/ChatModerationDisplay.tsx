import React from "react";

import {
  type SafetyResult,
  getSafetyResult,
} from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { useRouter } from "next/navigation";

import { LockingModerationModal } from "../locking-moderation-modal";

const getLockingModerationModalText = (safety: SafetyResult) => {
  if (safety === "highly-sensitive") {
    return {
      heading: "Highly sensitive topic",
      body: "Aila is not able to plan lessons on this topic. While important and potentially suitable for the classroom, some topics are too complex or sensitive for AI to reliably generate content on at the moment. Please consider planning lessons on a different topic or title. If you believe this is an error, please ",
    };
  }

  return {
    heading: "Potential misuse of Aila detected",
    body: "Aila is designed to create classroom-appropriate content. This lesson has been identified as potentially unsuitable, preventing you from continuing to create this lesson. Continuing to generate inappropriate content will result in your account being blocked. If you believe this is an error, please ",
  };
};

export type ModerationDisplayProps = Readonly<{
  lockingModeration: PersistedModerationBase | null;
  chatId: string;
}>;

export const ChatModerationDisplay: React.FC<ModerationDisplayProps> = ({
  lockingModeration,
  chatId,
}) => {
  const router = useRouter();
  if (!lockingModeration) return null;

  const safety = getSafetyResult(lockingModeration);

  const handleClose = () => {
    router.push("/aila");
  };

  return (
    <LockingModerationModal
      chatId={chatId}
      moderation={lockingModeration}
      heading={getLockingModerationModalText(safety).heading}
      body={getLockingModerationModalText(safety).body}
      open={true}
      onClose={handleClose}
    />
  );
};
