import { useRef, useState } from "react";

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

const ModifyButton = ({
  section,
  sectionContent,
}: {
  section: string;
  sectionContent: string;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userFeedbackText, setUserFeedbackText] = useState("");
  const [selectedRadio, setSelectedRadio] =
    useState<FeedbackOption<AilaUserModificationAction> | null>(null);

  const chat = useLessonChat();
  const { append } = chat;

  const { id, messages } = chat;

  const { mutateAsync } = trpc.chat.appSessions.modifySection.useMutation();

  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];

  const recordUserModifySectionContent = async () => {
    if (selectedRadio && lastAssistantMessage) {
      const payload = {
        chatId: id,
        messageId: lastAssistantMessage.id,
        textForMod: sectionContent,
        action: selectedRadio.enumValue,
      };
      await mutateAsync(payload);
    }
  };

  async function modifySection(
    option: FeedbackOption<AilaUserModificationAction>,
  ) {
    await Promise.all([
      append({
        content: `For the ${section}, ${option.label === "Other" ? userFeedbackText : option.label}`,
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
          title={`Ask Aila to modify ${section}:`}
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
              console.log("selectedRadio", selectedRadio);
              return (
                <>
                  <SmallRadioButton
                    id={`${id}-modify-options-${option.enumValue}`}
                    key={`${id}-modify-options-${option.enumValue}`}
                    value={option.enumValue}
                    label={option.label}
                    onClick={() => {
                      setSelectedRadio(option);
                    }}
                  />
                </>
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

export default ModifyButton;
