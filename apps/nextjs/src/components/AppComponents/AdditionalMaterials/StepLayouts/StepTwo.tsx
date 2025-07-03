import { useState } from "react";

import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import { OakBox, OakFlex, OakTextInput } from "@oaknational/oak-components";
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
import { validateForm } from "@/utils/validationHelpers";

import FormValidationWarning from "../../FormValidationWarning";
import { SubjectsDropDown, YearGroupDropDown } from "../DropDownButtons";
import ResourcesFooter from "../ResourcesFooter";
import SharedNavigationButtons from "./SharedFooterNavigationButtons";

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

  // Using the imported validateForm utility

  const validateInputs = () => {
    const { isValid, errorMessage } = validateForm(
      title,
      year,
      subject,
      docTypeName,
    );
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
      docTypeName,
    );
    setShowValidationError(errorMessage);
  };

  return (
    <>
      <OakFlex
        $flexDirection={"column"}
        $gap={"space-between-m"}
        $mb={["space-between-l", "space-between-m"]}
      >
        <OakFlex $flexDirection={["column", "row"]} $gap={"space-between-m"}>
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
        <OakBox $display={["block", "none"]}>
          <OakTextInput
            onChange={(value) => {
              const newTitle = value.target.value;
              setTitle(newTitle);
              updateValidationMessage(newTitle, undefined, undefined);
            }}
            value={title ?? ""}
            placeholder={"Type a learning objective"}
          />
        </OakBox>
        <OakBox $display={["none", "block"]}>
          <OakTextInput
            onChange={(value) => {
              const newTitle = value.target.value;
              setTitle(newTitle);
              updateValidationMessage(newTitle, undefined, undefined);
            }}
            placeholder={"Type a lesson title or learning outcome"}
            value={title ?? ""}
          />
        </OakBox>
        {!!showValidationError && (
          <FormValidationWarning errorMessage={showValidationError} />
        )}
      </OakFlex>

      <ResourcesFooter>
        <SharedNavigationButtons
          backLabel="Back a step"
          nextLabel="Next, review lesson details"
          onBackClick={() => setStepNumber(0, "back_a_step_button")}
          onNextClick={() => {
            setValidationAttempted(true);
            const { isValid } = validateForm(title, year, subject, docTypeName);
            if (!isValid) {
              validateInputs();
              return;
            }
            invariant(
              title && subject && year,
              "Title, subject, and year must be provided to generate lesson plan",
            );
            void handleSubmitLessonPlan({
              title,
              subject,
              year,
            });
          }}
        />
      </ResourcesFooter>
    </>
  );
};

export default StepTwo;
