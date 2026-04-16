import type { AdditionalMaterialsTemplateData } from "../schema/additionalMaterialsDoc.schema";
import type { LessonSlidesInputData } from "../schema/input.schema";
import type { LessonSlidesTemplateData } from "../schema/lessonSlidesTemplate.schema";
import {
  camelCaseToTitleCase,
  filterToMcQuestions,
  processQuizAnswers,
} from "../utils";

/**
 * Helper function to determine if an answer at a specific index in the sorted array is a correct answer
 */
const isCorrectAnswer = (
  sortedIndex: number,
  answers: string[] | undefined,
  distractors: string[] | undefined,
): boolean => {
  if (!answers || answers.length === 0) return false;

  const sortedAnswers = [...(answers ?? []), ...(distractors ?? [])].sort(
    (a, b) => a.localeCompare(b),
  );

  if (!sortedAnswers[sortedIndex]) return false;
  return answers.includes(sortedAnswers[sortedIndex]);
};

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

/**
 * Creates a bullet point list from an array of strings
 * @param items Array of strings to convert to bullet points
 * @returns String with each item on a new line prefixed with a bullet point
 */
const createBulletsListFromArray = (items: string[] | undefined): string => {
  if (!items) return "";
  return items.map((item) => `• ${item}`).join("\n");
};

