import { z } from "zod";

export const lessonSlidesTemplateSchema = z.object({
  lesson_title: z.string(),
  subject_title: z.string().nullish(),
  key_stage_title: z.string().nullish(),
  topic_title: z.string().nullish(),
  learning_outcomes: z.string(),

  // Deprecated keyword fields
  keywords: z.array(z.string()).nullish(),
  keyword_sentences: z.array(z.string()).nullish(),

  keyword_1: z.string(),
  keyword_2: z.string(),
  keyword_3: z.string().optional(),
  keyword_4: z.string().optional(),
  keyword_5: z.string().optional(),
  keyword_definition_1: z.string(),
  keyword_definition_2: z.string(),
  keyword_definition_3: z.string().optional(),
  keyword_definition_4: z.string().optional(),
  keyword_definition_5: z.string().optional(),

  learning_cycle_1_title: z.string(),
  learning_cycle_2_title: z.string().nullish(),
  learning_cycle_3_title: z.string().nullish(),
  learning_cycle_1_text: z.string(),
  learning_cycle_1_image_prompt: z.string(),

  learning_cycle_1_title_long: z.string(),
  learning_cycle_2_title_long: z.string().nullish(),
  learning_cycle_3_title_long: z.string().nullish(),

  learning_cycle_1_check_question_1_question: z.string(),
  learning_cycle_1_question_1_check_answer_1: z.string(),
  learning_cycle_1_question_1_check_answer_2: z.string(),
  learning_cycle_1_question_1_check_answer_3: z.string(),
  learning_cycle_1_check_question_2: z.string(),
  learning_cycle_1_question_2_check_answer_1: z.string(),
  learning_cycle_1_question_2_check_answer_2: z.string(),
  learning_cycle_1_question_2_check_answer_3: z.string(),

  learning_cycle_1_practise: z.string().nullish(),
  learning_cycle_1_feedback: z.string().nullish(),

  learning_cycle_2_text: z.string().nullish(),
  learning_cycle_2_image_prompt: z.string().nullish(),
  learning_cycle_2_question_1_check_question: z.string().nullish(),
  learning_cycle_2_question_1_check_answer_1: z.string().nullish(),
  learning_cycle_2_question_1_check_answer_2: z.string().nullish(),
  learning_cycle_2_question_1_check_answer_3: z.string().nullish(),

  learning_cycle_2_question_2_check_question: z.string().nullish(),
  learning_cycle_2_question_2_check_answer_1: z.string().nullish(),
  learning_cycle_2_question_2_check_answer_2: z.string().nullish(),
  learning_cycle_2_question_2_check_answer_3: z.string().nullish(),

  learning_cycle_2_practise: z.string().nullish(),
  learning_cycle_2_feedback: z.string().nullish(),

  learning_cycle_3_text: z.string().nullish(),
  learning_cycle_3_image_prompt: z.string().nullish(),

  learning_cycle_3_question_1_check_question: z.string().nullish(),
  learning_cycle_3_question_1_check_answer_1: z.string().nullish(),
  learning_cycle_3_question_1_check_answer_2: z.string().nullish(),
  learning_cycle_3_question_1_check_answer_3: z.string().nullish(),

  learning_cycle_3_question_2_check_question: z.string().nullish(),
  learning_cycle_3_question_2_check_answer_1: z.string().nullish(),
  learning_cycle_3_question_2_check_answer_2: z.string().nullish(),
  learning_cycle_3_question_2_check_answer_3: z.string().nullish(),

  learning_cycle_3_practise: z.string().nullish(),
  learning_cycle_3_feedback: z.string().nullish(),
});

export type LessonSlidesTemplateData = z.infer<
  typeof lessonSlidesTemplateSchema
>;
