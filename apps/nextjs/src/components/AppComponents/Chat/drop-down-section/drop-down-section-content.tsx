import type {
  LessonPlanKey,
  LessonPlanSectionWhileStreaming,
} from "@oakai/aila/src/protocol/schema";

import { OakFlex } from "@oaknational/oak-components";

import { useClientSideFeatureFlag } from "@/components/ContextProviders/FeatureFlagProvider";

import { SectionContent } from "../../SectionContent";
import { quizModifyOptions } from "./action-button.types";
import AddAdditionalMaterialsButton from "./add-additional-materials-button";
import FlagButton from "./flag-button";
import ModifyButton from "./modify-button";
import { QuizDebugButton } from "./quiz-debug-button";
import { sectionTitle } from "./sectionTitle";

export type DropDownSectionContentProps = Readonly<{
  sectionKey: LessonPlanKey;
  value: LessonPlanSectionWhileStreaming;
}>;

export const DropDownSectionContent = ({
  sectionKey,
  value,
}: DropDownSectionContentProps) => {
  const isAgentic = useClientSideFeatureFlag("agentic-aila-nov-25");
  const isQuizSection =
    sectionKey === "starterQuiz" || sectionKey === "exitQuiz";
  return (
    <OakFlex $flexDirection="column">
      <SectionContent sectionKey={sectionKey} value={value} />
      <OakFlex
        $gap="spacing-12"
        $mt="spacing-16"
        $position="relative"
        $display={["none", "flex"]}
      >
        {sectionKey === "additionalMaterials" && value === "None" ? (
          <AddAdditionalMaterialsButton
            sectionTitle={sectionTitle(sectionKey)}
            sectionPath={sectionKey}
            sectionValue={value}
          />
        ) : (
          <ModifyButton
            sectionTitle={sectionTitle(sectionKey)}
            sectionPath={sectionKey}
            sectionValue={value}
            options={isQuizSection && isAgentic ? quizModifyOptions : undefined}
          />
        )}

        <FlagButton
          sectionTitle={sectionTitle(sectionKey)}
          sectionPath={sectionKey}
          sectionValue={value}
        />

        {isQuizSection && <QuizDebugButton quizType={`/${sectionKey}`} />}
      </OakFlex>
    </OakFlex>
  );
};
