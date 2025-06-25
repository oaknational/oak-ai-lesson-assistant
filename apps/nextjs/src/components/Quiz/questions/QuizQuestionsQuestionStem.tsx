import { OakFlex, OakTypography } from "@oaknational/oak-components";
import type { QuizV2ContentArray } from "@oakai/aila/src/protocol/schemas";

import { shortAnswerTitleFormatter } from "../utils";

export const QuizQuestionsQuestionStem = ({
  questionStem,
  index,
  showIndex = true,
}: {
  questionStem: QuizV2ContentArray;
  index: number;
  showIndex?: boolean;
}) => {
  const displayNumber = `Q${index + 1}.`;
  return (
    <OakFlex $flexDirection={"column"} $gap="all-spacing-1">
      <OakFlex key="stem-header">
        {showIndex && (
          <OakTypography
            $font={["body-2-bold", "body-1-bold"]}
            $mr="space-between-xs"
          >
            {displayNumber}
          </OakTypography>
        )}
        {questionStem[0]?.type === "text" && (
          <OakTypography
            key={`q-${displayNumber}-stem-element-0`}
            $font={["body-2-bold", "body-1-bold"]}
          >
            {shortAnswerTitleFormatter(questionStem[0].text)}
          </OakTypography>
        )}
      </OakFlex>

      {questionStem.map((stemItem, i) => {
        if (stemItem.type === "text" && i > 0) {
          return (
            <OakTypography
              key={`q-${displayNumber}-stem-element-${i}`}
              $font={["body-2-bold", "body-1-bold"]}
            >
              {shortAnswerTitleFormatter(stemItem.text)}
            </OakTypography>
          );
        } else if (stemItem.type === "image") {
          return (
            <OakFlex
              $pv="inner-padding-xl"
              key={`q-${displayNumber}-stem-element-${i}`}
            >
              <img 
                src={stemItem.image.url} 
                width={stemItem.image.width}
                height={stemItem.image.height}
                alt="Quiz question image"
              />
            </OakFlex>
          );
        }
        return null;
      })}
    </OakFlex>
  );
};
