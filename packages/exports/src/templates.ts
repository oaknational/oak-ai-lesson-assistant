import invariant from "tiny-invariant";

import type { LessonPlanDocInputData } from "./schema/input.schema";

invariant(
  process.env.GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_ID,
  "GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_ID is required",
);
invariant(
  process.env.GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_1_LEARNING_CYCLE_ID,
  "GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_1_LEARNING_CYCLE_ID is required",
);
invariant(
  process.env.GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_2_LEARNING_CYCLES_ID,
  "GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_2_LEARNING_CYCLES_ID is required",
);

export function getDocsTemplateIdLessonPlan({
  cycle2,
  cycle3,
}: Pick<LessonPlanDocInputData, "cycle2" | "cycle3">) {
  if (!cycle2) {
    return process.env
      .GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_1_LEARNING_CYCLE_ID as string;
  }

  if (!cycle3) {
    return process.env
      .GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_2_LEARNING_CYCLES_ID as string;
  }

  return process.env.GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_ID as string;
}

/**
 * Docs / Quiz
 */
invariant(
  process.env.GOOGLE_DOCS_QUIZ_TEMPLATE_ID,
  "GOOGLE_DOCS_QUIZ_TEMPLATE_ID is required",
);
export function getDocsTemplateIdQuiz() {
  return process.env.GOOGLE_DOCS_QUIZ_TEMPLATE_ID as string;
}

/**
 * Slides / Full lesson
 */
invariant(
  process.env.GOOGLE_SLIDES_TEMPLATE_ID,
  "GOOGLE_SLIDES_TEMPLATE_ID is required",
);
export function getSlidesTemplateIdFullLesson() {
  return process.env.GOOGLE_SLIDES_TEMPLATE_ID as string;
}

/**
 * Doc / Additional materials
 */
invariant(
  process.env.GOOGLE_DOCS_ADDITIONAL_MATERIALS_TEMPLATE_ID,
  "GOOGLE_DOCS_ADDITIONAL_MATERIALS_TEMPLATE_ID is required",
);
export function getSlidesTemplateIdAdditionalMaterials() {
  return process.env.GOOGLE_DOCS_ADDITIONAL_MATERIALS_TEMPLATE_ID as string;
}

/**
 * Slides / Worksheet
 */
invariant(
  process.env.GOOGLE_SLIDES_WORKSHEET_TEMPLATE_ID,
  "GOOGLE_SLIDES_WORKSHEET_TEMPLATE_ID is required",
);
export function getSlidesTemplateIdWorksheet() {
  return process.env.GOOGLE_SLIDES_WORKSHEET_TEMPLATE_ID as string;
}

/**
 * DOCS / Worksheet
 */
invariant(
  process.env.GOOGLE_DOCS_WORKSHEET_TEMPLATE_ID,
  "GOOGLE_DOCS_WORKSHEET_TEMPLATE_ID is required",
);
export function getDocsTemplateIdWorksheet() {
  return process.env.GOOGLE_DOCS_WORKSHEET_TEMPLATE_ID as string;
}

/*
 * Quiz Designer Slides
 */
invariant(
  process.env.GOOGLE_SLIDES_QUIZ_DESIGNER_TEMPLATE_ID,
  "GOOGLE_SLIDES_QUIZ_DESIGNER_TEMPLATE_ID is required",
);
export function getQuizDesignerSlidesTemplateIdWorksheet() {
  return process.env.GOOGLE_SLIDES_QUIZ_DESIGNER_TEMPLATE_ID as string;
}

/**
 * Additional Resources
 */
invariant(
  process.env.GOOGLE_DOCS_GLOSSARY_TEMPLATE_ID,
  "GOOGLE_DOCS_GLOSSARY_TEMPLATE_ID is required",
);
invariant(
  process.env.GOOGLE_DOCS_COMPREHENSION_TEMPLATE_ID,
  "GOOGLE_DOCS_COMPREHENSION_TEMPLATE_ID is required",
);
invariant(
  process.env.GOOGLE_DOCS_COMPREHENSION_ANSWERS_TEMPLATE_ID,
  "GOOGLE_DOCS_COMPREHENSION_ANSWERS_TEMPLATE_ID is required",
);
invariant(
  process.env.GOOGLE_DOCS_ADDITIONAL_QUIZ_ID,
  "GOOGLE_DOCS_ADDITIONAL_QUIZ_ID is required",
);

export const getAdditionalResourcesTemplateId = ({
  docType,
  withAnswers = false,
}: {
  docType: string;
  withAnswers?: boolean;
}) => {
  if (docType === "additional-glossary") {
    return process.env.GOOGLE_DOCS_GLOSSARY_TEMPLATE_ID as string;
  }

  if (docType === "additional-comprehension") {
    if (withAnswers) {
      return process.env
        .GOOGLE_DOCS_COMPREHENSION_ANSWERS_TEMPLATE_ID as string;
    }
    return process.env.GOOGLE_DOCS_COMPREHENSION_TEMPLATE_ID as string;
  }

  if (
    docType === "additional-starter-quiz" ||
    docType === "additional-exit-quiz"
  ) {
    return process.env.GOOGLE_DOCS_ADDITIONAL_QUIZ_ID as string;
  }

  throw new Error(`Unknown docType: ${docType}`);
};

// Function to get all template IDs for a doc type (used for generating multiple documents)
export const getAllTemplateIdsForDocType = (docType: string): string[] => {
  if (docType === "additional-comprehension") {
    return [
      process.env.GOOGLE_DOCS_COMPREHENSION_TEMPLATE_ID as string,
      process.env.GOOGLE_DOCS_COMPREHENSION_ANSWERS_TEMPLATE_ID as string,
    ];
  }

  // For other document types, just return the single template ID
  return [getAdditionalResourcesTemplateId({ docType: docType })];
};
