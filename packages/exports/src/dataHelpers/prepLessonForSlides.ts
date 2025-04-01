import type { AdditionalMaterialsTemplateData } from "../schema/additionalMaterialsDoc.schema";
import type {
  ExportableQuizAppState,
  LessonSlidesInputData,
} from "../schema/input.schema";
import type { LessonSlidesTemplateData } from "../schema/lessonSlidesTemplate.schema";
import { camelCaseToTitleCase, processQuizAnswers } from "../utils";

const processQuizAnswersForSlides = (
  answers: string[] | undefined,
  distractors: string[] | undefined,
) => {
  return processQuizAnswers(
    {
      sortAlpha: true,
      includeTicks: false,
      prefixWithABC: false,
    },
    answers,
    distractors,
  );
};

export async function prepLessonForSlides(
  data: LessonSlidesInputData,
): Promise<LessonSlidesTemplateData> {
  const keywords = data.keywords?.map((keyword) => keyword.keyword);
  const keyword_sentences = data.keywords?.map((keyword) => keyword.definition);
  const newData: LessonSlidesTemplateData = {
    lesson_title: data.title,
    topic_title: data.topic ?? "",
    subject_title: camelCaseToTitleCase(data.subject),
    key_stage_title: camelCaseToTitleCase(data.keyStage),
    learning_outcomes: data.learningOutcome,
    keywords: keywords,
    keyword_sentences: keyword_sentences,
    keyword_1: data.keywords?.[0]?.keyword ?? " ",
    keyword_2: data.keywords?.[1]?.keyword ?? " ",
    keyword_3: data.keywords?.[2]?.keyword ?? " ",
    keyword_4: data.keywords?.[3]?.keyword ?? " ",
    keyword_5: data.keywords?.[4]?.keyword ?? " ",
    keyword_definition_1: data.keywords?.[0]?.definition ?? " ",
    keyword_definition_2: data.keywords?.[1]?.definition ?? " ",
    keyword_definition_3: data.keywords?.[2]?.definition ?? " ",
    keyword_definition_4: data.keywords?.[3]?.definition ?? " ",
    keyword_definition_5: data.keywords?.[4]?.definition ?? " ",

    starter_quiz_question_1: data.starterQuiz[0]?.question ?? "",
    sq_q1_answer_1:
      processQuizAnswersForSlides(
        data.starterQuiz[0]?.answers,
        data.starterQuiz[0]?.distractors,
      )[0] ?? "",
    sq_q1_answer_2:
      processQuizAnswersForSlides(
        data.starterQuiz[0]?.answers,
        data.starterQuiz[0]?.distractors,
      )[1] ?? "",
    sq_q1_answer_3:
      processQuizAnswersForSlides(
        data.starterQuiz[0]?.answers,
        data.starterQuiz[0]?.distractors,
      )[2] ?? "",
    starter_quiz_question_2: data.starterQuiz[1]?.question ?? "",
    sq_q2_answer_1:
      processQuizAnswersForSlides(
        data.starterQuiz[1]?.answers,
        data.starterQuiz[1]?.distractors,
      )[0] ?? "",
    sq_q2_answer_2:
      processQuizAnswersForSlides(
        data.starterQuiz[1]?.answers,
        data.starterQuiz[1]?.distractors,
      )[1] ?? "",
    sq_q2_answer_3:
      processQuizAnswersForSlides(
        data.starterQuiz[1]?.answers,
        data.starterQuiz[1]?.distractors,
      )[2] ?? "",
    starter_quiz_question_3: data.starterQuiz[2]?.question ?? "",
    sq_q3_answer_1:
      processQuizAnswersForSlides(
        data.starterQuiz[2]?.answers,
        data.starterQuiz[2]?.distractors,
      )[0] ?? "",
    sq_q3_answer_2:
      processQuizAnswersForSlides(
        data.starterQuiz[2]?.answers,
        data.starterQuiz[2]?.distractors,
      )[1] ?? "",
    sq_q3_answer_3:
      processQuizAnswersForSlides(
        data.starterQuiz[2]?.answers,
        data.starterQuiz[2]?.distractors,
      )[2] ?? "",
    starter_quiz_question_4: data.starterQuiz[3]?.question ?? "",
    sq_q4_answer_1:
      processQuizAnswersForSlides(
        data.starterQuiz[3]?.answers,
        data.starterQuiz[3]?.distractors,
      )[0] ?? "",
    sq_q4_answer_2:
      processQuizAnswersForSlides(
        data.starterQuiz[3]?.answers,
        data.starterQuiz[3]?.distractors,
      )[1] ?? "",
    sq_q4_answer_3:
      processQuizAnswersForSlides(
        data.starterQuiz[3]?.answers,
        data.starterQuiz[3]?.distractors,
      )[2] ?? "",
    starter_quiz_question_5: data.starterQuiz[4]?.question ?? "",
    sq_q5_answer_1:
      processQuizAnswersForSlides(
        data.starterQuiz[4]?.answers,
        data.starterQuiz[4]?.distractors,
      )[0] ?? "",
    sq_q5_answer_2:
      processQuizAnswersForSlides(
        data.starterQuiz[4]?.answers,
        data.starterQuiz[4]?.distractors,
      )[1] ?? "",
    sq_q5_answer_3:
      processQuizAnswersForSlides(
        data.starterQuiz[4]?.answers,
        data.starterQuiz[4]?.distractors,
      )[2] ?? "",
    starter_quiz_question_6: data.starterQuiz[5]?.question ?? "",
    sq_q6_answer_1:
      processQuizAnswersForSlides(
        data.starterQuiz[5]?.answers,
        data.starterQuiz[5]?.distractors,
      )[0] ?? "",
    sq_q6_answer_2:
      processQuizAnswersForSlides(
        data.starterQuiz[5]?.answers,
        data.starterQuiz[5]?.distractors,
      )[1] ?? "",
    sq_q6_answer_3:
      processQuizAnswersForSlides(
        data.starterQuiz[5]?.answers,
        data.starterQuiz[5]?.distractors,
      )[2] ?? "",
    exit_quiz_question_1: data.exitQuiz[0]?.question ?? "",
    eq_q1_answer_1:
      processQuizAnswersForSlides(
        data.exitQuiz[0]?.answers,
        data.exitQuiz[0]?.distractors,
      )[0] ?? "",
    exit_quiz_question_2: data.exitQuiz[1]?.question ?? "",
    eq_q2_answer_1:
      processQuizAnswersForSlides(
        data.exitQuiz[1]?.answers,
        data.exitQuiz[1]?.distractors,
      )[0] ?? "",
    eq_q2_answer_2:
      processQuizAnswersForSlides(
        data.exitQuiz[1]?.answers,
        data.exitQuiz[1]?.distractors,
      )[1] ?? "",
    exit_quiz_question_3: data.exitQuiz[2]?.question ?? "",
    eq_q3_answer_1:
      processQuizAnswersForSlides(
        data.exitQuiz[2]?.answers,
        data.exitQuiz[2]?.distractors,
      )[0] ?? "",
    eq_q3_answer_2:
      processQuizAnswersForSlides(
        data.exitQuiz[2]?.answers,
        data.exitQuiz[2]?.distractors,
      )[1] ?? "",
    eq_q3_answer_3:
      processQuizAnswersForSlides(
        data.exitQuiz[2]?.answers,
        data.exitQuiz[2]?.distractors,
      )[2] ?? "",
    exit_quiz_question_4: data.exitQuiz[3]?.question ?? "",
    eq_q4_answer_1:
      processQuizAnswersForSlides(
        data.exitQuiz[3]?.answers,
        data.exitQuiz[3]?.distractors,
      )[0] ?? "",
    eq_q4_answer_2:
      processQuizAnswersForSlides(
        data.exitQuiz[3]?.answers,
        data.exitQuiz[3]?.distractors,
      )[1] ?? "",
    eq_q4_answer_3:
      processQuizAnswersForSlides(
        data.exitQuiz[3]?.answers,
        data.exitQuiz[3]?.distractors,
      )[2] ?? "",
    exit_quiz_question_6: data.exitQuiz[5]?.question ?? "",
    eq_q6_answer_1:
      processQuizAnswersForSlides(
        data.exitQuiz[5]?.answers,
        data.exitQuiz[5]?.distractors,
      )[0] ?? "",
    eq_q6_answer_2:
      processQuizAnswersForSlides(
        data.exitQuiz[5]?.answers,
        data.exitQuiz[5]?.distractors,
      )[1] ?? "",
    eq_q6_answer_3:
      processQuizAnswersForSlides(
        data.exitQuiz[5]?.answers,
        data.exitQuiz[5]?.distractors,
      )[2] ?? "",
    learning_cycle_1_title_long: data.learningCycles[0] ?? "",
    learning_cycle_2_title_long: data.learningCycles[1] ?? "",
    learning_cycle_3_title_long: data.learningCycles[2] ?? "",
    learning_cycle_1_title: data.cycle1.title,
    learning_cycle_2_title: data.cycle2?.title ?? "",
    learning_cycle_3_title: data.cycle3?.title ?? "",
    learning_cycle_1_text: data.cycle1.explanation.slideText,
    learning_cycle_1_image_prompt: data.cycle1.explanation.imagePrompt,
    learning_cycle_1_check_question_1_question: data.cycle1
      .checkForUnderstanding[0]?.question
      ? "1. " + data.cycle1.checkForUnderstanding[0]?.question
      : "",
    learning_cycle_1_question_1_check_answer_1:
      processQuizAnswersForSlides(
        data.cycle1.checkForUnderstanding[0]?.answers,
        data.cycle1.checkForUnderstanding[0]?.distractors,
      )[0] ?? "",
    learning_cycle_1_question_1_check_answer_2:
      processQuizAnswersForSlides(
        data.cycle1.checkForUnderstanding[0]?.answers,
        data.cycle1.checkForUnderstanding[0]?.distractors,
      )[1] ?? "",
    learning_cycle_1_question_1_check_answer_3:
      processQuizAnswersForSlides(
        data.cycle1.checkForUnderstanding[0]?.answers,
        data.cycle1.checkForUnderstanding[0]?.distractors,
      )[2] ?? "",
    learning_cycle_1_check_question_2: data.cycle1.checkForUnderstanding[1]
      ?.question
      ? "2. " + data.cycle1.checkForUnderstanding[1]?.question
      : "",
    learning_cycle_1_question_2_check_answer_1:
      processQuizAnswersForSlides(
        data.cycle1.checkForUnderstanding[1]?.answers ?? [],
        data.cycle1.checkForUnderstanding[1]?.distractors ?? [],
      )[0] ?? "",
    learning_cycle_1_question_2_check_answer_2:
      processQuizAnswersForSlides(
        data.cycle1.checkForUnderstanding[1]?.answers ?? [],
        data.cycle1.checkForUnderstanding[1]?.distractors ?? [],
      )[1] ?? "",
    learning_cycle_1_question_2_check_answer_3:
      processQuizAnswersForSlides(
        data.cycle1.checkForUnderstanding[1]?.answers ?? [],
        data.cycle1.checkForUnderstanding[1]?.distractors ?? [],
      )[2] ?? "",
    learning_cycle_1_practise: data.cycle1.practice,
    learning_cycle_1_feedback: data.cycle1.feedback,

    learning_cycle_2_text: data.cycle2?.explanation.slideText ?? "",
    learning_cycle_2_image_prompt: data.cycle2?.explanation.imagePrompt ?? "",
    learning_cycle_2_question_1_check_question: data.cycle2
      ?.checkForUnderstanding[0]?.question
      ? "1. " + data.cycle2?.checkForUnderstanding[0]?.question
      : "",
    learning_cycle_2_question_1_check_answer_1: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[0]?.answers,
          data.cycle2.checkForUnderstanding[0]?.distractors,
        )[0]
      : "",
    learning_cycle_2_question_1_check_answer_2: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[0]?.answers,
          data.cycle2.checkForUnderstanding[0]?.distractors,
        )[1]
      : "",
    learning_cycle_2_question_1_check_answer_3: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[0]?.answers,
          data.cycle2.checkForUnderstanding[0]?.distractors,
        )[2]
      : "",
    learning_cycle_2_question_2_check_question: data.cycle2
      ?.checkForUnderstanding[1]?.question
      ? "2. " + data.cycle2?.checkForUnderstanding[1]?.question
      : "",
    learning_cycle_2_question_2_check_answer_1: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[1]?.answers ?? [],
          data.cycle2.checkForUnderstanding[1]?.distractors ?? [],
        )[0]
      : "",
    learning_cycle_2_question_2_check_answer_2: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[1]?.answers ?? [],
          data.cycle2.checkForUnderstanding[1]?.distractors ?? [],
        )[1]
      : "",
    learning_cycle_2_question_2_check_answer_3: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[1]?.answers ?? [],
          data.cycle2.checkForUnderstanding[1]?.distractors ?? [],
        )[2]
      : "",

    learning_cycle_2_practise: data.cycle2?.practice ?? "",
    learning_cycle_2_feedback: data.cycle2?.feedback ?? "",

    learning_cycle_3_text: data.cycle3?.explanation?.slideText ?? "",
    learning_cycle_3_image_prompt: data.cycle3?.explanation?.imagePrompt ?? "",
    learning_cycle_3_question_1_check_question: data.cycle3
      ?.checkForUnderstanding[0]?.question
      ? "1. " + data.cycle3?.checkForUnderstanding[0]?.question
      : "",
    learning_cycle_3_question_1_check_answer_1: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[0]?.answers,
          data.cycle3.checkForUnderstanding[0]?.distractors,
        )[0]
      : "",
    learning_cycle_3_question_1_check_answer_2: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[0]?.answers,
          data.cycle3.checkForUnderstanding[0]?.distractors,
        )[1]
      : "",
    learning_cycle_3_question_1_check_answer_3: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[0]?.answers,
          data.cycle3.checkForUnderstanding[0]?.distractors,
        )[2]
      : "",
    learning_cycle_3_question_2_check_question: data.cycle3
      ?.checkForUnderstanding[1]?.question
      ? "2. " + data.cycle3?.checkForUnderstanding[1]?.question
      : "",
    learning_cycle_3_question_2_check_answer_1: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[1]?.answers ?? [],
          data.cycle3.checkForUnderstanding[1]?.distractors ?? [],
        )[0]
      : "",
    learning_cycle_3_question_2_check_answer_2: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[1]?.answers ?? [],
          data.cycle3.checkForUnderstanding[1]?.distractors ?? [],
        )[1]
      : "",
    learning_cycle_3_question_2_check_answer_3: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[1]?.answers ?? [],
          data.cycle3.checkForUnderstanding[1]?.distractors ?? [],
        )[2]
      : "",

    learning_cycle_3_practise: data.cycle3?.practice ?? "",
    learning_cycle_3_feedback: data.cycle3?.feedback ?? "",
  };
  return Promise.resolve(newData);
}

