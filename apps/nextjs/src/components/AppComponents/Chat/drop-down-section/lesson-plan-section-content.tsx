import type {
  LessonPlanKey,
  LessonPlanSectionWhileStreaming,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { useTranslation } from "@/components/ContextProviders/LanguageContext";
import { lessonSectionTitlesAndMiniDescriptions } from "@/data/lessonSectionTitlesAndMiniDescriptions";
import { getTranslatedSectionTitle } from "@/utils/translations";

import { MemoizedReactMarkdownWithStyles } from "../markdown";
import AddAdditionalMaterialsButton from "./add-additional-materials-button";
import FlagButton from "./flag-button";
import ModifyButton from "./modify-button";
import { sectionTitle } from "./sectionTitle";

export type LessonPlanSectionContentProps = Readonly<{
  sectionKey: LessonPlanKey;
  value: LessonPlanSectionWhileStreaming;
  translatedLessonPlan: LooseLessonPlan | null;
}>;

export const LessonPlanSectionContent = ({
  sectionKey,
  value,
  translatedLessonPlan,
}: LessonPlanSectionContentProps) => {
  const translatedSection = translatedLessonPlan?.[sectionKey];
  const { language } = useTranslation();

  // Get the appropriate section title based on language
  const displayTitle = sectionTitle(sectionKey, language);

  return (
    <OakFlex $flexDirection="column">
      {translatedSection ? (
        <OakFlex $flexDirection="row">
          <OakBox $width="100%" $pa="inner-padding-s">
            <MemoizedReactMarkdownWithStyles
              lessonPlanSectionDescription={
                lessonSectionTitlesAndMiniDescriptions[sectionKey]?.description
              }
              markdown={`${sectionToMarkdown(sectionKey, value)}`}
            />
          </OakBox>
          <OakBox $width="100%" $bl="border-solid-s" $pa="inner-padding-s">
            <MemoizedReactMarkdownWithStyles
              lessonPlanSectionDescription={
                lessonSectionTitlesAndMiniDescriptions[sectionKey]?.description
              }
              markdown={`${sectionToMarkdown(sectionKey, translatedSection)}`}
            />
          </OakBox>
        </OakFlex>
      ) : (
        <MemoizedReactMarkdownWithStyles
          lessonPlanSectionDescription={
            lessonSectionTitlesAndMiniDescriptions[sectionKey]?.description
          }
          markdown={`${sectionToMarkdown(sectionKey, value)}`}
        />
      )}

      <OakFlex
        $gap="all-spacing-3"
        $mt="space-between-s"
        $position="relative"
        $display={["none", "flex"]}
      >
        {sectionKey === "additionalMaterials" && value === "None" ? (
          <AddAdditionalMaterialsButton
            sectionTitle={displayTitle}
            sectionPath={sectionKey}
            sectionValue={value}
          />
        ) : (
          <ModifyButton
            sectionTitle={displayTitle}
            sectionPath={sectionKey}
            sectionValue={value}
          />
        )}

        <FlagButton
          sectionTitle={displayTitle}
          sectionPath={sectionKey}
          sectionValue={value}
        />
      </OakFlex>
    </OakFlex>
  );
};
