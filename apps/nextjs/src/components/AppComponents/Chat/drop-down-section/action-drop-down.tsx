import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
} from "react";
import { toast } from "react-hot-toast";

import { aiLogger } from "@oakai/logger";

import { OakP, OakRadioGroup } from "@oaknational/oak-components";
import type { $Enums, AilaUserModificationAction } from "@prisma/client";
import { TextArea } from "@radix-ui/themes";
import * as Sentry from "@sentry/nextjs";

import type {
  AdditionalMaterialOptions,
  ModifyOptions,
  QuizModifyOptions,
} from "./action-button.types";
import type { FeedbackOption } from "./drop-down-form-wrapper";
import { DropDownFormWrapper } from "./drop-down-form-wrapper";
import { SmallRadioButton } from "./small-radio-button";

const log = aiLogger("chat");

type AllOptions = ModifyOptions | AdditionalMaterialOptions | QuizModifyOptions;

export type DropDownProps = Readonly<{
  sectionTitle: string;
  options: AllOptions;
  selectedRadio: FeedbackOption<AilaUserModificationAction> | null;
  setSelectedRadio: Dispatch<
    SetStateAction<FeedbackOption<$Enums.AilaUserModificationAction> | null>
  >;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setUserFeedbackText: (text: string) => void;
  handleSubmit: (
    option: FeedbackOption<AilaUserModificationAction>,
  ) => Promise<void>;
  buttonText: string;
  userSuggestionTitle: string;
  dropdownRef: RefObject<HTMLDivElement | null>;
  id: string;
}>;

export const ActionDropDown = ({
  sectionTitle,
  options,
  selectedRadio,
  setSelectedRadio,
  isOpen,
  setIsOpen,
  setUserFeedbackText,
  handleSubmit,
  buttonText,
  userSuggestionTitle,
  dropdownRef,
  id,
}: DropDownProps) => {
  const performSubmit = useCallback(
    (option: FeedbackOption<AilaUserModificationAction>) => {
      handleSubmit(option).catch((error) => {
        Sentry.captureException(error, { extra: { id } });
        toast.error("Failed to submit feedback");
      });
    },
    [handleSubmit, id],
  );
  return (
    <DropDownFormWrapper
      onClickActions={performSubmit}
      setIsOpen={setIsOpen}
      selectedRadio={selectedRadio}
      title={sectionTitle}
      buttonText={buttonText}
      isOpen={isOpen}
      dropdownRef={dropdownRef}
    >
      <OakRadioGroup
        name={`drop-down-${options[0].enumValue}`}
        $flexDirection="column"
        $gap="spacing-16"
        $background="bg-primary"
      >
        {options.map((option: AllOptions[number]) => {
          const isSelected = selectedRadio?.enumValue === option.enumValue;
          const showTextInput =
            isSelected && (option.label === "Other" || "textPrompt" in option);
          return (
            <div key={`${id}-modify-options-${option.enumValue}`}>
              <SmallRadioButton
                id={`${id}-modify-options-${option.enumValue}`}
                data-testid={"modify-radio-button"}
                value={option.enumValue}
                label={handleLabelText({
                  text: option.label,
                  section: sectionTitle,
                })}
                onClick={() => {
                  setSelectedRadio(option);
                }}
              />
              {showTextInput && (
                <>
                  <OakP $font="body-3" $mt="spacing-8">
                    {"textPrompt" in option
                      ? option.textPrompt
                      : userSuggestionTitle}
                  </OakP>
                  <TextArea
                    data-testid={"modify-other-text-area"}
                    onChange={(e) => setUserFeedbackText(e.target.value)}
                  />
                </>
              )}
            </div>
          );
        })}
      </OakRadioGroup>
    </DropDownFormWrapper>
  );
};

function handleLabelText({
  text,
  section,
}: {
  text: string;
  section: string;
}): string {
  log.info("section", section);
  if (
    // @todo this is a bug - "additional materials" always returns true
    // eslint-disable-next-line no-constant-condition
    section === "Misconceptions" ||
    section === "Key learning points" ||
    section === "Learning cycles" ||
    "additional materials"
  ) {
    if (text.split(" ").includes("it")) {
      return text.replace("it", "them");
    }
  }
  return text;
}
