import { useCallback, useRef, useState } from "react";

import type { AilaUserModificationAction } from "@oakai/db";
import { OakBox, OakRadioGroup } from "@oaknational/oak-components";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { trpc } from "@/utils/trpc";

import ActionButton from "./action-button";
import { DropDownFormWrapper, FeedbackOption } from "./drop-down-form-wrapper";
import { SmallRadioButton } from "./small-radio-button";

const modifyOptions: {
  label: string;
  enumValue: AilaUserModificationAction;
}[] = [
  {
    label: "Make it easier",
    enumValue: "MAKE_IT_EASIER",
  },
  {
    label: "Make it harder",
    enumValue: "MAKE_IT_HARDER",
  },
  {
    label: "Shorten content",
    enumValue: "SHORTEN_CONTENT",
  },
  {
    label: "Add more detail",
    enumValue: "ADD_MORE_DETAIL",
  },
  { label: "Other", enumValue: "OTHER" },
] as const;

const ModifyButton = ({
  section,
  sectionContent,
}: {
  section: string;
  sectionContent: string;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRadio, setSelectedRadio] =
    useState<FeedbackOption<AilaUserModificationAction> | null>(null);

  const chat = useLessonChat();
  const { append } = chat;

  const { id } = chat;

  const { mutateAsync } = trpc.chat.appSessions.modifySection.useMutation();

  const lastAssistantMessage = chat.messages[chat.messages.length - 1];

  const recordUserModifySectionContent = useCallback(async () => {
    console.log("sectionContent", sectionContent);
    console.log("selectedRadio", selectedRadio);
    console.log("lastAssistentMessage", lastAssistantMessage);
    if (selectedRadio && lastAssistantMessage) {
      const payload = {
        chatId: id,
        messageId: lastAssistantMessage.id,
        textForMod: sectionContent,
        action: selectedRadio.enumValue,
      };
      await mutateAsync(payload);
    }
  }, [selectedRadio, sectionContent, mutateAsync, id, lastAssistantMessage]);

  async function modifySection(
    option: FeedbackOption<AilaUserModificationAction>,
  ) {
    await append({
      content: `For the ${section}, ${option.label}`,
      role: "user",
    });
    await recordUserModifySectionContent();
  }

  return (
    <OakBox $position="relative" ref={dropdownRef}>
      <ActionButton
        onClick={() => setIsOpen(!isOpen)}
        tooltip="Aila can help improve this section"
      >
        Modify
      </ActionButton>

      {isOpen && (
        <DropDownFormWrapper
          onClickActions={modifySection}
          setIsOpen={setIsOpen}
          selectedRadio={selectedRadio}
          title={"Ask Aila to modify learning outcome:"}
          buttonText={"Modify section"}
          isOpen={isOpen}
          dropdownRef={dropdownRef}
        >
          <OakRadioGroup
            name={`drop-down-${modifyOptions[0]}`}
            $flexDirection="column"
            $gap="space-between-s"
            $background="white"
          >
            {modifyOptions.map((option) => (
              <SmallRadioButton
                id={`${id}-modify-options-${option.enumValue}`}
                key={`${id}-modify-options-${option.enumValue}`}
                value={option.enumValue}
                label={option.label}
                onClick={() => {
                  setSelectedRadio(option);
                }}
              />
            ))}
          </OakRadioGroup>
        </DropDownFormWrapper>
      )}
    </OakBox>
  );
};

export default ModifyButton;