type QuizDesignerSlidesTemplateData = {
  subject_title: string;
  key_stage_title: string;
  title: string;
  question_1: string;
  question_1_check_answer_1: string;
  question_1_check_answer_2: string;
  question_1_check_answer_3: string;
  question_2?: string;
  question_2_check_answer_1?: string;
  question_2_check_answer_2?: string;
  question_2_check_answer_3?: string;
  question_3?: string;
  question_3_check_answer_1?: string;
  question_3_check_answer_2?: string;
  question_3_check_answer_3?: string;
  question_4?: string;
  question_4_check_answer_1?: string;
  question_4_check_answer_2?: string;
  question_4_check_answer_3?: string;

  question_5?: string;
  question_5_check_answer_1?: string;
  question_5_check_answer_2?: string;
  question_5_check_answer_3?: string;
  question_6?: string;
  question_6_check_answer_1?: string;
  question_6_check_answer_2?: string;
  question_6_check_answer_3?: string;
  question_7?: string;
  question_7_check_answer_1?: string;
  question_7_check_answer_2?: string;
  question_7_check_answer_3?: string;
  question_8?: string;
  question_8_check_answer_1?: string;
  question_8_check_answer_2?: string;
  question_8_check_answer_3?: string;
  question_9?: string;
  question_9_check_answer_1?: string;
  question_9_check_answer_2?: string;
  question_9_check_answer_3?: string;
  question_10?: string;
  question_10_check_answer_1?: string;
  question_10_check_answer_2?: string;
  question_10_check_answer_3?: string;
  question_11?: string;
  question_11_check_answer_1?: string;
  question_11_check_answer_2?: string;
  question_11_check_answer_3?: string;
  question_12?: string;
  question_12_check_answer_1?: string;
  question_12_check_answer_2?: string;
  question_12_check_answer_3?: string;
  question_13?: string;
  question_13_check_answer_1?: string;
  question_13_check_answer_2?: string;
  question_13_check_answer_3?: string;

  question_14?: string;
  question_14_check_answer_1?: string;
  question_14_check_answer_2?: string;
  question_14_check_answer_3?: string;
  question_15?: string;
  question_15_check_answer_1?: string;
  question_15_check_answer_2?: string;
  question_15_check_answer_3?: string;
  question_16?: string;
  question_16_check_answer_1?: string;
  question_16_check_answer_2?: string;
  question_16_check_answer_3?: string;
  question_17?: string;
  question_17_check_answer_1?: string;
  question_17_check_answer_2?: string;
  question_17_check_answer_3?: string;
  question_18?: string;
  question_18_check_answer_1?: string;
  question_18_check_answer_2?: string;
  question_18_check_answer_3?: string;
  question_19?: string;
  question_19_check_answer_1?: string;
  question_19_check_answer_2?: string;
  question_19_check_answer_3?: string;
  question_20?: string;
  question_20_check_answer_1?: string;
  question_20_check_answer_2?: string;
  question_20_check_answer_3?: string;
};

