import { useState } from "react";

import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { isSafe } from "@oakai/core/src/utils/ailaModeration/safetyResult";
import {
  type SeverityLevel,
  getDisplayCategories,
  getHighestSeverity,
} from "@oakai/core/src/utils/ailaModeration/severityLevel";

import {
  OakBox,
  type OakBoxProps,
  OakInlineBanner,
  OakSecondaryLink,
} from "@oaknational/oak-components";

import { useModerationStore } from "@/stores/AilaStoresProvider";
import type { ParsedMessage } from "@/stores/chatStore/types";

import { ContentGuidanceModal } from "../content-guidance-modal";
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

const severityDisplay: Record<
  SeverityLevel,
  { bannerText: string; linkText: string }
> = {
  "content-guidance": {
    bannerText:
      "The content in this lesson may require additional consideration before delivery.",
    linkText: "View content guidance.",
  },
  "enhanced-scrutiny": {
    bannerText: "This lesson includes content that requires enhanced scrutiny.",
    linkText: "View details.",
  },
  "heightened-caution": {
    bannerText:
      "This lesson includes content that requires heightened professional caution.",
    linkText: "View details.",
  },
};

function getSeverityDisplay(categories: { severityLevel: string }[]) {
  return severityDisplay[getHighestSeverity(categories)];
}

export function Moderation({
  forMessage,
  ...boxProps
}: Readonly<{ forMessage: ParsedMessage } & OakBoxProps>) {
  const persistedModerations = useModerationStore((state) => state.moderations);
  const moderation = getModeration(forMessage, persistedModerations);
  const [modalOpen, setModalOpen] = useState(false);

  if (!moderation) {
    return null;
  }

  const categories = getDisplayCategories(moderation);
  const { bannerText, linkText } = getSeverityDisplay(categories);

  return (
    <OakBox {...boxProps}>
      <OakInlineBanner
        isOpen
        type="alert"
        icon="info"
        message={bannerText}
        title="Content guidance"
        cta={
          <OakSecondaryLink
            element="button"
            onClick={() => setModalOpen(true)}
            iconName="chevron-right"
            isTrailingIcon
          >
            {linkText}
          </OakSecondaryLink>
        }
      />
      <ContentGuidanceModal
        categories={categories}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </OakBox>
  );
}
