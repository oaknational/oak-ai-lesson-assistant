import { useState } from "react";

import {
  type SeverityLevel,
  getDisplayCategories,
  getHighestSeverity,
  isSafe,
} from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { OakIcon } from "@oaknational/oak-components";

import { useModerationStore } from "@/stores/AilaStoresProvider";
import type { ParsedMessage } from "@/stores/chatStore/types";

import { ContentGuidanceModal } from "../content-guidance-modal";
import { Message } from "./layout";
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

const severityDisplay: Record<SeverityLevel, { banner: string; link: string }> =
  {
    "content-guidance": {
      banner:
        "The content in this lesson may require additional consideration before delivery.",
      link: "View content guidance",
    },
    "enhanced-scrutiny": {
      banner: "This lesson includes content that requires enhanced scrutiny.",
      link: "View details",
    },
    "heightened-caution": {
      banner:
        "This lesson includes content that requires heightened professional caution.",
      link: "View details",
    },
  };

function getSeverityDisplay(categories: { severityLevel: string }[]) {
  return severityDisplay[getHighestSeverity(categories)];
}

export function Moderation({
  forMessage,
}: Readonly<{ forMessage: ParsedMessage }>) {
  const persistedModerations = useModerationStore((state) => state.moderations);
  const moderation = getModeration(forMessage, persistedModerations);
  const [modalOpen, setModalOpen] = useState(false);

  if (!moderation) {
    return null;
  }

  const categories = getDisplayCategories(moderation);
  const { banner, link } = getSeverityDisplay(categories);

  return (
    <>
      <Message.Container roleType="moderation">
        <Message.Content>
          <div className="flex items-center">
            <span className="mr-6 flex-shrink-0">
              <OakIcon iconName="info" alt="" />
            </span>
            <aside className="pt-3 text-sm">
              {banner}{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalOpen(true);
                }}
                className="underline"
              >
                {link}
              </a>
            </aside>
          </div>
        </Message.Content>
      </Message.Container>
      <ContentGuidanceModal
        categories={categories}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
