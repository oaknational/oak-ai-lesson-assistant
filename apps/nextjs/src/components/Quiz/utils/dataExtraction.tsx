import type { QuizV2, QuizV2ContentArray } from "@oakai/aila/src/protocol/schemas";

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