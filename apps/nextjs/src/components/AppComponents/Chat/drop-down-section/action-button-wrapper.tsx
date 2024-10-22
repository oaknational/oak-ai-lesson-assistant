import { useRef, useState } from "react";

import { getLastAssistantMessage } from "@oakai/aila/src/helpers/chat/getLastAssistantMessage";
import { OakBox } from "@oaknational/oak-components";
import { AilaUserModificationAction } from "@prisma/client";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { trpc } from "@/utils/trpc";

import ActionButton from "./action-button";
import {
  AdditionalMaterialOptions,
  ModifyOptions,
} from "./action-button.types";
import { ActionDropDown } from "./action-drop-down";
import { FeedbackOption } from "./drop-down-form-wrapper";

type ActionButtonWrapperProps = {
  sectionTitle: string;
  sectionPath: string;
  sectionValue: Record<string, unknown> | string | Array<unknown>;
  options: ModifyOptions | AdditionalMaterialOptions;
  buttonText: string;
  actionButtonLabel: string;
  userSuggestionTitle: string;
  tooltip: string;
  generateMessage: (
    option: FeedbackOption<AilaUserModificationAction>,
    userFeedbackText: string,
  ) => string;
};

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
}: ActionButtonWrapperProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userFeedbackText, setUserFeedbackText] = useState("");
  const [selectedRadio, setSelectedRadio] =
    useState<FeedbackOption<AilaUserModificationAction> | null>(null);

  const chat = useLessonChat();
  const { append, id, messages } = chat;
  const { mutateAsync } = trpc.chat.chatFeedback.modifySection.useMutation();

  const lastAssistantMessage = getLastAssistantMessage(messages);

  const recordUserModifySectionContent = async () => {
    if (selectedRadio && lastAssistantMessage) {
      const payload = {
        chatId: id,
        messageId: lastAssistantMessage.id,
        sectionPath,
        sectionValue,
        action: selectedRadio.enumValue,
        actionOtherText: userFeedbackText || null,
      };
      await mutateAsync(payload);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRadio) return;
    const message = generateMessage(selectedRadio, userFeedbackText);
    await Promise.all([
      append({ content: message, role: "user" }),
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
          userFeedbackText={userFeedbackText}
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
