import { useState } from "react";

import { getMaterialType } from "@oakai/teaching-materials/src/documents/teachingMaterials/materialTypes";

import { OakBox, OakFlex, OakTextInput } from "@oaknational/oak-components";
import invariant from "tiny-invariant";

import {
  useTeachingMaterialsActions,
  useTeachingMaterialsStore,
} from "@/stores/TeachingMaterialsStoreProvider";
import {
  activeDropdownSelector,
  subjectSelector,
  titleSelector,
  yearSelector,
} from "@/stores/teachingMaterialsStore/selectors";

import FormValidationWarning from "../../FormValidationWarning";
import { SubjectsDropDown, YearGroupDropDown } from "../DropDownButtons";
import ResourcesFooter from "../ResourcesFooter";
import SharedNavigationButtons from "./SharedFooterNavigationButtons";
import { validateForm } from "./helpers";

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
    useTeachingMaterialsActions();
  const subject = useTeachingMaterialsStore(subjectSelector);
  const title = useTeachingMaterialsStore(titleSelector);
  const year = useTeachingMaterialsStore(yearSelector);
  const docType = useTeachingMaterialsStore((state) => state.docType);
  const activeDropdown = useTeachingMaterialsStore(activeDropdownSelector);

  const [showValidationError, setShowValidationError] = useState("");
  const [validationAttempted, setValidationAttempted] = useState(false);

  const materialType = docType ? getMaterialType(docType) : null;
  const docTypeName = materialType
    ? materialType.displayName.toLowerCase()
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
    updates: {
      updatedTitle?: string;
      updatedYear?: string;
      updatedSubject?: string;
    } = {},
  ) => {
    // Only update validation message if validation has been attempted
    if (!validationAttempted) return;

    // Use the updated values or fall back to current state values
    const titleToCheck = updates.updatedTitle ?? title;
    const yearToCheck = updates.updatedYear ?? year;
    const subjectToCheck = updates.updatedSubject ?? subject;

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
        $gap={"spacing-24"}
        $mb={["spacing-48", "spacing-24"]}
      >
        <OakFlex $flexDirection={["column", "row"]} $gap={"spacing-24"}>
          <YearGroupDropDown
            selectedYear={year}
            setSelectedYear={(year: string) => {
              setYear(year);
              updateValidationMessage({ updatedYear: year });
            }}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
          <SubjectsDropDown
            selectedSubject={subject}
            setSelectedSubject={(subject: string) => {
              setSubject(subject);
              updateValidationMessage({ updatedSubject: subject });
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
              updateValidationMessage({ updatedTitle: newTitle });
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
              updateValidationMessage({ updatedTitle: newTitle });
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
