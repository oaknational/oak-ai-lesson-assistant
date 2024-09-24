import { useRef, useState } from "react";

import { getLastAssistantMessage } from "@oakai/aila/src/helpers/chat/getLastAssistantMessage";
import type { AilaUserModificationAction } from "@oakai/db";
import { OakBox, OakP, OakRadioGroup } from "@oaknational/oak-components";
import { TextArea } from "@radix-ui/themes";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { trpc } from "@/utils/trpc";

import ActionButton from "./action-button";
import { DropDownFormWrapper, FeedbackOption } from "./drop-down-form-wrapper";
import { SmallRadioButton } from "./small-radio-button";

const modifyOptions = [
  { label: "Make it easier", enumValue: "MAKE_IT_EASIER" },
  { label: "Make it harder", enumValue: "MAKE_IT_HARDER" },
  { label: "Shorten content", enumValue: "SHORTEN_CONTENT" },
  { label: "Add more detail", enumValue: "ADD_MORE_DETAIL" },
  { label: "Other", enumValue: "OTHER" },
] as const;

type ModifyButtonProps = {
  sectionTitle: string;
  sectionPath: string;
  sectionValue: Record<string, unknown> | string | Array<unknown>;
};

const ModifyButton = ({
  sectionTitle,
  sectionPath,
  sectionValue,
}: ModifyButtonProps) => {
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
    await Promise.all([
      append({
        content: `For the ${sectionTitle}, ${option.label === "Other" ? userFeedbackText : option.label}`,
        role: "user",
      }),
      recordUserModifySectionContent(),
    ]);
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
<<<<<<< HEAD
          title={`Ask Aila to modify ${section.toLowerCase()}:`}
=======
          title={`Ask Aila to modify ${sectionTitle.toLowerCase()}:`}
>>>>>>> main
          buttonText={"Modify section"}
          isOpen={isOpen}
          dropdownRef={dropdownRef}
        >
          <OakRadioGroup
            name={`drop-down-${modifyOptions[0].enumValue}`}
            $flexDirection="column"
            $gap="space-between-s"
            $background="white"
          >
            {modifyOptions.map((option) => {
              return (
<<<<<<< HEAD
                <>
                  <SmallRadioButton
                    id={`${id}-modify-options-${option.enumValue}`}
                    key={`${id}-modify-options-${option.enumValue}`}
                    value={option.enumValue}
                    label={handleLabelText({
                      text: option.label,
                      section,
                    })}
                    onClick={() => {
                      setSelectedRadio(option);
                    }}
                  />
                </>
=======
                <SmallRadioButton
                  id={`${id}-modify-options-${option.enumValue}`}
                  key={`${id}-modify-options-${option.enumValue}`}
                  value={option.enumValue}
                  label={handleLabelText({
                    text: option.label,
                    section: sectionTitle,
                  })}
                  onClick={() => {
                    setSelectedRadio(option);
                  }}
                />
>>>>>>> main
              );
            })}

            {selectedRadio?.label === "Other" && (
              <>
                <OakP $font="body-3">Provide details below:</OakP>
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

function handleLabelText({
  text,
  section,
}: {
  text: string;
  section: string;
}): string {
  if (
    section === "Misconceptions" ||
    section === "Keyword learning points" ||
    section === "Learning cycles"
  ) {
    if (text.includes("it")) {
      return text.replace("it", "them");
    }
  }
  return text;
}

export default ModifyButton;
