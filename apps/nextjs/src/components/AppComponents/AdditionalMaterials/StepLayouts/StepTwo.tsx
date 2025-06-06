import { useEffect, useState } from "react";

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

import { useDialog } from "../../DialogContext";
import FormValidationWarning from "../../FormValidationWarning";
import { SubjectsDropDown, YearGroupDropDown } from "../DropDownButtons";
import ResourcesFooter from "../ResourcesFooter";
import { handleDialogSelection } from "./helpers";

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
  const activeDropdown = useResourcesStore(activeDropdownSelector);
  const error = useResourcesStore((state) => state.error);
  const { setDialogWindow } = useDialog();
  const [showValidationError, setShowValidationError] = useState("");
  useEffect(() => {
    // Reset the form when the component is mounted
    // This should be removed once we are persisting in the database and the flow is based on an ID
    setSubject(null);
    setTitle(null);
    setYear(null);
  }, [setSubject, setTitle, setYear]);

  handleDialogSelection({ threatDetected: undefined, error, setDialogWindow });

  return (
    <>
      <OakFlex $flexDirection={"column"} $gap={"space-between-m"}>
        <OakFlex $flexDirection={"row"} $gap={"space-between-m"}>
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
        </OakFlex>
        <OakTextInput
          onChange={(value) => setTitle(value.target.value)}
          placeholder="Type a lesson title or learning outcome"
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
              Back a step
            </OakFlex>
          </button>

          <OakPrimaryButton
            onClick={() => {
              if (!title || !subject || !year) {
                setShowValidationError(
                  "Please provide a year group, subject and lesson title.",
                );
              } else if (title.length < 10) {
                setShowValidationError(`Please provide a longer lesson title.`);
              } else {
                void handleSubmitLessonPlan({
                  title: title || "",
                  subject: subject || "",
                  keyStage: "",
                  year: year || "",
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
