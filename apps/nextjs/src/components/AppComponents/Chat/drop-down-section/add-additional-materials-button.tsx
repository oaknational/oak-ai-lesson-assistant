import { useEffect, useRef, useState } from "react";

import { getLastAssistantMessage } from "@oakai/aila/src/helpers/chat/getLastAssistantMessage";
import type { AilaUserModificationAction } from "@oakai/db";
import { OakBox, OakP, OakRadioGroup } from "@oaknational/oak-components";
import { TextArea } from "@radix-ui/themes";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { trpc } from "@/utils/trpc";

import ActionButton from "./action-button";
import { DropDownFormWrapper, FeedbackOption } from "./drop-down-form-wrapper";
import { SmallRadioButton } from "./small-radio-button";

const additionalMaterialsModifyOptions = [
  {
    label: "Add a homework task",
    enumValue: "ADD_HOMEWORK_TASK",
    chatMessage: "Add a homework task to the additional materials section",
  },
  {
    label: "Add a narrative for my explanation",
    enumValue: "ADD_NARRATIVE",
    chatMessage:
      "Add a narrative for my explanation to the additional materials section",
  },
  {
    label: "Add additional practice questions",
    enumValue: "ADD_PRACTICE_QUESTIONS",
    chatMessage:
      "Add additional practice questions to the additional materials section",
  },
  {
    label: "Translate keywords into another language",
    enumValue: "TRANSLATE_KEYWORDS",
    chatMessage:
      "Translate the keywords into another language and add to the additional materials section",
  },
  {
    label: "Add practical instructions",
    enumValue: "ADD_PRACTICAL_INSTRUCTIONS",
    chatMessage:
      "Add practical instructions to the additional materials section",
  },
  {
    label: "Other",
    enumValue: "OTHER",
    chatMessage:
      "Other (ask the user what other additional materials they would like to create)",
  },
] as const;

type AddAdditionalMaterialsButtonProps = {
  sectionTitle: string;
  sectionPath: string;
  sectionValue: Record<string, unknown> | string | Array<unknown>;
};

const AddAdditionalMaterialsButton = ({
  sectionTitle,
  sectionPath,
  sectionValue,
}: AddAdditionalMaterialsButtonProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userFeedbackText, setUserFeedbackText] = useState("");
  const [selectedRadio, setSelectedRadio] =
    useState<FeedbackOption<AilaUserModificationAction> | null>(null);

  const chat = useLessonChat();
  const { append } = chat;
  const { id, messages } = chat;
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

  async function modifySection(
    option: FeedbackOption<AilaUserModificationAction>,
  ) {
    const message =
      option.label === "Other"
        ? `For the ${sectionTitle}, ${userFeedbackText}`
        : `Add ${option.chatMessage?.toLowerCase()} to the additional materials section`;

    await Promise.all([
      append({
        content: message,
        role: "user",
      }),
      recordUserModifySectionContent(),
    ]);
  }

  return (
    <OakBox $position="relative" ref={dropdownRef}>
      <ActionButton
        onClick={() => setIsOpen(!isOpen)}
        tooltip="Aila can help add additional materials"
      >
        Add additional materials
      </ActionButton>

      {isOpen && (
        <DropDownFormWrapper
          onClickActions={modifySection}
          setIsOpen={setIsOpen}
          selectedRadio={selectedRadio}
          title={"Ask Aila to add:"}
          buttonText={"Add materials"}
          isOpen={isOpen}
          dropdownRef={dropdownRef}
        >
          <OakRadioGroup
            name={`drop-down-${additionalMaterialsModifyOptions[0].enumValue}`}
            $flexDirection="column"
            $gap="space-between-s"
            $background="white"
          >
            {additionalMaterialsModifyOptions.map((option) => {
              return (
                <SmallRadioButton
                  id={`${id}-modify-options-${option.enumValue}`}
                  key={`${id}-modify-options-${option.enumValue}`}
                  value={option.enumValue}
                  label={option.label}
                  onClick={() => {
                    setSelectedRadio(option);
                  }}
                />
              );
            })}

            {selectedRadio?.label === "Other" && (
              <>
                <OakP $font="body-3">
                  What type of additional materials would you like to add?
                </OakP>
                <TextArea
                  onChange={(e) => setUserFeedbackText(e.target.value)}
                />
              </>
            )}
          </OakRadioGroup>
        </DropDownFormWrapper>
      )}
    </OakBox>
  );
};

export default AddAdditionalMaterialsButton;
