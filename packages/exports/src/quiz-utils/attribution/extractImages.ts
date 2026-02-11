import type { ExtractedImage, QuizQuestion } from "./types";

/**
 * Extracts image URLs from markdown text
 * Matches format: ![alt text](url)
 */
export function extractImageUrlsFromText(
  text: string,
): Array<{ url: string; altText: string }> {
  // Prevent catastrophic backtracking by limiting match lengths
  const imageRegex = /!\[([^\]]{0,300}?)\]\((https?:\/\/[^)\s]{1,1000})\)/g;
  const matches = Array.from(text.matchAll(imageRegex));

  return matches
    .map((match) => ({
      url: match[2] ?? "",
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- intentional: empty alt text should default to "image"
      altText: match[1] || "image",
    }))
    .filter((item) => item.url);
}

/**
 * Extracts all images from a question with their positions
 */
export function extractImagesFromQuestion(
  question: QuizQuestion,
  _questionNumber: number,
): ExtractedImage[] {
  const images: Array<{ url: string; altText: string }> = [];

  // Extract from question text
  images.push(...extractImageUrlsFromText(question.question));

  // Extract from question-specific content
  switch (question.questionType) {
    case "multiple-choice":
      // Extract from answers
      question.answers.forEach((answer: string) => {
        images.push(...extractImageUrlsFromText(answer));
      });
      // Extract from distractors
      question.distractors.forEach((distractor: string) => {
        images.push(...extractImageUrlsFromText(distractor));
      });
      break;

    case "match":
      // Extract from left and right items
      question.pairs.forEach((pair: { left: string; right: string }) => {
        images.push(...extractImageUrlsFromText(pair.left));
        images.push(...extractImageUrlsFromText(pair.right));
      });
      break;

    case "order":
      // Extract from items
      question.items.forEach((item: string) => {
        images.push(...extractImageUrlsFromText(item));
      });
      break;

    case "short-answer":
      // Short answer questions only have images in question text
      // Already extracted above
      break;
  }

  // Return with 1-based indexing
  return images.map((image, index) => ({
    url: image.url,
    index: index + 1,
    altText: image.altText,
  }));
}
