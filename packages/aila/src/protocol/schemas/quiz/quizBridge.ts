/**
 * Bridge logic between V1 (MC-only) and V2 (discriminated union) quiz schemas
 *
 * This module provides utilities to convert between the two schema versions:
 * - V1: Multiple choice only format (legacy)
 * - V2: Discriminated union supporting multiple quiz types
 */
import type { QuizV1, QuizV1Question, QuizV2, QuizV2Question } from ".";
import type { RawQuiz } from "./rawQuiz";
import { keysToCamelCase } from "./rawQuiz";

/**
 * Convert a V1 quiz question (MC only) to V2 format
 */
export function convertQuizV1QuestionToV2(
  questionV1: QuizV1Question,
): QuizV2Question {
  return {
    questionType: "multiple-choice" as const,
    questionStem: questionV1.question,
    answers: questionV1.answers,
    distractors: questionV1.distractors,
    feedback: undefined,
    hint: undefined,
  };
}

/**
 * Convert a V2 quiz question to V1 format (MC only)
 * Non-MC questions are converted with data loss
 */
export function convertQuizV2QuestionToV1(
  questionV2: QuizV2Question,
): QuizV1Question {
  const baseQuestion: QuizV1Question = {
    question: questionV2.questionStem,
    answers: [],
    distractors: [],
  };

  switch (questionV2.questionType) {
    case "multiple-choice":
      return {
        question: questionV2.questionStem,
        answers: questionV2.answers,
        distractors: questionV2.distractors,
      };

    case "short-answer":
      return {
        question: questionV2.questionStem,
        answers: questionV2.answers,
        distractors: ["N/A", "N/A"], // Short answer needs distractors for V1 format
      };

    case "match":
      // Convert match pairs to a single correct answer
      const matchAnswer = questionV2.pairs
        .map((pair) => `${pair.left} → ${pair.right}`)
        .join("; ");
      return {
        question: questionV2.questionStem,
        answers: [matchAnswer],
        distractors: ["Incorrect matches", "Wrong pairing"],
      };

    case "order":
      // Convert order items to a single correct answer
      const orderAnswer = questionV2.items.join(" → ");
      return {
        question: questionV2.questionStem,
        answers: [orderAnswer],
        distractors: ["Wrong order", "Incorrect sequence"],
      };

    case "explanatory-text":
      // Explanatory text becomes a statement question
      return {
        question: questionV2.questionStem,
        answers: [questionV2.content],
        distractors: ["N/A", "N/A"],
      };

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = questionV2;
      return baseQuestion;
  }
}

/**
 * Convert an entire V1 quiz to V2 format
 */
export function convertQuizV1ToV2(quizV1: QuizV1): QuizV2 {
  return quizV1.map(convertQuizV1QuestionToV2);
}

/**
 * Convert an entire V2 quiz to V1 format
 */
export function convertQuizV2ToV1(quizV2: QuizV2): QuizV1 {
  return quizV2.map(convertQuizV2QuestionToV1);
}

/**
 * Check if a quiz question is multiple choice (compatible with V1)
 */
export function isMultipleChoiceQuestion(question: QuizV2Question): boolean {
  return question.questionType === "multiple-choice";
}

/**
 * Filter a V2 quiz to only include multiple choice questions
 */
export function filterMultipleChoiceQuestions(quizV2: QuizV2): QuizV2 {
  return quizV2.filter(isMultipleChoiceQuestion);
}

/**
 * Get statistics about quiz question types in a V2 quiz
 */
export function getQuizTypeStatistics(quizV2: QuizV2): Record<string, number> {
  const stats: Record<string, number> = {};

  for (const question of quizV2) {
    const type = question.questionType;
    stats[type] = (stats[type] || 0) + 1;
  }

  return stats;
}

/**
 * Check if a V2 quiz is fully compatible with V1 (all MC questions)
 */
export function isV1Compatible(quizV2: QuizV2): boolean {
  return quizV2.every(isMultipleChoiceQuestion);
}

/**
 * Create a V2 multiple choice question from basic components
 */
export function createMultipleChoiceQuestionV2(
  question: string,
  answers: string[],
  distractors: string[],
  feedback?: string,
  hint?: string,
): QuizV2Question {
  return {
    questionType: "multiple-choice" as const,
    questionStem: question,
    answers,
    distractors,
    feedback,
    hint,
  };
}

/**
 * Create a V2 short answer question from basic components
 */
