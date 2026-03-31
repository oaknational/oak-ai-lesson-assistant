import {
  getSafetyResult,
  isHighlySensitive,
  isToxic,
} from "@oakai/core/src/utils/ailaModeration/helpers";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { useRouter } from "next/navigation";

import { getLockingModerationModalText } from "@/components/AppComponents/Chat/Chat/ChatModerationDisplay";
import { LockingModerationModalTeachingMaterials } from "@/components/AppComponents/Chat/locking-moderation-modal-teaching-materials";

type TeachingMaterialsLockingModerationModalProps = {
  moderation: ModerationResult | undefined;
};

export function TeachingMaterialsLockingModerationModal({
  moderation,
}: TeachingMaterialsLockingModerationModalProps) {
  const router = useRouter();

  if (!moderation || (!isToxic(moderation) && !isHighlySensitive(moderation))) {
    return null;
  }

  const { heading, body } = getLockingModerationModalText(
    getSafetyResult(moderation),
  );

  return (
    <LockingModerationModalTeachingMaterials
      open
      onClose={() => router.push("/aila")}
      heading={heading}
      body={body}
    />
  );
}
