import { type Dispatch, type SetStateAction, useState } from "react";

import type { AdditionalMaterialSchemas } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";

import {
  OakFlex,
  OakIcon,
  OakLabel,
  OakLink,
  OakP,
  OakPrimaryButton,
  OakRadioButton,
  OakRadioGroup,
  OakTextInput,
} from "@oaknational/oak-components";

import { SubjectsDropDown, YearGroupDropDown } from "../DropDownButtons";
import ResourcesFooter from "../ResourcesFooter";

const StepOne = ({
  setDocType,
  setModeration,
  setGeneration,
  setStepNumber,
  handleSubmitLessonPlan,
}: {
  setDocType: (docType: string) => void;
  setModeration: (moderation: string | null) => void;
  setGeneration: Dispatch<SetStateAction<AdditionalMaterialSchemas | null>>;
  setStepNumber: (stepNumber: number) => void;
  handleSubmitLessonPlan: ({
    title,
    subject,
    keyStage,
    year,
  }: {
    title: string;
    subject: string;
    keyStage: string;
    year: string;
  }) => void;
}) => {
  const [subject, setSubject] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  return (
    <>
      <div className="mb-15 flex gap-10">
        <YearGroupDropDown
          selectedYear={year || ""}
          setSelectedYear={setYear}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
        <SubjectsDropDown
          selectedSubject={subject || ""}
          setSelectedSubject={setSubject}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>
      <OakTextInput
        onChange={(value) => setTitle(value.target.value)}
        placeholder="Type a lesson title or learning outcome"
      />
      <OakFlex $gap={"space-between-m"} $flexDirection="column">
        <OakFlex $flexDirection={"column"}>
          <OakFlex $mv={"space-between-l"}>
            <OakRadioGroup
              name="radio-group"
              onChange={(value) => {
                setDocType(value.target.value);
                setModeration(null);
                setGeneration(null);
              }}
              $flexDirection="column"
            >
              <OakLabel>
                <OakRadioButton
                  id="additional-glossary"
                  value="additional-glossary"
                  label={
                    <OakFlex
                      $flexDirection="column"
                      $gap="all-spacing-2"
                      $ml="space-between-xs"
                    >
                      <OakP $font="heading-6">Glossary</OakP>
                      <OakP>
                        Additional lesson vocabulary with pupil friendly
                        definitions
                      </OakP>
                    </OakFlex>
                  }
                />
              </OakLabel>
              <OakLabel>
                <OakRadioButton
                  id="additional-comprehension"
                  value="additional-comprehension"
                  label={
                    <OakFlex
                      $flexDirection="column"
                      $gap="all-spacing-2"
                      $ml="space-between-xs"
                    >
                      <OakP $font="heading-6">Comprehension tasks</OakP>
                      <OakP>
                        Comprehension tasks which can be adapted for pupils
                      </OakP>
                    </OakFlex>
                  }
                />
              </OakLabel>
            </OakRadioGroup>
          </OakFlex>
        </OakFlex>
      </OakFlex>

      <ResourcesFooter>
        <OakFlex $justifyContent="space-between" $width={"100%"}>
          <OakLink onClick={() => setStepNumber(0)}>
            <OakFlex $alignItems="center" $gap="all-spacing-2">
              <OakIcon iconName="chevron-left" />
              Back a step
            </OakFlex>
          </OakLink>

          <OakPrimaryButton
            onClick={() =>
              void handleSubmitLessonPlan({
                title: title || "",
                subject: subject || "",
                year: year || "",
              })
            }
            iconName="arrow-right"
            isTrailingIcon={true}
          >
            Generate overview
          </OakPrimaryButton>
        </OakFlex>
      </ResourcesFooter>
    </>
  );
};

export default StepOne;