export function createShortAnswerQuestionV2(
  question: string,
  answers: string[],
  feedback?: string,
  hint?: string,
): QuizV2Question {
  return {
    questionType: "short-answer" as const,
    questionStem: question,
    answers,
    feedback,
    hint,
  };
}

/**
 * Create a V2 match question from basic components
 */
export function createMatchQuestionV2(
  question: string,
  pairs: Array<{ left: string; right: string }>,
  feedback?: string,
  hint?: string,
): QuizV2Question {
  return {
    questionType: "match" as const,
    questionStem: question,
    pairs,
    feedback,
    hint,
  };
}

/**
 * Create a V2 order question from basic components
 */
export function createOrderQuestionV2(
  question: string,
  items: string[],
  feedback?: string,
  hint?: string,
): QuizV2Question {
  return {
    questionType: "order" as const,
    questionStem: question,
    items,
    feedback,
    hint,
  };
}

/**
 * Create a V2 explanatory text question from basic components
 */
export function createExplanatoryTextQuestionV2(
  question: string,
  content: string,
  feedback?: string,
  hint?: string,
): QuizV2Question {
  return {
    questionType: "explanatory-text" as const,
    questionStem: question,
    content,
    feedback,
    hint,
  };
}

// ********** BACKWARD COMPATIBILITY UTILITIES **********

/**
 * Safely convert any quiz data to V1 format for backward compatibility
 * Handles both V1 (passthrough) and V2 (conversion) inputs
 */
export function ensureQuizV1Compatible(quiz: QuizV1 | QuizV2): QuizV1 {
  // Check if it's already V1 format by looking at the first question
  if (quiz.length === 0) return [];

  const firstQuestion = quiz[0];
  if (!firstQuestion) return [];

  // V1 questions have 'question', 'answers', 'distractors' properties
  // V2 questions have 'questionType', 'questionStem' properties
  if (
    "question" in firstQuestion &&
    "answers" in firstQuestion &&
    "distractors" in firstQuestion
  ) {
    // This is already V1 format
    return quiz as QuizV1;
  }

  // This is V2 format, convert to V1
  return convertQuizV2ToV1(quiz as QuizV2);
}

/**
 * Safely convert any quiz data to V2 format for enhanced functionality
 * Handles both V1 (conversion) and V2 (passthrough) inputs
 */
export function ensureQuizV2Compatible(quiz: QuizV1 | QuizV2): QuizV2 {
  // Check if it's already V2 format by looking at the first question
  if (quiz.length === 0) return [];

  const firstQuestion = quiz[0];
  if (!firstQuestion) return [];

  // V2 questions have 'questionType' and 'questionStem' properties
  if ("questionType" in firstQuestion && "questionStem" in firstQuestion) {
    // This is already V2 format
    return quiz as QuizV2;
  }

  // This is V1 format, convert to V2
  return convertQuizV1ToV2(quiz as QuizV1);
}

/**
 * Detect the quiz schema version
 */
export function detectQuizVersion(
  quiz: QuizV1 | QuizV2,
): "v1" | "v2" | "unknown" {
  if (quiz.length === 0) return "unknown";

  const firstQuestion = quiz[0];
  if (!firstQuestion) return "unknown";

  if ("questionType" in firstQuestion && "questionStem" in firstQuestion) {
    return "v2";
  }

  if (
    "question" in firstQuestion &&
    "answers" in firstQuestion &&
    "distractors" in firstQuestion
  ) {
    return "v1";
  }

  return "unknown";
}

/**
 * Migrate a lesson plan's quizzes from V1 to V2 format
 * This is a utility for future migrations
 */
export function migrateLessonQuizzesToV2(lessonPlan: {
  starterQuiz?: QuizV1;
  exitQuiz?: QuizV1;
}): {
  starterQuiz?: QuizV1;
  exitQuiz?: QuizV1;
  starterQuizV2?: QuizV2;
  exitQuizV2?: QuizV2;
} {
  const result = { ...lessonPlan };

  if (lessonPlan.starterQuiz) {
    (result as any).starterQuizV2 = convertQuizV1ToV2(lessonPlan.starterQuiz);
  }

  if (lessonPlan.exitQuiz) {
    (result as any).exitQuizV2 = convertQuizV1ToV2(lessonPlan.exitQuiz);
  }

  return result;
}

/**
 * Get the most appropriate quiz format for a given use case
 * - For LLM generation: Always return V1 (MC only)
 * - For display: Return V2 if available, fallback to V1
 * - For export: Return V2 if available, fallback to V1
 */
