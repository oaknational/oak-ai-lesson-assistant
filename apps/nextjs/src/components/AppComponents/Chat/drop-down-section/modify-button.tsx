import { useRef, useState } from "react";

import {
  OakBox,
  OakRadioButton,
  OakRadioGroup,
  OakSpan,
  OakTertiaryButton,
} from "@oaknational/oak-components";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";

import ActionButton from "./action-button";
import { DropDownFormWrapper } from "./drop-down-form-wrapper";

const ModifyButton = ({ section }: { section: string }) => {
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

  async function appendToChat(value: string) {
    await append({
      id: "lessonPlan",
      content: `For the ${section}, ${value}`,
      role: "user",
    });
  }

  return (
    <OakBox $position="relative" ref={dropdownRef}>
      <ActionButton
        onClick={() => setIsOpen(!isOpen)}
        tooltip="Aila can help improve this section"
      >
        Modify {section}
      </ActionButton>

      {isOpen && (
        <DropDownFormWrapper
          onClickActions={appendToChat}
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
            $gap="space-between-m"
            $background="white"
          >
            {modifyOptions.map((option) => (
              <OakRadioButton
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
