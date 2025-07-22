import type { QuizV2, QuizV2Question } from "@oakai/aila/src/protocol/schema";

import { formatNumberRanges } from "./formatNumberRanges";

export function extractImageUrls(text: string): string[] {
  // Matches markdown image syntax: ![alt text](url)
  // More precise: only matches content between [ and ] that doesn't contain unescaped brackets
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

  const matches = Array.from(text.matchAll(imageRegex));
  return matches.map((match) => match[2]).filter((url): url is string => !!url);
}

export function getAttributionsForQuestion(
  question: QuizV2Question,
  quizAttributions: QuizV2["imageAttributions"],
): string[] {
  if (!quizAttributions || quizAttributions.length === 0) {
    return [];
  }

  // Extract image URLs from question text and answer choices
  const questionImageUrls = extractImageUrls(question.question);

  let answerImageUrls: string[] = [];
  if (question.questionType === "multiple-choice") {
    answerImageUrls = [
      ...question.answers.flatMap(extractImageUrls),
      ...question.distractors.flatMap(extractImageUrls),
    ];
  }

  const allImageUrls = [...questionImageUrls, ...answerImageUrls];

  // Find attributions for these images
  const attributions = quizAttributions
    .filter((attr) => allImageUrls.includes(attr.imageUrl))
    .map((attr) => attr.attribution);

  // Return unique attributions
  return Array.from(new Set(attributions));
}

export function getGroupedAttributions(
  questions: QuizV2Question[],
  quizAttributions: QuizV2["imageAttributions"],
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
  questions: QuizV2Question[],
  quizAttributions: QuizV2["imageAttributions"],
): Array<{ attribution: string; questionRange: string }> {
  const groups = getGroupedAttributions(questions, quizAttributions);

  return Object.entries(groups).map(([attribution, questionNumbers]) => ({
    attribution,
    questionRange: formatNumberRanges(questionNumbers),
  }));
}
