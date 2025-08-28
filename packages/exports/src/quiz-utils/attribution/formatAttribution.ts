import { extractImagesFromQuestion } from "./extractImages";
import type {
  AttributionSegment,
  FormattedAttribution,
  ImageAttributionMetadata,
  ImageWithAttribution,
  QuizV2Question,
} from "./types";

/**
 * Groups quiz questions with their image attributions
 */
export function mapQuestionImages(
  questions: QuizV2Question[],
  imageMetadata: ImageAttributionMetadata[],
): ImageWithAttribution[] {
  const result: ImageWithAttribution[] = [];

  questions.forEach((question, questionIndex) => {
    const questionNumber = questionIndex + 1;
    const extractedImages = extractImagesFromQuestion(question, questionNumber);

    extractedImages.forEach((image) => {
      // Find attribution for this image URL
      const attribution = imageMetadata.find(
        (attr) => attr.imageUrl === image.url,
      );

      if (attribution?.attribution) {
        result.push({
          questionNumber,
          imageIndex: image.index,
          imageUrl: image.url,
          attribution: attribution.attribution,
          altText: image.altText,
        });
      }
    });
  });

  return result;
}

/**
 * Formats attribution text for display/export
 * Format: "Q1 Image 1 Source1; Image 2 Source2 Q2 Image 1 Source3"
 */
export function formatAttributionText(
  imagesWithAttributions: ImageWithAttribution[],
): FormattedAttribution {
  if (imagesWithAttributions.length === 0) {
    return {
      plainText: "",
      segments: [],
    };
  }

  // Group by question number
  const questionGroups = new Map<number, ImageWithAttribution[]>();
  imagesWithAttributions.forEach((item) => {
    if (!questionGroups.has(item.questionNumber)) {
      questionGroups.set(item.questionNumber, []);
    }
    questionGroups.get(item.questionNumber)!.push(item);
  });

  // Sort questions by number
  const sortedQuestions = Array.from(questionGroups.keys()).sort(
    (a, b) => a - b,
  );

  const segments: AttributionSegment[] = [];
  let plainText = "";

  sortedQuestions.forEach((questionNumber, questionIndex) => {
    const images = questionGroups.get(questionNumber)!;

    // Sort images by index within question
    images.sort((a, b) => a.imageIndex - b.imageIndex);

    // Add space between questions (except first)
    if (questionIndex > 0) {
      segments.push({ text: " ", bold: false });
      plainText += " ";
    }

    images.forEach((image, imageIndex) => {
      // Add semicolon between images in same question (except first)
      if (imageIndex > 0) {
        segments.push({ text: "; ", bold: false });
        plainText += "; ";
      }

      // Question and image identifier (bold)
      const identifier =
        imageIndex === 0
          ? `Q${questionNumber} Image ${image.imageIndex}`
          : `Image ${image.imageIndex}`;

      segments.push({ text: identifier, bold: true });
      plainText += identifier;

      // Attribution (regular)
      const attribution = ` ${image.attribution}`;
      segments.push({ text: attribution, bold: false });
      plainText += attribution;
    });
  });

  return {
    plainText,
    segments,
  };
}

/**
 * Main function to format quiz attributions
 */
export function formatQuizAttributions(
  questions: QuizV2Question[],
  imageMetadata: ImageAttributionMetadata[],
): FormattedAttribution {
  const imagesWithAttributions = mapQuestionImages(questions, imageMetadata);
  return formatAttributionText(imagesWithAttributions);
}
