import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { getDisplayCategories } from "@oakai/core/src/utils/ailaModeration/severityLevel";

import { OakBox, type OakBoxProps } from "@oaknational/oak-components";

import { ContentGuidanceBanner } from "@/components/AppComponents/Moderation/ContentGuidanceBanner";

type ModerationMessageProps = Readonly<
  {
    moderation: ModerationResult | undefined;
  } & OakBoxProps
>;

export function ModerationMessage({
  moderation,
  ...boxProps
}: ModerationMessageProps) {
  if (!moderation?.categories.length) {
    return null;
  }

  return (
    <OakBox {...boxProps}>
      <ContentGuidanceBanner categories={getDisplayCategories(moderation)} />
    </OakBox>
  );
}
