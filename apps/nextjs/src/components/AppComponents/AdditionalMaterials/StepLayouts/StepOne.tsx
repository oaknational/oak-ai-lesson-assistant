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

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import {
  activeDropdownSelector,
  docTypeSelector,
  subjectSelector,
  titleSelector,
  yearSelector,
} from "@/stores/resourcesStore/selectors";
import { trpc } from "@/utils/trpc";

import { SubjectsDropDown, YearGroupDropDown } from "../DropDownButtons";
import ResourcesFooter from "../ResourcesFooter";

const StepOne = () => {
  const {
    setStepNumber,
    setDocType,
    setGeneration,
    submitLessonPlan,
    setSubject,
    setTitle,
    setYear,
    setActiveDropdown,
  } = useResourcesActions();

  const subject = useResourcesStore(subjectSelector);
  const title = useResourcesStore(titleSelector);
  const year = useResourcesStore(yearSelector);
  const activeDropdown = useResourcesStore(activeDropdownSelector);
  const docType = useResourcesStore(docTypeSelector);

  const generateLessonPlan =
    trpc.additionalMaterials.generatePartialLessonPlanObject.useMutation();

  const handleSubmitLessonPlan = (params) =>
    submitLessonPlan({
      ...params,
      mutateAsync: generateLessonPlan.mutateAsync,
    });

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
                keyStage: "ks2",
                year: year || "",
                mutateAsync: generateLessonPlan.mutateAsync,
              })
            }
            iconName="arrow-right"
            isTrailingIcon={true}
            disabled={!title || !subject || !year || !docType}
          >
            Generate overview
          </OakPrimaryButton>
        </OakFlex>
      </ResourcesFooter>
    </>
  );
};

export default StepOne;
