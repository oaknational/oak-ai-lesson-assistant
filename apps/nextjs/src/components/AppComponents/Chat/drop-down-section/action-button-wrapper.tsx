import { useRef, useState } from "react";

import { getLastAssistantMessage } from "@oakai/aila/src/helpers/chat/getLastAssistantMessage";
import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";

import { OakBox } from "@oaknational/oak-components";
import type { AilaUserModificationAction } from "@prisma/client";

import { ComponentType, type ComponentTypeValueType } from "@/lib/avo/Avo";
import {
  useChatActions,
  useChatStore,
  useLessonPlanStore,
  useLessonPlanTrackingActions,
} from "@/stores/AilaStoresProvider";
import { trpc } from "@/utils/trpc";

import ActionButton from "./action-button";
import type {
  AdditionalMaterialOptions,
  ModifyOptions,
} from "./action-button.types";
import { ActionDropDown } from "./action-drop-down";
import type { FeedbackOption } from "./drop-down-form-wrapper";

export type ActionButtonWrapperProps = Readonly<{
  sectionTitle: string;
  sectionPath: string;
  sectionValue: LessonPlanSectionWhileStreaming;
  options: ModifyOptions | AdditionalMaterialOptions;
  buttonText: string;
  actionButtonLabel: string;
  userSuggestionTitle: string;
  tooltip: string;
  generateMessage: (
    option: FeedbackOption<AilaUserModificationAction>,
    userFeedbackText: string,
  ) => string;
  trackingComponentType: ComponentTypeValueType;
}>;

const ActionButtonWrapper = ({
  sectionTitle,
  sectionPath,
  sectionValue,
  options,
  actionButtonLabel,
  tooltip,
  buttonText,
  userSuggestionTitle,
  generateMessage,
  trackingComponentType,
}: ActionButtonWrapperProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userFeedbackText, setUserFeedbackText] = useState("");
  const [selectedRadio, setSelectedRadio] =
    useState<FeedbackOption<AilaUserModificationAction> | null>(null);

  const id = useLessonPlanStore((state) => state.id);
  const { append } = useChatActions();
  const lessonPlanTracking = useLessonPlanTrackingActions();
  const { mutateAsync } = trpc.chat.chatFeedback.modifySection.useMutation();

  const messages = useChatStore((state) => state.stableMessages);
  // NOTE: The last assistant message will be streamingMessage if we allow selection during moderation
  const lastAssistantMessage = getLastAssistantMessage(messages);

  const recordUserModifySectionContent = async () => {
    if (selectedRadio && lastAssistantMessage) {
      const payload = {
        chatId: id,
        messageId: lastAssistantMessage.id,
        sectionPath,
        sectionValue: String(sectionValue),
        action: selectedRadio.enumValue,
        actionOtherText: userFeedbackText || null,
      };
      await mutateAsync(payload);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRadio) return;

    if (trackingComponentType === ComponentType.MODIFY_BUTTON) {
      lessonPlanTracking.clickedModify(selectedRadio, userFeedbackText);
    } else if (
      trackingComponentType === ComponentType.ADD_ADDITIONAL_MATERIALS_BUTTON
    ) {
      lessonPlanTracking.clickedAdditionalMaterials(
        selectedRadio,
        userFeedbackText,
      );
    }

    const message = generateMessage(selectedRadio, userFeedbackText);
    await Promise.all([
      append({ type: "message", content: message }),
      recordUserModifySectionContent(),
    ]);
    setIsOpen(false);
  };

  return (
    <OakBox $position="relative" ref={dropdownRef}>
      <ActionButton onClick={() => setIsOpen(!isOpen)} tooltip={tooltip}>
        {actionButtonLabel}
      </ActionButton>

      {isOpen && (
        <ActionDropDown
          sectionTitle={sectionTitle}
          options={options}
          selectedRadio={selectedRadio}
          setSelectedRadio={setSelectedRadio}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setUserFeedbackText={setUserFeedbackText}
          handleSubmit={handleSubmit}
          buttonText={buttonText}
          userSuggestionTitle={userSuggestionTitle}
          dropdownRef={dropdownRef}
          id={id}
        />
      )}
    </OakBox>
  );
};

export default ActionButtonWrapper;
