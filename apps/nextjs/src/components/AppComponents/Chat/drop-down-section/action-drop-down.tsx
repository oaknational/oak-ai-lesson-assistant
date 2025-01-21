import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
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
} from "./action-button.types";
import type { FeedbackOption } from "./drop-down-form-wrapper";
import { DropDownFormWrapper } from "./drop-down-form-wrapper";
import { SmallRadioButton } from "./small-radio-button";

const log = aiLogger("chat");

export type DropDownProps = Readonly<{
  sectionTitle: string;
  options: ModifyOptions | AdditionalMaterialOptions;
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
  dropdownRef: RefObject<HTMLDivElement>;
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
        $gap="space-between-s"
        $background="white"
      >
        {options.map(
          (
            option: ModifyOptions[number] | AdditionalMaterialOptions[number],
          ) => {
            return (
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
            );
          },
        )}

        {selectedRadio?.label === "Other" && (
          <>
            <OakP $font="body-3">{userSuggestionTitle}</OakP>
            <TextArea
              data-testid={"modify-other-text-area"}
              onChange={(e) => setUserFeedbackText(e.target.value)}
            />
          </>
        )}
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
  const pluralSections = [
    "misconceptions",
    "key learning points",
    "learning cycles",
    "additional materials",
  ];
  if (pluralSections.includes(section.toLowerCase())) {
    if (text.split(" ").includes("it")) {
      return text.replace("it", "them");
    }
  }
  return text;
}
