import { useEffect, useRef, useState } from "react";

import {
  OakBox,
  OakP,
  OakRadioButton,
  OakRadioGroup,
  OakSpan,
  OakTertiaryButton,
  OakTextInput,
} from "@oaknational/oak-components";
import styled from "styled-components";

import { trpc } from "@/utils/trpc";

import ActionButton from "./action-button";
import { DropDownFormWrapper } from "./drop-down-form-wrapper";

const flagOptions = [
  "Inappropriate",
  "Inaccurate",
  "Too hard",
  "Too easy",
  "Other",
];

type FlagButtonOptions = (typeof flagOptions)[number];

const FlagButton = ({}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState<string | null>(null);
  const [displayTextBox, setDisplayTextBox] =
    useState<FlagButtonOptions | null>(null);
  const [userFeedbackText, setUserFeedbackText] = useState("");

  const { error, data, isLoading } =
    trpc.chat.appSessions.flagSection.useQuery();

  async function flagSectionContent(value: string) {
    const userFeedback = {
      flat: selectedRadio,
      feedback: userFeedbackText,
    };
    console.log("Flag content", userFeedback);
  }

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
          title={"Flag issue with learning outcome:"}
          buttonText={"Send feedback"}
          isOpen={isOpen}
          dropdownRef={dropdownRef}
        >
          <OakRadioGroup
            name={`drop-down-${flagOptions[0]}`}
            $flexDirection="column"
            $gap="space-between-m"
            $background="white"
          >
            {flagOptions.map((option) => (
              <FlagButtonFormItem
                key={option}
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
  option: string;
  setSelectedRadio: (value: string) => void;
  setDisplayTextBox: (value: FlagButtonOptions | null) => void;
  displayTextBox: FlagButtonOptions | null;
  setUserFeedbackText: (value: string) => void;
}) => {
  return (
    <>
      <OakRadioButton
        id={option}
        key={option}
        value={option}
        label={option}
        onClick={() => {
          setDisplayTextBox(option);
          setSelectedRadio(option);
        }}
      />
      {displayTextBox === option && (
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
