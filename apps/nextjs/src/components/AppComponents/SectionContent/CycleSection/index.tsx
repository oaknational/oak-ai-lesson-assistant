import { useMemo } from "react";

import {
  CycleOptionalSchema,
  QuizV1Schema,
} from "@oakai/aila/src/protocol/schema";
import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";
import { convertQuizV1ToV2 } from "@oakai/aila/src/protocol/schemas/quiz/conversion/quizV1ToV2";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";

import { OakBox, OakHeading } from "@oaknational/oak-components";
import { MathJax } from "better-react-mathjax";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { MultipleChoiceQuestion } from "../QuizSection/MultipleChoiceQuestion";

export type CycleSectionProps = {
  cycleSection: LessonPlanSectionWhileStreaming;
};

type CheckForUnderstandingQuizProps = {
  cycle: NonNullable<ReturnType<typeof CycleOptionalSchema.safeParse>["data"]>;
};

const CheckForUnderstandingQuiz = ({
  cycle,
}: CheckForUnderstandingQuizProps) => {
  const checkForUnderstandingQuiz = useMemo(() => {
    if (!cycle.checkForUnderstanding) return null;

    const parsedQuiz = QuizV1Schema.safeParse(cycle.checkForUnderstanding);
    if (!parsedQuiz.success) return null;

    return convertQuizV1ToV2(parsedQuiz.data);
  }, [cycle.checkForUnderstanding]);

  if (!checkForUnderstandingQuiz) {
    return <MemoizedReactMarkdownWithStyles markdown="…" />;
  }

  return (
    <OakBox $mt="spacing-16">
      {checkForUnderstandingQuiz.questions.map((question, index) => {
        if (question.questionType === "multiple-choice") {
          return (
            <MultipleChoiceQuestion
              key={index}
              question={question}
              questionNumber={index + 1}
            />
          );
        }
        return null;
      })}
    </OakBox>
  );
};

export const CycleSection = ({ cycleSection }: CycleSectionProps) => {
  const cycle = useMemo(() => {
    return CycleOptionalSchema.safeParse(cycleSection).data;
  }, [cycleSection]);

  if (!cycle) {
    return (
      <OakBox className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
        <OakHeading tag="h2">There's been a problem</OakHeading>
        <p>
          It looks like this learning cycle hasn't generated properly. Tap{" "}
          <strong>Retry</strong> or ask for this section to be regenerated.
        </p>
      </OakBox>
    );
  }

  return (
    <MathJax hideUntilTypeset="every" dynamic>
      {/* Apply prose styling only to text content sections, not the quiz */}
      <OakBox className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
        <OakHeading tag="h2">{cycle.title ?? "…"}</OakHeading>

        <OakHeading tag="h3" $mt="spacing-24">
          Explanation
        </OakHeading>
        <MemoizedReactMarkdownWithStyles
          markdown={
            sectionToMarkdown("explanation", cycle.explanation ?? "…") ?? "…"
          }
        />
      </OakBox>
      {/* Quiz section without prose styling to prevent checkbox alignment issues */}
      <OakBox className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
        <OakHeading tag="h3" $mt="spacing-24">
          Check for understanding
        </OakHeading>
      </OakBox>
      <CheckForUnderstandingQuiz cycle={cycle} />
      <OakBox className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
        <OakHeading tag="h3" $mt="spacing-24">
          Practice
        </OakHeading>
        <MemoizedReactMarkdownWithStyles markdown={cycle.practice ?? "…"} />

        <OakHeading tag="h3" $mt="spacing-24">
          Feedback
        </OakHeading>
        <MemoizedReactMarkdownWithStyles markdown={cycle.feedback ?? "…"} />
      </OakBox>
    </MathJax>
  );
};
