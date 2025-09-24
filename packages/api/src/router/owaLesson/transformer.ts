import type { LessonPlanSchemaTeachingMaterials } from "@oakai/additional-materials/src/documents/additionalMaterials/sharedSchema";
import type {
  Keyword,
  LatestQuiz,
  LatestQuizQuestion,
  Misconception,
} from "@oakai/aila/src/protocol/schema";

import { type QuizQuestion as OwaQuizQuestion } from "@oaknational/oak-curriculum-schema/";

import type {
  LessonBrowseDataByKsSchema,
  LessonContentSchema,
} from "./schemas";

/**
 * Transforms Oak's quiz format to the format expected by LessonPlanSchemaWhilstStreaming
 */
export function transformQuiz(questions: OwaQuizQuestion[]): LatestQuiz {
  // Refined helper function with proper typing
  function filterUndefined<T>(items?: (T | undefined)[]): T[] {
    return Array.isArray(items)
      ? items.filter((item): item is T => item !== undefined)
      : [];
  }

  // Updated isTextOnly function
  const isTextOnly = (
    items?: OwaQuizQuestion["question_stem"] | OwaQuizQuestion["answers"],
  ) => Array.isArray(items) && items.every((i) => i?.type === "text");

  const extractText = (items?: OwaQuizQuestion["question_stem"]) =>
    (items ?? [])
      .filter(
        (item): item is { text: string; type: "text" } =>
          item.type === "text" && !!item?.text,
      )
      .map((item) => item.text.trim());

  const result: LatestQuizQuestion[] = [];

  for (const q of questions) {
    if (!isTextOnly(q.question_stem)) continue;

    const question = extractText(q.question_stem).join(" ").trim();
    const hint = q.hint ?? null;

    if (q.answers?.["multiple-choice"]) {
      const correct: string[] = [];
      const incorrect: string[] = [];

      let valid = true;

      for (const opt of q.answers["multiple-choice"]) {
        const removeUndefined = filterUndefined(opt.answer);
        if (!isTextOnly(removeUndefined)) {
          valid = false;
          break;
        }

        const text = extractText(removeUndefined).join(" ");
        if (!text) continue;

        if (opt.answer_is_correct) {
          correct.push(text);
        } else {
          incorrect.push(text);
        }
      }

      if (!valid) continue;

      result.push({
        questionType: "multiple-choice",
        question,
        hint,
        answers: correct,
        distractors: incorrect,
      });
    } else if (q.answers?.["short-answer"]) {
      let valid = true;

      // Updated to apply filterUndefined before passing to extractText
      const answers = q.answers["short-answer"]
        .filter((ans) => {
          const removeUndefined = filterUndefined(ans.answer);
          if (!isTextOnly(removeUndefined)) {
            valid = false;
            return false;
          }
          return true;
        })
        .flatMap((ans) => extractText(filterUndefined(ans.answer)));

      if (!valid || answers.length === 0) continue;

      result.push({
        questionType: "short-answer",
        question,
        hint,
        answers,
      });
    } else if (q.answers?.match) {
      let valid = true;
      const pairs: { left: string; right: string }[] = [];

      for (const pair of q.answers.match) {
        if (
          !isTextOnly(pair.match_option) ||
          !isTextOnly(pair.correct_choice)
        ) {
          valid = false;
          break;
        }

        const left = extractText(pair.match_option).join(" ");
        const right = extractText(pair.correct_choice).join(" ");

        if (left && right) {
          pairs.push({ left, right });
        }
      }

      if (!valid || pairs.length === 0) continue;

      result.push({
        questionType: "match",
        question,
        hint,
        pairs,
      });
    } else if (q.answers?.order) {
      let valid = true;

      const ordered = [...q.answers.order]
        .filter(
          (item): item is NonNullable<typeof item> =>
            !!item && typeof item.correct_order === "number",
        )
        .sort((a, b) => (a.correct_order ?? 0) - (b.correct_order ?? 0));

      const items: string[] = [];

      for (const item of ordered) {
        if (!isTextOnly(item.answer)) {
          valid = false;
          break;
        }

        const text = extractText(item.answer).join(" ");
        if (text) items.push(text);
      }

      if (!valid || items.length === 0) continue;

      result.push({
        questionType: "order",
        question,
        hint,
        items,
      });
    }
  }

  return {
    version: "v3",
    questions: result,
    imageMetadata: [],
  };
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
  owaLesson: LessonContentSchema,
  owaBrowseData: LessonBrowseDataByKsSchema,
  pathways: string[],
): LessonPlanSchemaTeachingMaterials {
  const isCanonicalLesson = pathways.length > 0;
  // Create a base lesson plan object
  const lessonPlan: LessonPlanSchemaTeachingMaterials = {
    title: owaLesson.lesson_title ?? "",
    subject: isCanonicalLesson
      ? pathways.join(", ")
      : (owaBrowseData.programme_fields.subject ?? ""),
    keyStage: owaBrowseData.programme_fields.keystage ?? "",
    topic: isCanonicalLesson ? "" : (owaBrowseData.unit_data.title ?? ""),
    year: owaBrowseData.programme_fields.year ?? "",
    // Learning outcome
    learningOutcome: owaLesson.pupil_lesson_outcome ?? "",

    // Key learning points
    keyLearningPoints: Array.isArray(owaLesson.key_learning_points)
      ? owaLesson.key_learning_points.map(
          (item) => item.key_learning_point ?? "",
        )
      : [],

    // Transform misconceptions
    misconceptions: transformMisconceptions(
      owaLesson.misconceptions_and_common_mistakes ?? [],
    ),

    // Transform keywords
    keywords: transformKeywords(owaLesson.lesson_keywords ?? []),

    // Transform quizzes
    starterQuiz: transformQuiz(owaLesson.starter_quiz ?? []),
    exitQuiz: transformQuiz(owaLesson.exit_quiz ?? []),

    // Additional materials (equipment and resources)
    additionalMaterials:
      Array.isArray(owaLesson.equipment_and_resources) &&
      owaLesson.equipment_and_resources.length > 0
        ? owaLesson.equipment_and_resources
            .map((item) => item.equipment ?? "")
            .join("\n")
        : "",

    // Empty placeholders for required fields
    learningCycles: [],
    priorKnowledge: [],
  };

  return lessonPlan;
}
