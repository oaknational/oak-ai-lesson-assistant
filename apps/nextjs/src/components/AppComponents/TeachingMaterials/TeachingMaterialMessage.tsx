import { useState } from "react";

import { getDisplayCategories } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { OakFlex, OakIcon, OakLink, OakP } from "@oaknational/oak-components";

import { Message } from "../Chat/chat-message/layout";
import { ContentGuidanceModal } from "../Chat/content-guidance-modal";
import { useDialog } from "../DialogContext";

export function ModerationMessage({
  moderation,
}: {
  moderation: ModerationResult | undefined;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!moderation) {
    return null;
  }
  return (
    <>
      <Message.Container roleType="moderation">
        <Message.Content>
          <OakFlex $alignItems={"center"}>
            <OakIcon $colorFilter="black" iconName="info" alt="" />
            <OakP $ml="spacing-12" $font={"body-3"}>
              {`This lesson may need additional `}
              <OakLink
                element="button"
                aria-label="Open content guidance dialog"
                onClick={() => setModalOpen(true)}
                color={"primary"}
              >
                content guidance.
              </OakLink>
            </OakP>
          </OakFlex>
        </Message.Content>
      </Message.Container>
      <ContentGuidanceModal
        categories={getDisplayCategories(moderation)}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
