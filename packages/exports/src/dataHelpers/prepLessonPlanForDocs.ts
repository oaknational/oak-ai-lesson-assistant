import type { LessonPlanDocInputData } from "../schema/input.schema";
import type { LessonPlanDocsTemplateData } from "../schema/lessonPlanDocsTemplate.schema";
import {
  camelCaseToTitleCase,
  formatLegacyQuestionForDoc,
  formatQuestionForDoc,
  stringOrBullets,
} from "../utils";

export async function prepLessonPlanForDocs(
  lessonPlan: LessonPlanDocInputData,
): Promise<LessonPlanDocsTemplateData> {
  const starterQuestions = lessonPlan.starterQuiz.questions;
  const exitQuestions = lessonPlan.exitQuiz.questions;

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
    prior_knowledge: lessonPlan.priorKnowledge?.map((pk) => "•  " + pk) ?? [
      " ",
    ],
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

    starter_quiz_question_1: starterQuestions[0]
      ? formatQuestionForDoc(starterQuestions[0], 1)
      : "",
    starter_quiz_question_2: starterQuestions[1]
      ? formatQuestionForDoc(starterQuestions[1], 2)
      : "",
    starter_quiz_question_3: starterQuestions[2]
      ? formatQuestionForDoc(starterQuestions[2], 3)
      : "",
    starter_quiz_question_4: starterQuestions[3]
      ? formatQuestionForDoc(starterQuestions[3], 4)
      : "",
    starter_quiz_question_5: starterQuestions[4]
      ? formatQuestionForDoc(starterQuestions[4], 5)
      : "",
    starter_quiz_question_6: starterQuestions[5]
      ? formatQuestionForDoc(starterQuestions[5], 6)
      : "",

    ///

    exit_quiz_question_1: exitQuestions[0]
      ? formatQuestionForDoc(exitQuestions[0], 1)
      : "",
    exit_quiz_question_2: exitQuestions[1]
      ? formatQuestionForDoc(exitQuestions[1], 2)
      : "",
    exit_quiz_question_3: exitQuestions[2]
      ? formatQuestionForDoc(exitQuestions[2], 3)
      : "",
    exit_quiz_question_4: exitQuestions[3]
      ? formatQuestionForDoc(exitQuestions[3], 4)
      : "",
    exit_quiz_question_5: exitQuestions[4]
      ? formatQuestionForDoc(exitQuestions[4], 5)
      : "",
    exit_quiz_question_6: exitQuestions[5]
      ? formatQuestionForDoc(exitQuestions[5], 6)
      : "",

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
    cycle_1_check_for_understanding_question_1: lessonPlan.cycle1
      .checkForUnderstanding[0]
      ? formatLegacyQuestionForDoc(
          lessonPlan.cycle1.checkForUnderstanding[0],
          1,
        )
      : "",

    cycle_1_check_for_understanding_question_2: lessonPlan.cycle1
      .checkForUnderstanding[1]
      ? formatLegacyQuestionForDoc(
          lessonPlan.cycle1.checkForUnderstanding[1],
          2,
        )
      : "",
    cycle_1_practice: lessonPlan.cycle1.practice,
    cycle_1_feedback: lessonPlan.cycle1.feedback,

    ///

    cycle_2_spoken_explanation: stringOrBullets(
      lessonPlan.cycle2?.explanation.spokenExplanation,
    ),
    cycle_2_check_for_understanding_question_1: lessonPlan.cycle2
      ?.checkForUnderstanding[0]
      ? formatLegacyQuestionForDoc(
          lessonPlan.cycle2.checkForUnderstanding[0],
          1,
        )
      : "",

    cycle_2_check_for_understanding_question_2: lessonPlan.cycle2
      ?.checkForUnderstanding[1]
      ? formatLegacyQuestionForDoc(
          lessonPlan.cycle2.checkForUnderstanding[1],
          2,
        )
      : "",
    cycle_2_practice: lessonPlan.cycle2?.practice ?? " ",
    cycle_2_feedback: lessonPlan.cycle2?.feedback ?? " ",

    // ///

    cycle_3_spoken_explanation: stringOrBullets(
      lessonPlan.cycle3?.explanation.spokenExplanation,
    ),
    cycle_3_check_for_understanding_question_1: lessonPlan.cycle3
      ?.checkForUnderstanding[0]
      ? formatLegacyQuestionForDoc(
          lessonPlan.cycle3.checkForUnderstanding[0],
          1,
        )
      : "",

    cycle_3_check_for_understanding_question_2: lessonPlan.cycle3
      ?.checkForUnderstanding[1]
      ? formatLegacyQuestionForDoc(
          lessonPlan.cycle3.checkForUnderstanding[1],
          2,
        )
      : "",
    cycle_3_practice: lessonPlan.cycle3?.practice ?? " ",
    cycle_3_feedback: lessonPlan.cycle3?.feedback ?? " ",
  });
}
