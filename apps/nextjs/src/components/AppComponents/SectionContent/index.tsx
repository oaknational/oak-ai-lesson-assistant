import type {
  LessonPlanKey,
  LessonPlanSectionWhileStreaming,
} from "@oakai/aila/src/protocol/schema";
import { QuizV1Schema } from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";

import { MathJax } from "better-react-mathjax";

import { MemoizedReactMarkdownWithStyles } from "../Chat/markdown";
import { QuizSection } from "./QuizSection";

export type SectionContentProps = {
  sectionKey: LessonPlanKey;
  value: LessonPlanSectionWhileStreaming;
};

export const SectionContent = ({ sectionKey, value }: SectionContentProps) => {
  if (sectionKey === "starterQuiz" || sectionKey === "exitQuiz") {
    const quizResult = QuizV1Schema.safeParse(value);
    if (quizResult.success) {
      return (
        <MathJax hideUntilTypeset="every" dynamic>
          <QuizSection quiz={quizResult.data} />
        </MathJax>
      );
    }
    // Invalid quiz data, show error or empty
    return <div>Quiz data invalid or loading...</div>;
  }
  return (
    <MathJax hideUntilTypeset="every" dynamic>
      <MemoizedReactMarkdownWithStyles
        markdown={sectionToMarkdown(sectionKey, value) ?? ""}
      />
    </MathJax>
  );
};
