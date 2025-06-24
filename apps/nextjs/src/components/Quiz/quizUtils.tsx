import React from "react";
import reactStringReplace from "react-string-replace";

import { OakCodeRenderer } from "@oaknational/oak-components";
import type { QuizV2, QuizV2ContentArray } from "@oakai/aila/src/protocol/schemas";
import styled from "styled-components";

const UnderlineSpan = styled.span`
  display: inline-block;
  border-bottom: 2px solid black;
  padding-bottom: 2px;
  min-width: 48px;
  position: relative;
`;

export const shortAnswerTitleFormatter = (
  title: string | null | undefined,
): string | React.ReactNode => {
  const shortAnswerRegex = /\{\{(?:[^{}]|(?!\{\{|\}\})\w)*\}\}/g;
  if (!title) return "";
  if (shortAnswerRegex.test(title)) {
    return reactStringReplace(title, shortAnswerRegex, (match, i) => (
      <React.Fragment key={i}>
        {" "}
        <UnderlineSpan
          // This is an empty box with a line under it, to indicate an answer would go here.
          role="presentation"
          title="An empty space to write an answer in"
          data-testid="underline"
        />{" "}
        <OakCodeRenderer
          string={match}
          $font="code-3"
          $mt={"space-between-ssx"}
        />
      </React.Fragment>
    ));
  } else {
    return (
      <OakCodeRenderer
        string={title}
        $font="code-3"
        $mt={"space-between-ssx"}
      />
    );
  }
};

export const removeMarkdown = (title: string | null | undefined): string => {
  return title ? title.replace(/\*{1,2}(.*?)\*{1,2}/g, "$1") : "";
};

export const constrainHeight = (h?: number) =>
  h ? Math.max(Math.min(200, h), 96) : undefined;

export const calcDims = (w?: number, h?: number) => {
  const constrainedHeight = constrainHeight(h);
  return w && h && constrainedHeight
    ? {
        width: Math.round((w / h) * constrainedHeight),
        height: constrainedHeight,
      }
    : { width: undefined, height: undefined };
};

/**
 * Extract all image attributions from a quiz for display
 */
export const extractImageAttributions = (quiz: QuizV2): { attribution: string; questionNumber: string }[] => {
  const attributions: { attribution: string; questionNumber: string }[] = [];
  
  const extractFromContentArray = (contentArray: QuizV2ContentArray, questionNumber: string) => {
    contentArray.forEach((item) => {
      if (item.type === "image" && item.image.attribution) {
        attributions.push({
          attribution: item.image.attribution,
          questionNumber,
        });
      }
    });
  };

  quiz.questions.forEach((question, index) => {
    const questionNumber = `Q${index + 1}`;
    
    // Extract from question stem
    extractFromContentArray(question.questionStem, questionNumber);
    
    // Extract from question-specific content based on type
    switch (question.questionType) {
      case "multiple-choice":
        question.answers.forEach((answer) => extractFromContentArray(answer, questionNumber));
        question.distractors.forEach((distractor) => extractFromContentArray(distractor, questionNumber));
        break;
      case "short-answer":
        question.answers.forEach((answer) => extractFromContentArray(answer, questionNumber));
        break;
      case "match":
        question.pairs.forEach((pair) => {
          extractFromContentArray(pair.left, questionNumber);
          extractFromContentArray(pair.right, questionNumber);
        });
        break;
      case "order":
        question.items.forEach((item) => extractFromContentArray(item, questionNumber));
        break;
      case "explanatory-text":
        extractFromContentArray(question.content, questionNumber);
        break;
    }
  });

  return attributions;
};
