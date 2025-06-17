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
  keyStage: string;
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

  const validateInputs = () => {
    if (!title && !subject && !year) {
      setShowValidationError(
        `Please provide a year group, subject and lesson details, so that Aila has the right context for your ${docTypeName}.`,
      );
      return false;
    } else if (!year && !subject) {
      setShowValidationError(
        `Please select a year group and subject, so that Aila has the right context for your ${docTypeName}.`,
      );
      return false;
    } else if (!year) {
      setShowValidationError(
        `Please select a year group, so that Aila has the right context for your ${docTypeName}.`,
      );
      return false;
    } else if (!subject) {
      setShowValidationError(
        `Please select a subject, so that Aila has the right context for your ${docTypeName}.`,
      );
      return false;
    } else if (!title) {
      setShowValidationError(
        `Please provide your lesson details, so that Aila has the right context for your ${docTypeName}.`,
      );
      return false;
    } else if (title.length < 10) {
      setShowValidationError(`Please provide a longer lesson title.`);
      return false;
    }
    return true;
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

    if (!titleToCheck && !subjectToCheck && !yearToCheck) {
      setShowValidationError(
        `Please provide a year group, subject and lesson details, so that Aila has the right context for your ${docTypeName}.`,
      );
    } else if (!yearToCheck && !subjectToCheck) {
      setShowValidationError(
        `Please select a year group and subject, so that Aila has the right context for your ${docTypeName}.`,
      );
    } else if (!yearToCheck) {
      setShowValidationError(
        `Please select a year group, so that Aila has the right context for your ${docTypeName}.`,
      );
    } else if (!subjectToCheck) {
      setShowValidationError(
        `Please select a subject, so that Aila has the right context for your ${docTypeName}.`,
      );
    } else if (!titleToCheck) {
      setShowValidationError(
        `Please provide your lesson details, so that Aila has the right context for your ${docTypeName}.`,
      );
    } else if (titleToCheck.length < 10) {
      setShowValidationError(`Please provide a longer lesson title.`);
    } else {
      setShowValidationError(""); // Clear error if all validations pass
    }
  };

  return (
    <>
      <OakFlex $flexDirection={"column"} $gap={"space-between-m"}>
        <OakFlex $flexDirection={"row"} $gap={"space-between-m"}>
          <YearGroupDropDown
            selectedYear={year ?? ""}
            setSelectedYear={(year: string) => {
              setYear(year);
              updateValidationMessage(undefined, year, undefined);
            }}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
          <SubjectsDropDown
            selectedSubject={subject ?? ""}
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
          <button onClick={() => setStepNumber(0)}>
            <OakFlex $alignItems="center" $gap="all-spacing-2">
              <OakIcon iconName="chevron-left" />
              Back
            </OakFlex>
          </button>

          <OakPrimaryButton
            onClick={() => {
              // Set validation as attempted to show messages going forward
              setValidationAttempted(true);

              // Check all validations directly without using updateValidationMessage
              if (!title && !subject && !year) {
                setShowValidationError(
                  `Please provide a year group, subject and lesson details, so that Aila has the right context for your ${docTypeName}.`,
                );
                return;
              } else if (!year && !subject) {
                setShowValidationError(
                  `Please select a year group and subject, so that Aila has the right context for your ${docTypeName}.`,
                );
                return;
              } else if (!year) {
                setShowValidationError(
                  `Please select a year group, so that Aila has the right context for your ${docTypeName}.`,
                );
                return;
              } else if (!subject) {
                setShowValidationError(
                  `Please select a subject, so that Aila has the right context for your ${docTypeName}.`,
                );
                return;
              } else if (!title) {
                setShowValidationError(
                  `Please provide your lesson details, so that Aila has the right context for your ${docTypeName}.`,
                );
                return;
              } else if (title.length < 10) {
                setShowValidationError(`Please provide a longer lesson title.`);
                return;
              }

              void handleSubmitLessonPlan({
                title: title || "",
                subject: subject || "",
                keyStage: "",
                year: year || "",
              });
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