export function getQuizForContext(
  context: "llm-generation" | "display" | "export",
  v1Quiz?: QuizV1,
  v2Quiz?: QuizV2,
): QuizV1 | QuizV2 | undefined {
  switch (context) {
    case "llm-generation":
      // For LLM generation, always use V1 (MC only) format
      if (v1Quiz) return v1Quiz;
      if (v2Quiz) return convertQuizV2ToV1(v2Quiz);
      return undefined;

    case "display":
    case "export":
      // For display and export, prefer V2 (richer format) if available
      if (v2Quiz) return v2Quiz;
      if (v1Quiz) return convertQuizV1ToV2(v1Quiz);
      return undefined;

    default:
      return undefined;
  }
}

// ********** RAW QUIZ SCHEMA CONVERSION **********

/**
 * Convert Oak's raw quiz schema to our V2 format
 * This bridges the gap between Oak's curriculum schema and Aila's internal schema
 */
export function convertRawQuizToV2(rawQuiz: RawQuiz): QuizV2 {
  if (!rawQuiz || !Array.isArray(rawQuiz)) {
    return [];
  }

  return rawQuiz.map((rawQuestion) => {
    if (!rawQuestion) {
      // Fallback for invalid questions
      return createMultipleChoiceQuestionV2(
        "Invalid question",
        ["N/A"],
        ["N/A"],
      );
    }

    // Convert to camelCase
    const question = keysToCamelCase(rawQuestion);

    // Extract question stem text (combining text and image elements)
    const questionStem =
      question.questionStem
        ?.map((stem) => {
          if (stem.type === "text") {
            return stem.text;
          } else if (stem.type === "image") {
            return `![image](${stem.imageObject?.secureUrl || stem.imageObject?.url || ""})`;
          }
          return "";
        })
        .join(" ") || "Question";

    const feedback = question.feedback || undefined;
    const hint = question.hint || undefined;

    switch (question.questionType) {
      case "multiple-choice": {
        const mcAnswers = question.answers?.multipleChoice || [];
        const correctAnswers = mcAnswers
          .filter((answer) => answer.answerIsCorrect)
          .map((answer) => extractTextFromAnswerItems(answer.answer || []));
        const distractors = mcAnswers
          .filter((answer) => !answer.answerIsCorrect)
          .map((answer) => extractTextFromAnswerItems(answer.answer || []));

        return createMultipleChoiceQuestionV2(
          questionStem,
          correctAnswers,
          distractors,
          feedback,
          hint,
        );
      }

      case "short-answer": {
        const saAnswers = question.answers?.shortAnswer || [];
        const answers = saAnswers.map((answer) =>
          extractTextFromAnswerItems(answer.answer || []),
        );

        return createShortAnswerQuestionV2(
          questionStem,
          answers,
          feedback,
          hint,
        );
      }

      case "match": {
        const matchAnswers = question.answers?.match || [];
        const pairs = matchAnswers.map((match) => ({
          left: extractTextFromAnswerItems(match.option || []),
          right: extractTextFromAnswerItems(match.match || []),
        }));

        return createMatchQuestionV2(questionStem, pairs, feedback, hint);
      }

      case "order": {
        const orderAnswers = question.answers?.order || [];
        const items = orderAnswers
          .sort((a, b) => (a.correctOrder || 0) - (b.correctOrder || 0))
          .map((order) => extractTextFromAnswerItems(order.answer || []));

        return createOrderQuestionV2(questionStem, items, feedback, hint);
      }

      case "explanatory-text": {
        return createExplanatoryTextQuestionV2(
          questionStem,
          questionStem, // For explanatory text, content is the same as stem
          feedback,
          hint,
        );
      }

      default:
        // Fallback to multiple choice for unknown types
        return createMultipleChoiceQuestionV2(
          questionStem,
          ["Unknown question type"],
          ["N/A", "N/A"],
          feedback,
          hint,
        );
    }
  });
}

/**
 * Extract text content from Oak's answer item format
 * Oak uses arrays of text/image items, we need to extract just the text
 */
function extractTextFromAnswerItems(
  items: Array<{ type?: string; text?: string } | undefined>,
): string {
  return (
    items
      .filter((item) => item?.type === "text" && item?.text)
      .map((item) => item?.text || "")
      .join(" ")
      .trim() || ""
  );
}

/**
 * Convert Oak's raw quiz to V1 format (for backward compatibility)
 */
export function convertRawQuizToV1(rawQuiz: RawQuiz): QuizV1 {
  const v2Quiz = convertRawQuizToV2(rawQuiz);
  return convertQuizV2ToV1(v2Quiz);
}
