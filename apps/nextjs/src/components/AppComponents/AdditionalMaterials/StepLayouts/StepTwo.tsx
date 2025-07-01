import { useState } from "react";

import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import {
  OakFlex,
  OakPrimaryButton,
  OakPrimaryInvertedButton,
  OakTextInput,
} from "@oaknational/oak-components";
import invariant from "tiny-invariant";

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
  const [validationAttempted, setValidationAttempted] = useState(false);

  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType
    ? resourceType.displayName.toLowerCase()
    : null;

  const validateForm = (
    titleToCheck: string | null | undefined,
    yearToCheck: string | null | undefined,
    subjectToCheck: string | null | undefined,
  ) => {
    if (!titleToCheck && !subjectToCheck && !yearToCheck) {
      return {
        isValid: false,
        errorMessage: `Please provide a year group, subject and lesson details, so that Aila has the right context for your ${docTypeName}.`,
      };
    } else if (!yearToCheck && !subjectToCheck) {
      return {
        isValid: false,
        errorMessage: `Please select a year group and subject, so that Aila has the right context for your ${docTypeName}.`,
      };
    } else if (!yearToCheck) {
      return {
        isValid: false,
        errorMessage: `Please select a year group, so that Aila has the right context for your ${docTypeName}.`,
      };
    } else if (!subjectToCheck) {
      return {
        isValid: false,
        errorMessage: `Please select a subject, so that Aila has the right context for your ${docTypeName}.`,
      };
    } else if (!titleToCheck) {
      return {
        isValid: false,
        errorMessage: `Please provide your lesson details, so that Aila has the right context for your ${docTypeName}.`,
      };
    } else if (titleToCheck.length < 10) {
      return {
        isValid: false,
        errorMessage: `Please provide a longer lesson title.`,
      };
    }

    return { isValid: true, errorMessage: "" };
  };

  const validateInputs = () => {
    const { isValid, errorMessage } = validateForm(title, year, subject);
    setShowValidationError(errorMessage);
    return isValid;
  };

  const updateValidationMessage = (
    updatedTitle?: string,
    updatedYear?: string,
    updatedSubject?: string,
  ) => {
    // Only update validation message if validation has been attempted
    if (!validationAttempted) return;

    // Use the updated values or fall back to current state values
    const titleToCheck = updatedTitle ?? title;
    const yearToCheck = updatedYear ?? year;
    const subjectToCheck = updatedSubject ?? subject;

    const { errorMessage } = validateForm(
      titleToCheck,
      yearToCheck,
      subjectToCheck,
    );
    setShowValidationError(errorMessage);
  };

  return (
    <>
      <OakFlex $flexDirection={"column"} $gap={"space-between-m"}>
        <OakFlex $flexDirection={"row"} $gap={"space-between-m"}>
          <YearGroupDropDown
            selectedYear={year}
            setSelectedYear={(year: string) => {
              setYear(year);
              updateValidationMessage(undefined, year, undefined);
            }}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
          <SubjectsDropDown
            selectedSubject={subject}
            setSelectedSubject={(subject: string) => {
              setSubject(subject);
              updateValidationMessage(undefined, undefined, subject);
            }}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        </OakFlex>
        <OakTextInput
          onChange={(value) => {
            const newTitle = value.target.value;
            setTitle(newTitle);
            updateValidationMessage(newTitle, undefined, undefined);
          }}
          placeholder="Type a lesson title or learning outcome"
          value={title ?? ""}
        />
        {!!showValidationError && (
          <FormValidationWarning errorMessage={showValidationError} />
        )}
      </OakFlex>

      <ResourcesFooter>
        <OakFlex $justifyContent="space-between" $width={"100%"}>
          <OakPrimaryInvertedButton
            iconName="chevron-left"
            onClick={() => setStepNumber(0, "back_a_step_button")}
          >
            Back a step
          </OakPrimaryInvertedButton>

          <OakPrimaryButton
            onClick={() => {
              // Set validation as attempted to show messages going forward
              setValidationAttempted(true);

              const { isValid } = validateForm(title, year, subject);
              if (!isValid) {
                validateInputs();
                return;
              }
              invariant(
                title && subject && year,
                "Title, subject, and year must be provided to generate lesson plan",
              );

              void handleSubmitLessonPlan({
                title: title,
                subject: subject,
                year: year,
              });
            }}
            iconName="arrow-right"
            isTrailingIcon={true}
          >
            Next, review lesson details
          </OakPrimaryButton>
        </OakFlex>
      </ResourcesFooter>
    </>
  );
};

export default StepTwo;
