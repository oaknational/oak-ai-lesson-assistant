import { useState } from "react";

import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import {
  OakFlex,
  OakIcon,
  OakPrimaryButton,
  OakTextInput,
} from "@oaknational/oak-components";

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import {
  activeDropdownSelector,
  subjectSelector,
  titleSelector,
  yearSelector,
} from "@/stores/resourcesStore/selectors";

import FormValidationWarning from "../../FormValidationWarning";
import { SubjectsDropDown, YearGroupDropDown } from "../DropDownButtons";
import ResourcesFooter from "../ResourcesFooter";

type SubmitLessonPlanParams = {
  title: string;
  subject: string;
  year: string;
};

const StepTwo = ({
  handleSubmitLessonPlan,
}: {
  handleSubmitLessonPlan: (params: SubmitLessonPlanParams) => Promise<void>;
}) => {
  const { setStepNumber, setSubject, setTitle, setYear, setActiveDropdown } =
    useResourcesActions();
  const subject = useResourcesStore(subjectSelector);
  const title = useResourcesStore(titleSelector);
  const year = useResourcesStore(yearSelector);
  const docType = useResourcesStore((state) => state.docType);
  const activeDropdown = useResourcesStore(activeDropdownSelector);

  const [showValidationError, setShowValidationError] = useState("");

  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType
    ? resourceType.displayName.toLowerCase()
    : null;

  return (
    <>
      <OakFlex $flexDirection={"column"} $gap={"space-between-m"}>
        <OakFlex $flexDirection={"row"} $gap={"space-between-m"}>
          <YearGroupDropDown
            selectedYear={year}
            setSelectedYear={setYear}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
          <SubjectsDropDown
            selectedSubject={subject}
            setSelectedSubject={setSubject}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        </OakFlex>
        <OakTextInput
          onChange={(value) => setTitle(value.target.value)}
          placeholder="Type a lesson title or learning outcome"
          value={title ?? ""}
        />
        {!!showValidationError && (
          <FormValidationWarning errorMessage={showValidationError} />
        )}
      </OakFlex>

      <ResourcesFooter>
        <OakFlex $justifyContent="space-between" $width={"100%"}>
          <button onClick={() => setStepNumber(0, "back_a_step_button")}>
            <OakFlex $alignItems="center" $gap="all-spacing-2">
              <OakIcon iconName="chevron-left" />
              Back
            </OakFlex>
          </button>

          <OakPrimaryButton
            onClick={() => {
              if (!title || !subject || !year) {
                setShowValidationError(
                  `Please provide a year group, subject and lesson details, so that Aila has the right context for your ${docTypeName}.`,
                );
              } else if (title.length < 10) {
                setShowValidationError(`Please provide a longer lesson title.`);
              } else {
                void handleSubmitLessonPlan({
                  title: title,
                  subject: subject,
                  year: year,
                });
              }
            }}
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

export default StepTwo;