export async function prepLessonForSlides(
  data: LessonSlidesInputData,
): Promise<LessonSlidesTemplateData> {
  const keywords = data.keywords?.map((keyword) => keyword.keyword);
  const keyword_sentences = data.keywords?.map((keyword) => keyword.definition);

  // TODO: Currently only multiple-choice questions are supported
  // Filter to only include multiple-choice questions
  // Other question types (short-answer, match, order) are ignored
  const starterMcQuestions = filterToMcQuestions(data.starterQuiz.questions);
  const exitMcQuestions = filterToMcQuestions(data.exitQuiz.questions);

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

    starter_quiz_question_1: starterMcQuestions[0]?.question ?? "",
    sq_q1_answer_1:
      processQuizAnswersForSlides(
        starterMcQuestions[0]?.answers,
        starterMcQuestions[0]?.distractors,
      )[0] ?? "",
    sq_q1_answer_1_tick: isCorrectAnswer(
      0,
      starterMcQuestions[0]?.answers,
      starterMcQuestions[0]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q1_answer_2:
      processQuizAnswersForSlides(
        starterMcQuestions[0]?.answers,
        starterMcQuestions[0]?.distractors,
      )[1] ?? "",
    sq_q1_answer_2_tick: isCorrectAnswer(
      1,
      starterMcQuestions[0]?.answers,
      starterMcQuestions[0]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q1_answer_3:
      processQuizAnswersForSlides(
        starterMcQuestions[0]?.answers,
        starterMcQuestions[0]?.distractors,
      )[2] ?? "",
    sq_q1_answer_3_tick: isCorrectAnswer(
      2,
      starterMcQuestions[0]?.answers,
      starterMcQuestions[0]?.distractors,
    )
      ? "✓"
      : "   ",
    starter_quiz_question_2: starterMcQuestions[1]?.question ?? "",
    sq_q2_answer_1:
      processQuizAnswersForSlides(
        starterMcQuestions[1]?.answers,
        starterMcQuestions[1]?.distractors,
      )[0] ?? "",
    sq_q2_answer_1_tick: isCorrectAnswer(
      0,
      starterMcQuestions[1]?.answers,
      starterMcQuestions[1]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q2_answer_2:
      processQuizAnswersForSlides(
        starterMcQuestions[1]?.answers,
        starterMcQuestions[1]?.distractors,
      )[1] ?? "",
    sq_q2_answer_2_tick: isCorrectAnswer(
      1,
      starterMcQuestions[1]?.answers,
      starterMcQuestions[1]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q2_answer_3:
      processQuizAnswersForSlides(
        starterMcQuestions[1]?.answers,
        starterMcQuestions[1]?.distractors,
      )[2] ?? "",
    sq_q2_answer_3_tick: isCorrectAnswer(
      2,
      starterMcQuestions[1]?.answers,
      starterMcQuestions[1]?.distractors,
    )
      ? "✓"
      : "   ",
    starter_quiz_question_3: starterMcQuestions[2]?.question ?? "",
    sq_q3_answer_1:
      processQuizAnswersForSlides(
        starterMcQuestions[2]?.answers,
        starterMcQuestions[2]?.distractors,
      )[0] ?? "",
    sq_q3_answer_1_tick: isCorrectAnswer(
      0,
      starterMcQuestions[2]?.answers,
      starterMcQuestions[2]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q3_answer_2:
      processQuizAnswersForSlides(
        starterMcQuestions[2]?.answers,
        starterMcQuestions[2]?.distractors,
      )[1] ?? "",
    sq_q3_answer_2_tick: isCorrectAnswer(
      1,
      starterMcQuestions[2]?.answers,
      starterMcQuestions[2]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q3_answer_3:
      processQuizAnswersForSlides(
        starterMcQuestions[2]?.answers,
        starterMcQuestions[2]?.distractors,
      )[2] ?? "",
    sq_q3_answer_3_tick: isCorrectAnswer(
      2,
      starterMcQuestions[2]?.answers,
      starterMcQuestions[2]?.distractors,
    )
      ? "✓"
      : "   ",
    starter_quiz_question_4: starterMcQuestions[3]?.question ?? "",
    sq_q4_answer_1:
      processQuizAnswersForSlides(
        starterMcQuestions[3]?.answers,
        starterMcQuestions[3]?.distractors,
      )[0] ?? "",
    sq_q4_answer_1_tick: isCorrectAnswer(
      0,
      starterMcQuestions[3]?.answers,
      starterMcQuestions[3]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q4_answer_2:
      processQuizAnswersForSlides(
        starterMcQuestions[3]?.answers,
        starterMcQuestions[3]?.distractors,
      )[1] ?? "",
    sq_q4_answer_2_tick: isCorrectAnswer(
      1,
      starterMcQuestions[3]?.answers,
      starterMcQuestions[3]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q4_answer_3:
      processQuizAnswersForSlides(
        starterMcQuestions[3]?.answers,
        starterMcQuestions[3]?.distractors,
      )[2] ?? "",
    sq_q4_answer_3_tick: isCorrectAnswer(
      2,
      starterMcQuestions[3]?.answers,
      starterMcQuestions[3]?.distractors,
    )
      ? "✓"
      : "   ",
    starter_quiz_question_5: starterMcQuestions[4]?.question ?? "",
    sq_q5_answer_1:
      processQuizAnswersForSlides(
        starterMcQuestions[4]?.answers,
        starterMcQuestions[4]?.distractors,
      )[0] ?? "",
    sq_q5_answer_1_tick: isCorrectAnswer(
      0,
      starterMcQuestions[4]?.answers,
      starterMcQuestions[4]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q5_answer_2:
      processQuizAnswersForSlides(
        starterMcQuestions[4]?.answers,
        starterMcQuestions[4]?.distractors,
      )[1] ?? "",
    sq_q5_answer_2_tick: isCorrectAnswer(
      1,
      starterMcQuestions[4]?.answers,
      starterMcQuestions[4]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q5_answer_3:
      processQuizAnswersForSlides(
        starterMcQuestions[4]?.answers,
        starterMcQuestions[4]?.distractors,
      )[2] ?? "",
    sq_q5_answer_3_tick: isCorrectAnswer(
      2,
      starterMcQuestions[4]?.answers,
      starterMcQuestions[4]?.distractors,
    )
      ? "✓"
      : "   ",
    starter_quiz_question_6: starterMcQuestions[5]?.question ?? "",
    sq_q6_answer_1:
      processQuizAnswersForSlides(
        starterMcQuestions[5]?.answers,
        starterMcQuestions[5]?.distractors,
      )[0] ?? "",
    sq_q6_answer_1_tick: isCorrectAnswer(
      0,
      starterMcQuestions[5]?.answers,
      starterMcQuestions[5]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q6_answer_2:
      processQuizAnswersForSlides(
        starterMcQuestions[5]?.answers,
        starterMcQuestions[5]?.distractors,
      )[1] ?? "",
    sq_q6_answer_2_tick: isCorrectAnswer(
      1,
      starterMcQuestions[5]?.answers,
      starterMcQuestions[5]?.distractors,
    )
      ? "✓"
      : "   ",
    sq_q6_answer_3:
      processQuizAnswersForSlides(
        starterMcQuestions[5]?.answers,
        starterMcQuestions[5]?.distractors,
      )[2] ?? "",
    sq_q6_answer_3_tick: isCorrectAnswer(
      2,
      starterMcQuestions[5]?.answers,
      starterMcQuestions[5]?.distractors,
    )
      ? "✓"
      : "   ",
    exit_quiz_question_1: exitMcQuestions[0]?.question ?? "",
    eq_q1_answer_1:
      processQuizAnswersForSlides(
        exitMcQuestions[0]?.answers,
        exitMcQuestions[0]?.distractors,
      )[0] ?? "",
    eq_q1_answer_1_tick: isCorrectAnswer(
      0,
      exitMcQuestions[0]?.answers,
      exitMcQuestions[0]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q1_answer_2:
      processQuizAnswersForSlides(
        exitMcQuestions[0]?.answers,
        exitMcQuestions[0]?.distractors,
      )[1] ?? "",
    eq_q1_answer_2_tick: isCorrectAnswer(
      1,
      exitMcQuestions[0]?.answers,
      exitMcQuestions[0]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q1_answer_3:
      processQuizAnswersForSlides(
        exitMcQuestions[0]?.answers,
        exitMcQuestions[0]?.distractors,
      )[2] ?? "",
    eq_q1_answer_3_tick: isCorrectAnswer(
      2,
      exitMcQuestions[0]?.answers,
      exitMcQuestions[0]?.distractors,
    )
      ? "✓"
      : "   ",
    exit_quiz_question_2: exitMcQuestions[1]?.question ?? "",
    eq_q2_answer_1:
      processQuizAnswersForSlides(
        exitMcQuestions[1]?.answers,
        exitMcQuestions[1]?.distractors,
      )[0] ?? "",
    eq_q2_answer_1_tick: isCorrectAnswer(
      0,
      exitMcQuestions[1]?.answers,
      exitMcQuestions[1]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q2_answer_2:
      processQuizAnswersForSlides(
        exitMcQuestions[1]?.answers,
        exitMcQuestions[1]?.distractors,
      )[1] ?? "",
    eq_q2_answer_2_tick: isCorrectAnswer(
      1,
      exitMcQuestions[1]?.answers,
      exitMcQuestions[1]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q2_answer_3:
      processQuizAnswersForSlides(
        exitMcQuestions[1]?.answers,
        exitMcQuestions[1]?.distractors,
      )[2] ?? "",
    eq_q2_answer_3_tick: isCorrectAnswer(
      2,
      exitMcQuestions[1]?.answers,
      exitMcQuestions[1]?.distractors,
    )
      ? "✓"
      : "   ",
    exit_quiz_question_3: exitMcQuestions[2]?.question ?? "",
    eq_q3_answer_1:
      processQuizAnswersForSlides(
        exitMcQuestions[2]?.answers,
        exitMcQuestions[2]?.distractors,
      )[0] ?? "",
    eq_q3_answer_1_tick: isCorrectAnswer(
      0,
      exitMcQuestions[2]?.answers,
      exitMcQuestions[2]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q3_answer_2:
      processQuizAnswersForSlides(
        exitMcQuestions[2]?.answers,
        exitMcQuestions[2]?.distractors,
      )[1] ?? "",
    eq_q3_answer_2_tick: isCorrectAnswer(
      1,
      exitMcQuestions[2]?.answers,
      exitMcQuestions[2]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q3_answer_3:
      processQuizAnswersForSlides(
        exitMcQuestions[2]?.answers,
        exitMcQuestions[2]?.distractors,
      )[2] ?? "",
    eq_q3_answer_3_tick: isCorrectAnswer(
      2,
      exitMcQuestions[2]?.answers,
      exitMcQuestions[2]?.distractors,
    )
      ? "✓"
      : "   ",
    exit_quiz_question_4: exitMcQuestions[3]?.question ?? "",
    eq_q4_answer_1:
      processQuizAnswersForSlides(
        exitMcQuestions[3]?.answers,
        exitMcQuestions[3]?.distractors,
      )[0] ?? "",
    eq_q4_answer_1_tick: isCorrectAnswer(
      0,
      exitMcQuestions[3]?.answers,
      exitMcQuestions[3]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q4_answer_2:
      processQuizAnswersForSlides(
        exitMcQuestions[3]?.answers,
        exitMcQuestions[3]?.distractors,
      )[1] ?? "",
    eq_q4_answer_2_tick: isCorrectAnswer(
      1,
      exitMcQuestions[3]?.answers,
      exitMcQuestions[3]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q4_answer_3:
      processQuizAnswersForSlides(
        exitMcQuestions[3]?.answers,
        exitMcQuestions[3]?.distractors,
      )[2] ?? "",
    eq_q4_answer_3_tick: isCorrectAnswer(
      2,
      exitMcQuestions[3]?.answers,
      exitMcQuestions[3]?.distractors,
    )
      ? "✓"
      : "   ",
    exit_quiz_question_5: exitMcQuestions[4]?.question ?? "",
    eq_q5_answer_1:
      processQuizAnswersForSlides(
        exitMcQuestions[4]?.answers,
        exitMcQuestions[4]?.distractors,
      )[0] ?? "",
    eq_q5_answer_1_tick: isCorrectAnswer(
      0,
      exitMcQuestions[4]?.answers,
      exitMcQuestions[4]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q5_answer_2:
      processQuizAnswersForSlides(
        exitMcQuestions[4]?.answers,
        exitMcQuestions[4]?.distractors,
      )[1] ?? "",
    eq_q5_answer_2_tick: isCorrectAnswer(
      1,
      exitMcQuestions[4]?.answers,
      exitMcQuestions[4]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q5_answer_3:
      processQuizAnswersForSlides(
        exitMcQuestions[4]?.answers,
        exitMcQuestions[4]?.distractors,
      )[2] ?? "",
    eq_q5_answer_3_tick: isCorrectAnswer(
      2,
      exitMcQuestions[4]?.answers,
      exitMcQuestions[4]?.distractors,
    )
      ? "✓"
      : "   ",
    exit_quiz_question_6: exitMcQuestions[5]?.question ?? "",
    eq_q6_answer_1:
      processQuizAnswersForSlides(
        exitMcQuestions[5]?.answers,
        exitMcQuestions[5]?.distractors,
      )[0] ?? "",
    eq_q6_answer_1_tick: isCorrectAnswer(
      0,
      exitMcQuestions[5]?.answers,
      exitMcQuestions[5]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q6_answer_2:
      processQuizAnswersForSlides(
        exitMcQuestions[5]?.answers,
        exitMcQuestions[5]?.distractors,
      )[1] ?? "",
    eq_q6_answer_2_tick: isCorrectAnswer(
      1,
      exitMcQuestions[5]?.answers,
      exitMcQuestions[5]?.distractors,
    )
      ? "✓"
      : "   ",
    eq_q6_answer_3:
      processQuizAnswersForSlides(
        exitMcQuestions[5]?.answers,
        exitMcQuestions[5]?.distractors,
      )[2] ?? "",
    eq_q6_answer_3_tick: isCorrectAnswer(
      2,
      exitMcQuestions[5]?.answers,
      exitMcQuestions[5]?.distractors,
    )
      ? "✓"
      : "   ",
    learning_cycle_1_title_long: data.learningCycles[0] ?? "",
    learning_cycle_2_title_long: data.learningCycles[1] ?? "",
    learning_cycle_3_title_long: data.learningCycles[2] ?? "",
    learning_cycle_1_title: data.cycle1.title,
    learning_cycle_2_title: data.cycle2?.title ?? "",
    learning_cycle_3_title: data.cycle3?.title ?? "",
    learning_cycle_1_text: data.cycle1.explanation.slideText,
    learning_cycle_1_image_prompt: data.cycle1.explanation.imagePrompt,
    learning_cycle_1_check_question_1_question:
      data.cycle1.checkForUnderstanding[0]?.question ?? "   ",
    learning_cycle_1_question_1_check_answer_1:
      processQuizAnswersForSlides(
        data.cycle1.checkForUnderstanding[0]?.answers,
        data.cycle1.checkForUnderstanding[0]?.distractors,
      )[0] ?? "",
    lc1_q1_answer_1_tick: isCorrectAnswer(
      0,
      data.cycle1.checkForUnderstanding[0]?.answers,
      data.cycle1.checkForUnderstanding[0]?.distractors,
    )
      ? "✓"
      : "   ",
    lc1_q1_answer_2_tick: isCorrectAnswer(
      1,
      data.cycle1.checkForUnderstanding[0]?.answers,
      data.cycle1.checkForUnderstanding[0]?.distractors,
    )
      ? "✓"
      : "   ",
    lc1_q1_answer_3_tick: isCorrectAnswer(
      2,
      data.cycle1.checkForUnderstanding[0]?.answers,
      data.cycle1.checkForUnderstanding[0]?.distractors,
    )
      ? "✓"
      : "   ",
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
    learning_cycle_1_check_question_2:
      data.cycle1.checkForUnderstanding[1]?.question ?? "   ",
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
    learning_cycle_2_question_1_check_question:
      data.cycle2?.checkForUnderstanding[0]?.question ?? "   ",
    learning_cycle_2_question_1_check_answer_1: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[0]?.answers,
          data.cycle2.checkForUnderstanding[0]?.distractors,
        )[0]
      : "   ",
    learning_cycle_2_question_1_check_answer_2: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[0]?.answers,
          data.cycle2.checkForUnderstanding[0]?.distractors,
        )[1]
      : "   ",
    learning_cycle_2_question_1_check_answer_3: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[0]?.answers,
          data.cycle2.checkForUnderstanding[0]?.distractors,
        )[2]
      : "   ",
    learning_cycle_2_question_2_check_question:
      data.cycle2?.checkForUnderstanding[1]?.question ?? "   ",
    learning_cycle_2_question_2_check_answer_1: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[1]?.answers ?? [],
          data.cycle2.checkForUnderstanding[1]?.distractors ?? [],
        )[0]
      : "   ",
    learning_cycle_2_question_2_check_answer_2: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[1]?.answers ?? [],
          data.cycle2.checkForUnderstanding[1]?.distractors ?? [],
        )[1]
      : "   ",
    learning_cycle_2_question_2_check_answer_3: data.cycle2
      ? processQuizAnswersForSlides(
          data.cycle2.checkForUnderstanding[1]?.answers ?? [],
          data.cycle2.checkForUnderstanding[1]?.distractors ?? [],
        )[2]
      : "   ",

    learning_cycle_2_practise: data.cycle2?.practice ?? "",
    learning_cycle_2_feedback: data.cycle2?.feedback ?? "",

    learning_cycle_3_text: data.cycle3?.explanation?.slideText ?? "",
    learning_cycle_3_image_prompt: data.cycle3?.explanation?.imagePrompt ?? "",
    learning_cycle_3_question_1_check_question:
      data.cycle3?.checkForUnderstanding[0]?.question ?? "   ",
    learning_cycle_3_question_1_check_answer_1: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[0]?.answers,
          data.cycle3.checkForUnderstanding[0]?.distractors,
        )[0]
      : "   ",
    learning_cycle_3_question_1_check_answer_2: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[0]?.answers,
          data.cycle3.checkForUnderstanding[0]?.distractors,
        )[1]
      : "   ",
    learning_cycle_3_question_1_check_answer_3: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[0]?.answers,
          data.cycle3.checkForUnderstanding[0]?.distractors,
        )[2]
      : "   ",
    learning_cycle_3_question_2_check_question:
      data.cycle3?.checkForUnderstanding[1]?.question ?? "   ",
    learning_cycle_3_question_2_check_answer_1: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[1]?.answers ?? [],
          data.cycle3.checkForUnderstanding[1]?.distractors ?? [],
        )[0]
      : "   ",
    learning_cycle_3_question_2_check_answer_2: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[1]?.answers ?? [],
          data.cycle3.checkForUnderstanding[1]?.distractors ?? [],
        )[1]
      : "   ",
    learning_cycle_3_question_2_check_answer_3: data.cycle3
      ? processQuizAnswersForSlides(
          data.cycle3.checkForUnderstanding[1]?.answers ?? [],
          data.cycle3.checkForUnderstanding[1]?.distractors ?? [],
        )[2]
      : "   ",

    learning_cycle_3_practise: data.cycle3?.practice ?? "",
    learning_cycle_3_feedback: data.cycle3?.feedback ?? "",

    learning_cycle_3_explanation: Array.isArray(
      data.cycle3?.explanation.spokenExplanation,
    )
      ? createBulletsListFromArray(data.cycle3?.explanation.spokenExplanation)
      : (data.cycle3?.explanation.spokenExplanation ?? ""),
    learning_cycle_2_explanation: Array.isArray(
      data.cycle2?.explanation.spokenExplanation,
    )
      ? createBulletsListFromArray(data.cycle2?.explanation.spokenExplanation)
      : (data.cycle2?.explanation.spokenExplanation ?? ""),
    learning_cycle_1_explanation: Array.isArray(
      data.cycle1.explanation.spokenExplanation,
    )
      ? createBulletsListFromArray(data.cycle1.explanation.spokenExplanation)
      : (data.cycle1.explanation.spokenExplanation ?? ""),
    lc1_q2_answer_1_tick: isCorrectAnswer(
      0,
      data.cycle1.checkForUnderstanding[1]?.answers,
      data.cycle1.checkForUnderstanding[1]?.distractors,
    )
      ? "✓"
      : "   ",
    lc1_q2_answer_2_tick: isCorrectAnswer(
      1,
      data.cycle1.checkForUnderstanding[1]?.answers,
      data.cycle1.checkForUnderstanding[1]?.distractors,
    )
      ? "✓"
      : "   ",
    lc1_q2_answer_3_tick: isCorrectAnswer(
      2,
      data.cycle1.checkForUnderstanding[1]?.answers,
      data.cycle1.checkForUnderstanding[1]?.distractors,
    )
      ? "✓"
      : "   ",
    lc2_q1_answer_1_tick: data.cycle2
      ? isCorrectAnswer(
          0,
          data.cycle2.checkForUnderstanding[0]?.answers,
          data.cycle2.checkForUnderstanding[0]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
    lc2_q1_answer_2_tick: data.cycle2
      ? isCorrectAnswer(
          1,
          data.cycle2.checkForUnderstanding[0]?.answers,
          data.cycle2.checkForUnderstanding[0]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
    lc2_q1_answer_3_tick: data.cycle2
      ? isCorrectAnswer(
          2,
          data.cycle2.checkForUnderstanding[0]?.answers,
          data.cycle2.checkForUnderstanding[0]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
    lc2_q2_answer_1_tick: data.cycle2
      ? isCorrectAnswer(
          0,
          data.cycle2.checkForUnderstanding[1]?.answers,
          data.cycle2.checkForUnderstanding[1]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
    lc2_q2_answer_2_tick: data.cycle2
      ? isCorrectAnswer(
          1,
          data.cycle2.checkForUnderstanding[1]?.answers,
          data.cycle2.checkForUnderstanding[1]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
    lc2_q2_answer_3_tick: data.cycle2
      ? isCorrectAnswer(
          2,
          data.cycle2.checkForUnderstanding[1]?.answers,
          data.cycle2.checkForUnderstanding[1]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
    lc3_q1_answer_1_tick: data.cycle3
      ? isCorrectAnswer(
          0,
          data.cycle3.checkForUnderstanding[0]?.answers,
          data.cycle3.checkForUnderstanding[0]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
    lc3_q1_answer_2_tick: data.cycle3
      ? isCorrectAnswer(
          1,
          data.cycle3.checkForUnderstanding[0]?.answers,
          data.cycle3.checkForUnderstanding[0]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
    lc3_q1_answer_3_tick: data.cycle3
      ? isCorrectAnswer(
          2,
          data.cycle3.checkForUnderstanding[0]?.answers,
          data.cycle3.checkForUnderstanding[0]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
    lc3_q2_answer_1_tick: data.cycle3
      ? isCorrectAnswer(
          0,
          data.cycle3.checkForUnderstanding[1]?.answers,
          data.cycle3.checkForUnderstanding[1]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
    lc3_q2_answer_2_tick: data.cycle3
      ? isCorrectAnswer(
          1,
          data.cycle3.checkForUnderstanding[1]?.answers,
          data.cycle3.checkForUnderstanding[1]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
    lc3_q2_answer_3_tick: data.cycle3
      ? isCorrectAnswer(
          2,
          data.cycle3.checkForUnderstanding[1]?.answers,
          data.cycle3.checkForUnderstanding[1]?.distractors,
        )
        ? "✓"
        : ""
      : "   ",
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
