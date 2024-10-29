import { useEffect, useRef, useState } from "react";

import { getLastAssistantMessage } from "@oakai/aila/src/helpers/chat/getLastAssistantMessage";
import { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";
import type { AilaUserFlagType } from "@oakai/db";
import { OakBox, OakP, OakRadioGroup } from "@oaknational/oak-components";
import styled from "styled-components";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { trpc } from "@/utils/trpc";

import ActionButton from "./action-button";
import type { FeedbackOption } from "./drop-down-form-wrapper";
import { DropDownFormWrapper } from "./drop-down-form-wrapper";
import { SmallRadioButton } from "./small-radio-button";

const flagOptions = [
  { label: "Inappropriate", enumValue: "INAPPROPRIATE" },
  { label: "Inaccurate", enumValue: "INACCURATE" },
  { label: "Too hard", enumValue: "TOO_HARD" },
  { label: "Too easy", enumValue: "TOO_EASY" },
  { label: "Other", enumValue: "OTHER" },
] as const;

type FlagButtonOptions = typeof flagOptions;

type FlagButtonProps = {
  sectionTitle: string;
  sectionPath: string;
  sectionValue: LessonPlanSectionWhileStreaming;
};

const FlagButton = ({
  sectionTitle,
  sectionPath,
  sectionValue,
}: FlagButtonProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRadio, setSelectedRadio] =
    useState<FeedbackOption<AilaUserFlagType> | null>(null);
  const [displayTextBox, setDisplayTextBox] = useState<string | null>(null);

  const [userFeedbackText, setUserFeedbackText] = useState("");
  const chat = useLessonChat();

  const { id, messages } = chat;
  const lastAssistantMessage = getLastAssistantMessage(messages);

  const { mutateAsync } = trpc.chat.chatFeedback.flagSection.useMutation();

  const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  };

  const prepareSectionValue = (
    value: LessonPlanSectionWhileStreaming,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): string | any[] | Record<string, unknown> => {
    if (
      typeof value === "string" ||
      Array.isArray(value) ||
      isPlainObject(value)
    ) {
      return value;
    }
    // For numbers or any other types, convert to string
    return String(value);
  };

  const flagSectionContent = async () => {
    if (selectedRadio && lastAssistantMessage) {
      const payload = {
        chatId: id,
        messageId: lastAssistantMessage.id,
        flagType: selectedRadio.enumValue,
        userComment: userFeedbackText,
        sectionPath,
        sectionValue: prepareSectionValue(sectionValue),
      };
      await mutateAsync(payload);
    }
  };

  useEffect(() => {
    !isOpen && setDisplayTextBox(null);
  }, [isOpen, setDisplayTextBox]);

  return (
    <OakBox $position="relative" ref={dropdownRef}>
      <ActionButton
        tooltip="Flag issues with content to help Aila improve"
        onClick={() => setIsOpen(!isOpen)}
      >
        Flag
      </ActionButton>

      {isOpen && (
        <DropDownFormWrapper
          onClickActions={flagSectionContent}
          setIsOpen={setIsOpen}
          selectedRadio={selectedRadio}
          title={`Flag issue with ${sectionTitle.toLowerCase()}:`}
          buttonText={"Send feedback"}
          isOpen={isOpen}
          dropdownRef={dropdownRef}
        >
          <OakRadioGroup
            name={`drop-down-${flagOptions[0].enumValue}`}
            $flexDirection="column"
            $gap="space-between-s"
            $background="white"
          >
            {flagOptions.map((option) => (
              <FlagButtonFormItem
                key={`flagButtonFormItem-${option.enumValue}`}
                option={option}
                setSelectedRadio={setSelectedRadio}
                setDisplayTextBox={setDisplayTextBox}
                displayTextBox={displayTextBox}
                setUserFeedbackText={setUserFeedbackText}
              />
            ))}
          </OakRadioGroup>
        </DropDownFormWrapper>
      )}
    </OakBox>
  );
};

const FlagButtonFormItem = ({
  option,
  setSelectedRadio,
  setDisplayTextBox,
  displayTextBox,
  setUserFeedbackText,
}: {
  option: FlagButtonOptions[number];
  setSelectedRadio: (value: FeedbackOption<AilaUserFlagType>) => void;
  setDisplayTextBox: (value: string | null) => void;
  displayTextBox: string | null;
  setUserFeedbackText: (value: string) => void;
}) => {
  return (
    <>
      <SmallRadioButton
        id={`flag-options-${option.enumValue}`}
        key={`flag-options-${option.enumValue}`}
        value={option.enumValue}
        label={option.label}
        onClick={() => {
          setDisplayTextBox(option.label);
          setSelectedRadio(option);
        }}
      />
      {displayTextBox === option.label && (
        <>
          <OakP $font="body-3">Provide details below:</OakP>
          <TextArea onChange={(e) => setUserFeedbackText(e.target.value)} />
        </>
      )}
    </>
  );
};

const TextArea = styled.textarea`
  width: 100%;
  height: 70px;
  padding: 12px;
  border: 2px solid black;
  border-opacity: 0.5;
  resize: none;
  border-radius: 4px;
`;

export default FlagButton;
