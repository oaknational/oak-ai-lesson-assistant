import type {
  LatestQuiz,
  LatestQuizQuestion,
} from "@oakai/aila/src/protocol/schema";

import { formatNumberRanges } from "./formatNumberRanges";

export function extractImageUrls(text: string): string[] {
  // Matches markdown image syntax: ![alt text](url)
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

  const matches = Array.from(text.matchAll(imageRegex));
  return matches.map((match) => match[2]).filter((url): url is string => !!url);
}

export function getAttributionsForQuestion(
  question: LatestQuizQuestion,
  quizAttributions: LatestQuiz["imageMetadata"],
): string[] {
  if (!quizAttributions || quizAttributions.length === 0) {
    return [];
  }

  const questionImageUrls = extractImageUrls(question.question);

  let answerImageUrls: string[] = [];
  if (question.questionType === "multiple-choice") {
    answerImageUrls = [
      ...question.answers.flatMap(extractImageUrls),
      ...question.distractors.flatMap(extractImageUrls),
    ];
  }

  const allImageUrls = [...questionImageUrls, ...answerImageUrls];

  const attributions = quizAttributions
    .filter((attr) => allImageUrls.includes(attr.imageUrl))
    .map((attr) => attr.attribution)
    .filter((attr): attr is string => attr !== null); // Handle nullable attributions in V3

  // Return unique attributions
  return Array.from(new Set(attributions));
}

export function getGroupedAttributions(
  questions: LatestQuizQuestion[],
  quizAttributions: LatestQuiz["imageMetadata"],
): Record<string, number[]> {
  const attributionGroups: Record<string, number[]> = {};

  questions.forEach((question, index) => {
    const attributions = getAttributionsForQuestion(question, quizAttributions);

    attributions.forEach((attribution) => {
      if (!attributionGroups[attribution]) {
        attributionGroups[attribution] = [];
      }
      attributionGroups[attribution].push(index + 1);
    });
  });

  return attributionGroups;
}

export function getFormattedAttributions(
  questions: LatestQuizQuestion[],
  quizAttributions: LatestQuiz["imageMetadata"],
): Array<{ attribution: string; questionRange: string }> {
  const groups = getGroupedAttributions(questions, quizAttributions);

  return Object.entries(groups).map(([attribution, questionNumbers]) => ({
    attribution,
    questionRange: formatNumberRanges(questionNumbers),
  }));
}
