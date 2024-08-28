import { useCallback, useRef, useState } from "react";

import { OakBox, OakRadioGroup } from "@oaknational/oak-components";
import { AilaUserModificationAction } from "@prisma/client";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { trpc } from "@/utils/trpc";

import ActionButton from "./action-button";
import { DropDownFormWrapper } from "./drop-down-form-wrapper";
import { SmallRadioButton } from "./small-radio-button";

const ModifyButton = ({
  section,
  sectionContent,
}: {
  section: string;
  sectionContent: string;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState<string | null>(null);
  const modifyOptions = [
    "Make it easier",
    "Make it harder",
    "Shorten content",
    "Add more detail",
    "Other",
  ];
  const chat = useLessonChat();
  const { append } = chat;

  const { id } = chat;

  const { mutateAsync } = trpc.chat.appSessions.modifySection.useMutation();

  const recordUserModifySectionContent = useCallback(async () => {
    if (selectedRadio) {
      const payload = {
        chatId: id,
        messageId: "asdf",
        textForMod: sectionContent,
        action: selectedRadio
          .toUpperCase()
          .replace(" ", "_") as AilaUserModificationAction,
      };
      await mutateAsync(payload);
    }
  }, [selectedRadio, sectionContent, mutateAsync, id]);

  async function modifySection(value: string) {
    await append({
      content: `For the ${section}, ${value}`,
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
                id={option}
                key={option}
                value={option}
                label={option}
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
