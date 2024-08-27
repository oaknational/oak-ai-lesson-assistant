import { LessonPlanDocInputData } from "./schema/input.schema";

const GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_ID =
  process.env.GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_ID;

const GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_1_LEARNING_CYCLE_ID =
  process.env.GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_1_LEARNING_CYCLE_ID;

const GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_2_LEARNING_CYCLES_ID =
  process.env.GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_2_LEARNING_CYCLES_ID;

if (!GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_ID) {
  throw new Error("GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_ID is required");
}

if (!GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_1_LEARNING_CYCLE_ID) {
  throw new Error(
    "GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_1_LEARNING_CYCLE_ID is required",
  );
}

if (!GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_2_LEARNING_CYCLES_ID) {
  throw new Error(
    "GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_2_LEARNING_CYCLES_ID is required",
  );
}

export function getDocsTemplateIdLessonPlan({
  cycle2,
  cycle3,
}: Pick<LessonPlanDocInputData, "cycle2" | "cycle3">) {
  let templateId = GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_ID;

  if (!cycle3) {
    templateId = GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_2_LEARNING_CYCLES_ID;
  }

  if (!cycle2) {
    templateId = GOOGLE_DOCS_LESSON_PLAN_TEMPLATE_1_LEARNING_CYCLE_ID;
  }

  return templateId;
}

/**
 * Docs / Quiz
 */
const GOOGLE_DOCS_QUIZ_TEMPLATE_ID = process.env.GOOGLE_DOCS_QUIZ_TEMPLATE_ID;

if (!GOOGLE_DOCS_QUIZ_TEMPLATE_ID) {
  throw new Error("GOOGLE_DOCS_QUIZ_TEMPLATE_ID is required");
}
export function getDocsTemplateIdQuiz() {
  const templateId = GOOGLE_DOCS_QUIZ_TEMPLATE_ID;
  if (!templateId) {
    throw new Error("Template ID not found");
  }
  return templateId;
}

/**
 * Slides / Full lesson
 */
const GOOGLE_SLIDES_TEMPLATE_ID = process.env.GOOGLE_SLIDES_TEMPLATE_ID;

if (!GOOGLE_SLIDES_TEMPLATE_ID) {
  throw new Error("GOOGLE_SLIDES_TEMPLATE_ID is required");
}
export function getSlidesTemplateIdFullLesson() {
  const templateId = GOOGLE_SLIDES_TEMPLATE_ID;
  if (!templateId) {
    throw new Error("Template ID not found");
  }
  return templateId;
}

/**
 * Doc / Additional materials
 */
const GOOGLE_DOCS_ADDITIONAL_MATERIALS_TEMPLATE_ID =
  process.env.GOOGLE_DOCS_ADDITIONAL_MATERIALS_TEMPLATE_ID;

if (!GOOGLE_DOCS_ADDITIONAL_MATERIALS_TEMPLATE_ID) {
  throw new Error("GOOGLE_DOCS_ADDITIONAL_MATERIALS_TEMPLATE_ID is required");
}
export function getSlidesTemplateIdAdditionalMaterials() {
  const templateId = GOOGLE_DOCS_ADDITIONAL_MATERIALS_TEMPLATE_ID;
  if (!templateId) {
    throw new Error("Template ID not found");
  }
  return templateId;
}

/**
 * Slides / Worksheet
 */
const GOOGLE_SLIDES_WORKSHEET_TEMPLATE_ID =
  process.env.GOOGLE_SLIDES_WORKSHEET_TEMPLATE_ID;

if (!GOOGLE_SLIDES_WORKSHEET_TEMPLATE_ID) {
  throw new Error("GOOGLE_SLIDES_WORKSHEET_TEMPLATE_ID is required");
}
export function getSlidesTemplateIdWorksheet() {
  const templateId = GOOGLE_SLIDES_WORKSHEET_TEMPLATE_ID;
  if (!templateId) {
    throw new Error("Template ID not found");
  }
  return templateId;
}

/**
 * DOCS / Worksheet
 */
const GOOGLE_DOCS_WORKSHEET_TEMPLATE_ID =
  process.env.GOOGLE_DOCS_WORKSHEET_TEMPLATE_ID;

if (!GOOGLE_DOCS_WORKSHEET_TEMPLATE_ID) {
  throw new Error("GOOGLE_DOCS_WORKSHEET_TEMPLATE_ID is required");
}
export function getDocsTemplateIdWorksheet() {
  const templateId = GOOGLE_DOCS_WORKSHEET_TEMPLATE_ID;
  if (!templateId) {
    throw new Error("Template ID not found");
  }
  return templateId;
}

/*
 * Quiz Designer Slides
 */

const GOOGLE_SLIDES_QUIZ_DESIGNER_TEMPLATE_ID =
  process.env.GOOGLE_SLIDES_QUIZ_DESIGNER_TEMPLATE_ID;

if (!GOOGLE_SLIDES_QUIZ_DESIGNER_TEMPLATE_ID) {
  throw new Error("GOOGLE_SLIDES_QUIZ_DESIGNER_TEMPLATE_ID is required");
}
export function getQuizDesignerSlidesTemplateIdWorksheet() {
  const templateId = GOOGLE_SLIDES_QUIZ_DESIGNER_TEMPLATE_ID;
  if (!templateId) {
    throw new Error("Template ID not found");
  }
  return templateId;
}