export async function prepQuizDesignerForSlides(
  data: ExportableQuizAppState,
): Promise<QuizDesignerSlidesTemplateData> {
  const newData: QuizDesignerSlidesTemplateData = {
    title: data.topic ?? "",
    subject_title: camelCaseToTitleCase(data.subject) ?? "",
    key_stage_title: camelCaseToTitleCase(data.keyStage) ?? "",
    question_1: data.questions[0]?.question ?? "",
    question_1_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[0]?.answers,
        data.questions[0]?.distractors,
      )[0] ?? "",
    question_1_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[0]?.answers,
        data.questions[0]?.distractors,
      )[1] ?? "",
    question_1_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[0]?.answers,
        data.questions[0]?.distractors,
      )[2] ?? "",
    question_2: data.questions[1]?.question ?? "",
    question_2_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[1]?.answers,
        data.questions[1]?.distractors,
      )[0] ?? "",
    question_2_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[1]?.answers,
        data.questions[1]?.distractors,
      )[1] ?? "",
    question_2_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[1]?.answers,
        data.questions[1]?.distractors,
      )[2] ?? "",
    question_3: data.questions[2]?.question ?? "",
    question_3_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[2]?.answers,
        data.questions[2]?.distractors,
      )[0] ?? "",
    question_3_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[2]?.answers,
        data.questions[2]?.distractors,
      )[1] ?? "",
    question_3_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[2]?.answers,
        data.questions[2]?.distractors,
      )[2] ?? "",
    question_4: data.questions[3]?.question ?? "",
    question_4_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[3]?.answers,
        data.questions[3]?.distractors,
      )[0] ?? "",
    question_4_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[3]?.answers,
        data.questions[3]?.distractors,
      )[1] ?? "",
    question_4_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[3]?.answers,
        data.questions[3]?.distractors,
      )[2] ?? "",
    question_5: data.questions[4]?.question ?? "",
    question_5_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[4]?.answers,
        data.questions[4]?.distractors,
      )[0] ?? "",
    question_5_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[4]?.answers,
        data.questions[4]?.distractors,
      )[1] ?? "",
    question_5_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[4]?.answers,
        data.questions[4]?.distractors,
      )[2] ?? "",
    question_6: data.questions[5]?.question ?? "",
    question_6_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[5]?.answers,
        data.questions[5]?.distractors,
      )[0] ?? "",
    question_6_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[5]?.answers,
        data.questions[5]?.distractors,
      )[1] ?? "",
    question_6_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[5]?.answers,
        data.questions[5]?.distractors,
      )[2] ?? "",
    question_7: data.questions[6]?.question ?? "",
    question_7_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[6]?.answers,
        data.questions[6]?.distractors,
      )[0] ?? "",

    question_7_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[6]?.answers,
        data.questions[6]?.distractors,
      )[1] ?? "",
    question_7_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[6]?.answers,
        data.questions[6]?.distractors,
      )[2] ?? "",
    question_8: data.questions[7]?.question ?? "",
    question_8_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[7]?.answers,
        data.questions[7]?.distractors,
      )[0] ?? "",
    question_8_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[7]?.answers,
        data.questions[7]?.distractors,
      )[1] ?? "",
    question_8_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[7]?.answers,
        data.questions[7]?.distractors,
      )[2] ?? "",
    question_9: data.questions[8]?.question ?? "",
    question_9_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[8]?.answers,
        data.questions[8]?.distractors,
      )[0] ?? "",
    question_9_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[8]?.answers,
        data.questions[8]?.distractors,
      )[1] ?? "",
    question_9_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[8]?.answers,
        data.questions[8]?.distractors,
      )[2] ?? "",
    question_10: data.questions[9]?.question ?? "",
    question_10_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[9]?.answers,
        data.questions[9]?.distractors,
      )[0] ?? "",
    question_10_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[9]?.answers,
        data.questions[9]?.distractors,
      )[1] ?? "",
    question_10_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[9]?.answers,
        data.questions[9]?.distractors,
      )[2] ?? "",
    question_11: data.questions[10]?.question ?? "",
    question_11_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[10]?.answers,
        data.questions[10]?.distractors,
      )[0] ?? "",
    question_11_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[10]?.answers,
        data.questions[10]?.distractors,
      )[1] ?? "",
    question_11_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[10]?.answers,
        data.questions[10]?.distractors,
      )[2] ?? "",
    question_12: data.questions[11]?.question ?? "",
    question_12_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[11]?.answers,
        data.questions[11]?.distractors,
      )[0] ?? "",
    question_12_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[11]?.answers,
        data.questions[11]?.distractors,
      )[1] ?? "",
    question_12_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[11]?.answers,
        data.questions[11]?.distractors,
      )[2] ?? "",
    question_13: data.questions[12]?.question ?? "",
    question_13_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[12]?.answers,
        data.questions[12]?.distractors,
      )[0] ?? "",
    question_13_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[12]?.answers,
        data.questions[12]?.distractors,
      )[1] ?? "",
    question_13_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[12]?.answers,
        data.questions[12]?.distractors,
      )[2] ?? "",
    question_14: data.questions[13]?.question ?? "",
    question_14_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[13]?.answers,
        data.questions[13]?.distractors,
      )[0] ?? "",
    question_14_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[13]?.answers,
        data.questions[13]?.distractors,
      )[1] ?? "",
    question_14_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[13]?.answers,
        data.questions[13]?.distractors,
      )[2] ?? "",
    question_15: data.questions[14]?.question ?? "",
    question_15_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[14]?.answers,
        data.questions[14]?.distractors,
      )[0] ?? "",
    question_15_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[14]?.answers,
        data.questions[14]?.distractors,
      )[1] ?? "",
    question_15_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[14]?.answers,
        data.questions[14]?.distractors,
      )[2] ?? "",
    question_16: data.questions[15]?.question ?? "",
    question_16_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[15]?.answers,
        data.questions[15]?.distractors,
      )[0] ?? "",
    question_16_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[15]?.answers,
        data.questions[15]?.distractors,
      )[1] ?? "",
    question_16_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[15]?.answers,
        data.questions[15]?.distractors,
      )[2] ?? "",
    question_17: data.questions[16]?.question ?? "",
    question_17_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[16]?.answers,
        data.questions[16]?.distractors,
      )[0] ?? "",
    question_17_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[16]?.answers,
        data.questions[16]?.distractors,
      )[1] ?? "",
    question_17_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[16]?.answers,
        data.questions[16]?.distractors,
      )[2] ?? "",
    question_18: data.questions[17]?.question ?? "",
    question_18_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[17]?.answers,
        data.questions[17]?.distractors,
      )[0] ?? "",
    question_18_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[17]?.answers,
        data.questions[17]?.distractors,
      )[1] ?? "",
    question_18_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[17]?.answers,
        data.questions[17]?.distractors,
      )[2] ?? "",
    question_19: data.questions[18]?.question ?? "",
    question_19_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[18]?.answers,
        data.questions[18]?.distractors,
      )[0] ?? "",
    question_19_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[18]?.answers,
        data.questions[18]?.distractors,
      )[1] ?? "",
    question_19_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[18]?.answers,
        data.questions[18]?.distractors,
      )[2] ?? "",
    question_20: data.questions[19]?.question ?? "",
    question_20_check_answer_1:
      processQuizAnswersForSlides(
        data.questions[19]?.answers,
        data.questions[19]?.distractors,
      )[0] ?? "",
    question_20_check_answer_2:
      processQuizAnswersForSlides(
        data.questions[19]?.answers,
        data.questions[19]?.distractors,
      )[1] ?? "",
    question_20_check_answer_3:
      processQuizAnswersForSlides(
        data.questions[19]?.answers,
        data.questions[19]?.distractors,
      )[2] ?? "",
  };
  return Promise.resolve(newData);
}

export async function prepLessonForAdditionalMaterialsDoc(
  data: LessonSlidesInputData,
): Promise<AdditionalMaterialsTemplateData> {
  const newData: AdditionalMaterialsTemplateData = {
    lesson_title: data.title,
    content: data.additionalMaterials ?? "",
  };
  return Promise.resolve(newData);
}
