import type {
  LessonPlanKey,
  LessonPlanSectionWhileStreaming,
} from "@oakai/aila/src/protocol/schema";
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
    return (
      <MathJax hideUntilTypeset="every" dynamic>
        <QuizSection quizSection={value} />
      </MathJax>
    );
  }
  return (
    <MathJax hideUntilTypeset="every" dynamic>
      <MemoizedReactMarkdownWithStyles
        markdown={sectionToMarkdown(sectionKey, value) ?? ""}
      />
    </MathJax>
  );
};
