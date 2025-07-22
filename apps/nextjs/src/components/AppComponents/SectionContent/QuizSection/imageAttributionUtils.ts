import type { QuizV2, QuizV2Question } from "@oakai/aila/src/protocol/schema";

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

export function getQuestionsWithAttributions(
  questions: QuizV2Question[],
  quizAttributions: QuizV2["imageAttributions"],
): Array<{ questionNumber: number; attributions: string[] }> {
  return questions
    .map((question, index) => ({
      questionNumber: index + 1,
      attributions: getAttributionsForQuestion(question, quizAttributions),
    }))
    .filter((item) => item.attributions.length > 0);
}
