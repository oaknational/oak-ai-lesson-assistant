import type {
  LessonPlanKey,
  LessonPlanSectionWhileStreaming,
} from "@oakai/aila/src/protocol/schema";

import { OakFlex } from "@oaknational/oak-components";

import { SectionContent } from "../../SectionContent";
import AddAdditionalMaterialsButton from "./add-additional-materials-button";
import FlagButton from "./flag-button";
import ModifyButton from "./modify-button";
import { QuizDebugButton } from "./quiz-debug-button";
import QuizModifyButton from "./quiz-modify-button";
import { sectionTitle } from "./sectionTitle";

export type DropDownSectionContentProps = Readonly<{
  sectionKey: LessonPlanKey;
  value: LessonPlanSectionWhileStreaming;
}>;

export const DropDownSectionContent = ({
  sectionKey,
  value,
}: DropDownSectionContentProps) => {
  const isQuizSection =
    sectionKey === "starterQuiz" || sectionKey === "exitQuiz";
  const isRagQuiz =
    isQuizSection && typeof value === "object" && value && "reportId" in value;

  const renderModifyButton = () => {
    if (sectionKey === "additionalMaterials" && value === "None") {
      return (
        <AddAdditionalMaterialsButton
          sectionTitle={sectionTitle(sectionKey)}
          sectionPath={sectionKey}
          sectionValue={value}
        />
      );
    }
    if (isRagQuiz) {
      return (
        <QuizModifyButton
          sectionTitle={sectionTitle(sectionKey)}
          sectionPath={sectionKey}
          sectionValue={value}
        />
      );
    }
    return (
      <ModifyButton
        sectionTitle={sectionTitle(sectionKey)}
        sectionPath={sectionKey}
        sectionValue={value}
      />
    );
  };

  return (
    <OakFlex $flexDirection="column">
      <SectionContent sectionKey={sectionKey} value={value} />
      <OakFlex
        $gap="spacing-12"
        $mt="spacing-16"
        $position="relative"
        $display={["none", "flex"]}
      >
        {renderModifyButton()}

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
