export const additionalMaterialsModifyOptions = [
  {
    label: "A homework task",
    enumValue: "ADD_HOMEWORK_TASK",
    chatMessage: "Add a homework task",
  },
  {
    label: "A narrative for my explanation",
    enumValue: "ADD_NARRATIVE",
    chatMessage: "Add a narrative for my explanation",
  },
  {
    label: "Additional practice questions",
    enumValue: "ADD_PRACTICE_QUESTIONS",
    chatMessage: "Add additional practice questions",
  },
  {
    label: "Practical instructions (if relevant)",
    enumValue: "ADD_PRACTICAL_INSTRUCTIONS",
    chatMessage: "Add practical instructions",
  },
  { label: "Other", enumValue: "OTHER" },
] as const;

export type AdditionalMaterialOptions = typeof additionalMaterialsModifyOptions;

export const modifyOptions = [
  {
    label: "Make it easier",
    enumValue: "MAKE_IT_EASIER",
    chatMessage: "easier",
  },
  {
    label: "Make it harder",
    enumValue: "MAKE_IT_HARDER",
    chatMessage: "harder",
  },
  {
    label: "Shorten content",
    enumValue: "SHORTEN_CONTENT",
    chatMessage: "shorter",
  },
  {
    label: "Add more detail",
    enumValue: "ADD_MORE_DETAIL",
    chatMessage: "more detailed",
  },
  { label: "Other", enumValue: "OTHER" },
] as const;

export type ModifyOptions = typeof modifyOptions;

// @todo Add dedicated enum values to AilaUserModificationAction for these
// options (REGENERATE, CHANGE_QUESTION, ADD_QUESTION, REMOVE_QUESTION)
// once the UX is validated. Currently all use OTHER to avoid a schema migration.
export const quizModifyOptions = [
  {
    label: "Generate a new quiz",
    enumValue: "OTHER",
    textPrompt: "Any instructions? (optional)",
  },
  {
    label: "Change question",
    enumValue: "OTHER",
    textPrompt: "Which question and what should change?",
  },
  {
    label: "Add question",
    enumValue: "OTHER",
    textPrompt: "What kind of question should be added?",
  },
  {
    label: "Remove question",
    enumValue: "OTHER",
    textPrompt: "Which question should be removed?",
  },
] as const;

export type QuizModifyOptions = typeof quizModifyOptions;
