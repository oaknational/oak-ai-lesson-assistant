import { useEffect } from "react";

import { getResourceTypes } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import {
  OakFlex,
  OakIcon,
  OakLabel,
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

import { useDialog } from "../../DialogContext";
import { SubjectsDropDown, YearGroupDropDown } from "../DropDownButtons";
import ResourcesFooter from "../ResourcesFooter";
import { handleDialogSelection } from "./helpers";

type SubmitLessonPlanParams = {
  title: string;
  subject: string;
  keyStage: string;
  year: string;
};
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
  const error = useResourcesStore((state) => state.error);

  const { setDialogWindow } = useDialog();

  useEffect(() => {
    // Reset the form when the component is mounted
    // This should be removed once we are persisting in the database and the flow is based on an ID
    setSubject(null);
    setTitle(null);
    setYear(null);
    setDocType(null);
  }, [setSubject, setTitle, setYear, setDocType]);

  const generateLessonPlan =
    trpc.additionalMaterials.generatePartialLessonPlanObject.useMutation();

  const handleSubmitLessonPlan = (params: SubmitLessonPlanParams) =>
    submitLessonPlan({
      ...params,
      mutateAsync: async (input) => {
        try {
          const result = await generateLessonPlan.mutateAsync(input);
          if (!result) {
            throw new Error("Mutation returned null");
          }
          return result;
        } catch (error) {
          throw error instanceof Error ? error : new Error(String(error));
        }
      },
    });

  const resourceTypes = getResourceTypes().filter(
    (resourceType) => resourceType.isAvailable,
  );

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
      </OakFlex>
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
              {resourceTypes.map((resourceType) => (
                <OakLabel key={resourceType.id}>
                  <OakRadioButton
                    id={resourceType.id}
                    value={resourceType.id}
                    radioInnerSize="all-spacing-6"
                    radioOuterSize="all-spacing-7"
                    label={
                      <OakFlex
                        $flexDirection="column"
                        $gap="all-spacing-2"
                        $ml="space-between-xs"
                      >
                        <OakP $font="heading-6">
                          {resourceType.displayName}
                        </OakP>
                        <OakP>{resourceType.description}</OakP>
                      </OakFlex>
                    }
                  />
                </OakLabel>
              ))}
            </OakRadioGroup>
          </OakFlex>
        </OakFlex>
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
            onClick={() =>
              void handleSubmitLessonPlan({
                title: title || "",
                subject: subject || "",
                keyStage: "ks2",
                year: year || "",
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
