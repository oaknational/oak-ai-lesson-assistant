import { useEffect } from "react";

import {
  OakFlex,
  OakIcon,
  OakPrimaryButton,
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

import { useDialog } from "../../DialogContext";
import { SubjectsDropDown, YearGroupDropDown } from "../DropDownButtons";
import ResourcesFooter from "../ResourcesFooter";
import { handleDialogSelection } from "./helpers";

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
  const activeDropdown = useResourcesStore(activeDropdownSelector);
  const error = useResourcesStore((state) => state.error);
  const { setDialogWindow } = useDialog();

  handleDialogSelection({ threatDetected: undefined, error, setDialogWindow });

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
            disabled={!title || !subject || !year}
          >
            Generate overview
          </OakPrimaryButton>
        </OakFlex>
      </ResourcesFooter>
    </>
  );
};

export default StepTwo;
