import type {
  Keyword,
  LooseLessonPlan,
  Misconception,
  QuizQuestion,
} from "@oakai/aila/src/protocol/schema";

import type { SyntheticUnitvariantLessonsByKs } from "@oaknational/oak-curriculum-schema/";
import {
  type QuizQuestion as OwaQuizQuestion,
  quizQuestionSchema,
} from "@oaknational/oak-curriculum-schema/";
import { z } from "zod";

import type {
  LessonBrowseDataByKsSchema,
  lessonContentSchema,
} from "./lessonOverview.schema";

type OwaLesson = z.infer<typeof lessonContentSchema>;

/**
 * Transforms Oak's quiz format to the format expected by LessonPlanSchemaWhilstStreaming
 */
export function transformQuiz(quiz: OwaQuizQuestion[]): QuizQuestion[] {
  const quizData = z.array(quizQuestionSchema).parse(quiz);
  if (!quizData || !Array.isArray(quizData)) {
    return [];
  }

  return quizData.map((question) => {
    if (!question || !question.question_stem) {
      return {
        question: "",
        answers: [],
        distractors: [],
      };
    }
    // Extract the question text from the stem
    const questionText = question.question_stem
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join(" ");

    if (
      question.question_type === "multiple-choice" &&
      question.answers &&
      question.answers["multiple-choice"]
    ) {
      // Extract correct answers
      const correctAnswers = question.answers["multiple-choice"]
        .filter((answer) => answer.answer_is_correct)
        .map((answer) =>
          answer.answer
            .filter((item) => item?.type === "text")
            .map((item) => item.text)
            .join(""),
        );

      // Extract distractors (incorrect answers)
      const distractors = question.answers["multiple-choice"]
        .filter((answer) => !answer.answer_is_correct)
        .map((answer) =>
          answer.answer
            .filter((item) => item?.type === "text")
            .map((item) => item?.text)
            .join(""),
        );

      return {
        question: questionText,
        answers: correctAnswers,
        distractors: distractors,
      };
    } else if (
      question.question_type === "short-answer" &&
      question.answers &&
      question.answers["short-answer"]
    ) {
      // For short answer questions, treat all answers as correct
      const allAnswers = question.answers["short-answer"].map((answer) =>
        answer.answer
          .filter((item) => item?.type === "text")
          .map((item) => item?.text)
          .join(""),
      );

      // Default answers (primary answers) will be treated as the correct ones
      const correctAnswers = question.answers["short-answer"]
        .filter((answer) => answer.answer_is_default)
        .map((answer) =>
          answer.answer
            .filter((item) => item?.type === "text")
            .map((item) => item?.text)
            .join(""),
        );

      // Non-default answers will be treated as distractors/alternative answers
      const distractors = question.answers["short-answer"]
        .filter((answer) => !answer.answer_is_default)
        .map((answer) =>
          answer.answer
            .filter((item) => item?.type === "text")
            .map((item) => item?.text)
            .join(""),
        );

      return {
        question: questionText,
        answers:
          correctAnswers.length > 0 ? correctAnswers : allAnswers.slice(0, 1),
        distractors: distractors.length > 0 ? distractors : [],
      };
    }

    // Fallback for unsupported question types
    return {
      question: questionText,
      answers: [],
      distractors: [],
    };
  });
}

interface OwaMisconception {
  misconception: string;
  response: string;
}

/**
 * Transforms misconceptions format
 */
export function transformMisconceptions(
  misconceptionsData: OwaMisconception[],
): Misconception[] {
  if (!misconceptionsData || !Array.isArray(misconceptionsData)) {
    return [];
  }

  return misconceptionsData.map((item) => {
    return {
      misconception: item.misconception || "",
      description: item.response || "", // OWA uses 'response' for what we call 'description'
    };
  });
}

interface OwaKeyword {
  keyword: string;
  description: string;
}

/**
 * Transforms keywords format
 */
export function transformKeywords(keywordsData: OwaKeyword[]): Keyword[] {
  if (!keywordsData || !Array.isArray(keywordsData)) {
    return [];
  }

  return keywordsData.map((item) => {
    return {
      keyword: item.keyword || "",
      definition: item.description || "", // OWA uses 'description' for what we call 'definition'
    };
  });
}

/**
 * Transforms an OWA lesson to the format expected by LessonPlanSchemaWhilstStreaming
 */
export function transformOwaLessonToLessonPlan(
  owaLesson: OwaLesson,
  owaBrowseData: LessonBrowseDataByKsSchema,
): LooseLessonPlan {
  // Create a base lesson plan object
  const lessonPlan: LooseLessonPlan = {
    title: owaLesson.lesson_title || "",
    subject: owaBrowseData.programme_fields.subject || "",
    keyStage: owaBrowseData.programme_fields.keystage || "",
    topic: owaBrowseData.unit_data.title || "",

    // Learning outcome
    learningOutcome: owaLesson.pupil_lesson_outcome || "",

    // Key learning points
    keyLearningPoints: Array.isArray(owaLesson.key_learning_points)
      ? owaLesson.key_learning_points.map(
          (item) => item.key_learning_point || "",
        )
      : [],

    // Transform misconceptions
    misconceptions: transformMisconceptions(
      owaLesson.misconceptions_and_common_mistakes || [],
    ),

    // Transform keywords
    keywords: transformKeywords(owaLesson.lesson_keywords || []),

    // Transform quizzes
    starterQuiz: transformQuiz(owaLesson.starter_quiz || []),
    exitQuiz: transformQuiz(owaLesson.exit_quiz || []),

    // Additional materials (equipment and resources)
    additionalMaterials:
      Array.isArray(owaLesson.equipment_and_resources) &&
      owaLesson.equipment_and_resources.length > 0
        ? owaLesson.equipment_and_resources
            .map((item) => item.equipment || "")
            .join("\n")
        : "",

    // Empty placeholders for required fields
    learningCycles: [],
    priorKnowledge: [],
  };

  return lessonPlan;
}
