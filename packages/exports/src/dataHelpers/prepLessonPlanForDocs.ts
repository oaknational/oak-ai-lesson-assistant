import type { LessonPlanDocInputData } from "../schema/input.schema";
import type { LessonPlanDocsTemplateData } from "../schema/lessonPlanDocsTemplate.schema";
import {
  camelCaseToTitleCase,
  processQuizAnswers,
  stringOrBullets,
} from "../utils";

function processQuizAnswersForLessonPlanDoc(
  answers: string[] | undefined,
  distractors: string[] | undefined,
) {
  return processQuizAnswers(
    {
      sortAlpha: true,
      includeTicks: true,
      prefixWithABC: true,
    },
    answers,
    distractors,
  );
}

export async function prepLessonPlanForDocs(
  lessonPlan: LessonPlanDocInputData,
): Promise<LessonPlanDocsTemplateData> {
  return Promise.resolve({
    lesson_title: lessonPlan.title,
    subject: lessonPlan.subject,
    key_stage: camelCaseToTitleCase(lessonPlan.keyStage) ?? "",
    topic: lessonPlan.topic ?? " ",
    learning_outcome: lessonPlan.learningOutcome ?? " ",
    learning_cycle_outcome_1: lessonPlan.learningCycles
      ? "1.     " + lessonPlan.learningCycles[0]
      : " ",
    learning_cycle_outcome_2: lessonPlan.learningCycles
      ? "2.     " + lessonPlan.learningCycles[1]
      : " ",
    learning_cycle_outcome_3: lessonPlan.learningCycles
      ? "3.     " + lessonPlan.learningCycles[2]
      : " ",
    prior_knowledge: lessonPlan.priorKnowledge ?? [" "],
    misconception_1: lessonPlan.misconceptions
      ? "1.     " + lessonPlan.misconceptions[0]?.description
      : "",
    misconception_2: lessonPlan.misconceptions
      ? "2.     " + lessonPlan.misconceptions[1]?.description
      : "",
    misconception_3: lessonPlan.misconceptions
      ? "3.     " + lessonPlan.misconceptions[2]?.description
      : "",
    keyword_1: lessonPlan.keywords?.[0]?.keyword ?? " ",
    keyword_2: lessonPlan.keywords?.[1]?.keyword ?? " ",
    keyword_3: lessonPlan.keywords?.[2]?.keyword ?? " ",
    keyword_4: lessonPlan.keywords?.[3]?.keyword ?? " ",
    keyword_5: lessonPlan.keywords?.[4]?.keyword ?? " ",
    keyword_definition_1: lessonPlan.keywords?.[0]?.definition ?? " ",
    keyword_definition_2: lessonPlan.keywords?.[1]?.definition ?? " ",
    keyword_definition_3: lessonPlan.keywords?.[2]?.definition ?? " ",
    keyword_definition_4: lessonPlan.keywords?.[3]?.definition ?? " ",
    keyword_definition_5: lessonPlan.keywords?.[4]?.definition ?? " ",
    key_learning_point_1: lessonPlan.keyLearningPoints
      ? "1.     " + lessonPlan.keyLearningPoints[0]
      : " ",
    key_learning_point_2: lessonPlan.keyLearningPoints
      ? "2.     " + lessonPlan.keyLearningPoints[1]
      : " ",
    key_learning_point_3: lessonPlan.keyLearningPoints
      ? "3.     " + lessonPlan.keyLearningPoints[2]
      : " ",
    key_learning_point_4: lessonPlan.keyLearningPoints
      ? "4.     " + lessonPlan.keyLearningPoints[3]
      : " ",

    starter_quiz_question_1: lessonPlan.starterQuiz[0]?.question ?? "",
    starter_quiz_question_1_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[0]?.answers,
        lessonPlan.starterQuiz[0]?.distractors,
      )[0] ?? "",
    starter_quiz_question_1_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[0]?.answers,
        lessonPlan.starterQuiz[0]?.distractors,
      )[1] ?? "",
    starter_quiz_question_1_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[0]?.answers,
        lessonPlan.starterQuiz[0]?.distractors,
      )[2] ?? "",
    starter_quiz_question_2: lessonPlan.starterQuiz[1]?.question ?? "",
    starter_quiz_question_2_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[1]?.answers,
        lessonPlan.starterQuiz[1]?.distractors,
      )[0] ?? "",
    starter_quiz_question_2_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[1]?.answers,
        lessonPlan.starterQuiz[1]?.distractors,
      )[1] ?? "",
    starter_quiz_question_2_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[1]?.answers,
        lessonPlan.starterQuiz[1]?.distractors,
      )[2] ?? "",
    starter_quiz_question_3: lessonPlan.starterQuiz[2]?.question ?? "",
    starter_quiz_question_3_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[2]?.answers,
        lessonPlan.starterQuiz[2]?.distractors,
      )[0] ?? "",
    starter_quiz_question_3_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[2]?.answers,
        lessonPlan.starterQuiz[2]?.distractors,
      )[1] ?? "",
    starter_quiz_question_3_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[2]?.answers,
        lessonPlan.starterQuiz[2]?.distractors,
      )[2] ?? "",
    starter_quiz_question_4: lessonPlan.starterQuiz[3]?.question ?? "",
    starter_quiz_question_4_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[3]?.answers,
        lessonPlan.starterQuiz[3]?.distractors,
      )[0] ?? "",
    starter_quiz_question_4_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[3]?.answers,
        lessonPlan.starterQuiz[3]?.distractors,
      )[1] ?? "",
    starter_quiz_question_4_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[3]?.answers,
        lessonPlan.starterQuiz[3]?.distractors,
      )[2] ?? "",
    starter_quiz_question_5: lessonPlan.starterQuiz[4]?.question ?? "",
    starter_quiz_question_5_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[4]?.answers,
        lessonPlan.starterQuiz[4]?.distractors,
      )[0] ?? "",
    starter_quiz_question_5_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[4]?.answers,
        lessonPlan.starterQuiz[4]?.distractors,
      )[1] ?? "",
    starter_quiz_question_5_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[4]?.answers,
        lessonPlan.starterQuiz[4]?.distractors,
      )[2] ?? "",
    starter_quiz_question_6: lessonPlan.starterQuiz[5]?.question ?? "",
    starter_quiz_question_6_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[5]?.answers,
        lessonPlan.starterQuiz[5]?.distractors,
      )[0] ?? "",
    starter_quiz_question_6_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[5]?.answers,
        lessonPlan.starterQuiz[5]?.distractors,
      )[1] ?? "",
    starter_quiz_question_6_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.starterQuiz[5]?.answers,
        lessonPlan.starterQuiz[5]?.distractors,
      )[2] ?? "",

    ///

    exit_quiz_question_1: lessonPlan.exitQuiz[0]?.question ?? "",
    exit_quiz_question_1_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[0]?.answers,
        lessonPlan.exitQuiz[0]?.distractors,
      )[0] ?? "",
    exit_quiz_question_1_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[0]?.answers,
        lessonPlan.exitQuiz[0]?.distractors,
      )[1] ?? "",
    exit_quiz_question_1_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[0]?.answers,
        lessonPlan.exitQuiz[0]?.distractors,
      )[2] ?? "",
    exit_quiz_question_2: lessonPlan.exitQuiz[1]?.question ?? "",
    exit_quiz_question_2_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[1]?.answers,
        lessonPlan.exitQuiz[1]?.distractors,
      )[0] ?? "",
    exit_quiz_question_2_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[1]?.answers,
        lessonPlan.exitQuiz[1]?.distractors,
      )[1] ?? "",
    exit_quiz_question_2_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[1]?.answers,
        lessonPlan.exitQuiz[1]?.distractors,
      )[2] ?? "",
    exit_quiz_question_3: lessonPlan.exitQuiz[2]?.question ?? "",
    exit_quiz_question_3_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[2]?.answers,
        lessonPlan.exitQuiz[2]?.distractors,
      )[0] ?? "",
    exit_quiz_question_3_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[2]?.answers,
        lessonPlan.exitQuiz[2]?.distractors,
      )[1] ?? "",
    exit_quiz_question_3_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[2]?.answers,
        lessonPlan.exitQuiz[2]?.distractors,
      )[2] ?? "",
    exit_quiz_question_4: lessonPlan.exitQuiz[3]?.question ?? "",
    exit_quiz_question_4_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[3]?.answers,
        lessonPlan.exitQuiz[3]?.distractors,
      )[0] ?? "",
    exit_quiz_question_4_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[3]?.answers,
        lessonPlan.exitQuiz[3]?.distractors,
      )[1] ?? "",
    exit_quiz_question_4_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[3]?.answers,
        lessonPlan.exitQuiz[3]?.distractors,
      )[2] ?? "",
    exit_quiz_question_5: lessonPlan.exitQuiz[4]?.question ?? "",
    exit_quiz_question_5_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[4]?.answers,
        lessonPlan.exitQuiz[4]?.distractors,
      )[0] ?? "",
    exit_quiz_question_5_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[4]?.answers,
        lessonPlan.exitQuiz[4]?.distractors,
      )[1] ?? "",
    exit_quiz_question_5_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[4]?.answers,
        lessonPlan.exitQuiz[4]?.distractors,
      )[2] ?? "",
    exit_quiz_question_6: lessonPlan.exitQuiz[5]?.question ?? "",
    exit_quiz_question_6_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[5]?.answers,
        lessonPlan.exitQuiz[5]?.distractors,
      )[0] ?? "",
    exit_quiz_question_6_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[5]?.answers,
        lessonPlan.exitQuiz[5]?.distractors,
      )[1] ?? "",
    exit_quiz_question_6_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.exitQuiz[5]?.answers,
        lessonPlan.exitQuiz[5]?.distractors,
      )[2] ?? "",

    ///
    learning_cycle_1_title: lessonPlan.cycle1.title,
    learning_cycle_2_title: lessonPlan.cycle2?.title ?? "",
    learning_cycle_3_title: lessonPlan.cycle3?.title ?? "",
    learning_cycle_1_text: stringOrBullets(
      lessonPlan.cycle1.explanation.spokenExplanation,
    ),
    cycle_1_spoken_explanation: stringOrBullets(
      lessonPlan.cycle1.explanation.spokenExplanation,
    ),
    cycle_1_check_for_understanding_question_1:
      lessonPlan.cycle1.checkForUnderstanding[0]?.question ?? "",
    cycle_1_check_for_understanding_question_1_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle1.checkForUnderstanding[0]?.answers,
        lessonPlan.cycle1.checkForUnderstanding[0]?.distractors,
      )[0] ?? "",
    cycle_1_check_for_understanding_question_1_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle1.checkForUnderstanding[0]?.answers,
        lessonPlan.cycle1.checkForUnderstanding[0]?.distractors,
      )[1] ?? "",
    cycle_1_check_for_understanding_question_1_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle1.checkForUnderstanding[0]?.answers,
        lessonPlan.cycle1.checkForUnderstanding[0]?.distractors,
      )[2] ?? "",

    cycle_1_check_for_understanding_question_2:
      lessonPlan.cycle1.checkForUnderstanding[1]?.question ?? "",
    cycle_1_check_for_understanding_question_2_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle1.checkForUnderstanding[1]?.answers,
        lessonPlan.cycle1.checkForUnderstanding[1]?.distractors,
      )[0] ?? "",
    cycle_1_check_for_understanding_question_2_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle1.checkForUnderstanding[1]?.answers,
        lessonPlan.cycle1.checkForUnderstanding[1]?.distractors,
      )[1] ?? "",
    cycle_1_check_for_understanding_question_2_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle1.checkForUnderstanding[1]?.answers,
        lessonPlan.cycle1.checkForUnderstanding[1]?.distractors,
      )[2] ?? "",
    cycle_1_practice: lessonPlan.cycle1.practice,
    cycle_1_feedback: lessonPlan.cycle1.feedback,

    ///

    cycle_2_spoken_explanation: stringOrBullets(
      lessonPlan.cycle2?.explanation.spokenExplanation,
    ),
    cycle_2_check_for_understanding_question_1:
      lessonPlan.cycle2?.checkForUnderstanding[0]?.question ?? "",
    cycle_2_check_for_understanding_question_1_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle2?.checkForUnderstanding[0]?.answers ?? [],
        lessonPlan.cycle2?.checkForUnderstanding[0]?.distractors ?? [],
      )[0] ?? " ",
    cycle_2_check_for_understanding_question_1_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle2?.checkForUnderstanding[0]?.answers ?? [],
        lessonPlan.cycle2?.checkForUnderstanding[0]?.distractors ?? [],
      )[1] ?? " ",
    cycle_2_check_for_understanding_question_1_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle2?.checkForUnderstanding[0]?.answers ?? [],
        lessonPlan.cycle2?.checkForUnderstanding[0]?.distractors ?? [],
      )[2] ?? " ",

    cycle_2_check_for_understanding_question_2:
      lessonPlan.cycle2?.checkForUnderstanding[1]?.question ?? "",
    cycle_2_check_for_understanding_question_2_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle2?.checkForUnderstanding[1]?.answers ?? [],
        lessonPlan.cycle2?.checkForUnderstanding[1]?.distractors ?? [],
      )[0] ?? "",
    cycle_2_check_for_understanding_question_2_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle2?.checkForUnderstanding[1]?.answers ?? [],
        lessonPlan.cycle2?.checkForUnderstanding[1]?.distractors ?? [],
      )[1] ?? "",
    cycle_2_check_for_understanding_question_2_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle2?.checkForUnderstanding[1]?.answers ?? [],
        lessonPlan.cycle2?.checkForUnderstanding[1]?.distractors ?? [],
      )[2] ?? "",
    cycle_2_practice: lessonPlan.cycle2?.practice ?? " ",
    cycle_2_feedback: lessonPlan.cycle2?.feedback ?? " ",

    // ///

    cycle_3_spoken_explanation: stringOrBullets(
      lessonPlan.cycle3?.explanation.spokenExplanation,
    ),
    cycle_3_check_for_understanding_question_1:
      lessonPlan.cycle3?.checkForUnderstanding[0]?.question ?? "",
    cycle_3_check_for_understanding_question_1_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle3?.checkForUnderstanding[0]?.answers ?? [],
        lessonPlan.cycle3?.checkForUnderstanding[0]?.distractors ?? [],
      )[0] ?? " ",
    cycle_3_check_for_understanding_question_1_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle3?.checkForUnderstanding[0]?.answers ?? [],
        lessonPlan.cycle3?.checkForUnderstanding[0]?.distractors ?? [],
      )[1] ?? " ",
    cycle_3_check_for_understanding_question_1_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle3?.checkForUnderstanding[0]?.answers ?? [],
        lessonPlan.cycle3?.checkForUnderstanding[0]?.distractors ?? [],
      )[2] ?? " ",
    cycle_3_check_for_understanding_question_2:
      lessonPlan.cycle3?.checkForUnderstanding[1]?.question ?? "",
    cycle_3_check_for_understanding_question_2_answer_1:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle3?.checkForUnderstanding[1]?.answers ?? [],
        lessonPlan.cycle3?.checkForUnderstanding[1]?.distractors ?? [],
      )[0] ?? "",
    cycle_3_check_for_understanding_question_2_answer_2:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle3?.checkForUnderstanding[1]?.answers ?? [],
        lessonPlan.cycle3?.checkForUnderstanding[1]?.distractors ?? [],
      )[1] ?? "",
    cycle_3_check_for_understanding_question_2_answer_3:
      processQuizAnswersForLessonPlanDoc(
        lessonPlan.cycle3?.checkForUnderstanding[1]?.answers ?? [],
        lessonPlan.cycle3?.checkForUnderstanding[1]?.distractors ?? [],
      )[2] ?? "",
    cycle_3_practice: lessonPlan.cycle3?.practice ?? " ",
    cycle_3_feedback: lessonPlan.cycle3?.feedback ?? " ",
  });
}
