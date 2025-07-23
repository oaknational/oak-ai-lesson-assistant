import type { Quiz } from "../schema/input.schema";
import { filterToMcQuestions, processQuizAnswers } from "../utils";

function processQuizAnswersForQuiz(
  answers: string[] | undefined,
  distractors: string[] | undefined,
) {
  return processQuizAnswers(
    {
      sortAlpha: true,
      includeTicks: false,
      prefixWithABC: true,
    },
    answers,
    distractors,
  );
}
function processQuizQuestionText(question: string | undefined, index: number) {
  return question ? `${index + 1}. ${question}` : " ";
}

export async function prepQuizForDocs({
  title,
  quiz,
  quizType,
}: {
  title: string;
  quiz: Quiz;
  quizType: "exit" | "starter";
}) {
  const quizTypeText = quizType === "exit" ? "Exit quiz" : "Starter quiz";

  // TODO: Currently only multiple-choice questions are supported in exports
  // Filter to only include multiple-choice questions
  // Other question types (short-answer, match, order) are ignored
  const mcQuestions = filterToMcQuestions(quiz.questions);

  return Promise.resolve({
    lesson_title: title,
    quiz_type: quizTypeText,
    question_1: processQuizQuestionText(mcQuestions[0]?.question, 0),
    question_1_answer_a: processQuizAnswersForQuiz(
      mcQuestions[0]?.answers,
      mcQuestions[0]?.distractors,
    )[0],
    question_1_answer_b: processQuizAnswersForQuiz(
      mcQuestions[0]?.answers,
      mcQuestions[0]?.distractors,
    )[1],
    question_1_answer_c: processQuizAnswersForQuiz(
      mcQuestions[0]?.answers,
      mcQuestions[0]?.distractors,
    )[2],
    question_2: processQuizQuestionText(mcQuestions[1]?.question, 1),
    question_2_answer_a:
      processQuizAnswersForQuiz(
        mcQuestions[1]?.answers,
        mcQuestions[1]?.distractors,
      )[0] ?? " ",
    question_2_answer_b:
      processQuizAnswersForQuiz(
        mcQuestions[1]?.answers,
        mcQuestions[1]?.distractors,
      )[1] ?? " ",
    question_2_answer_c:
      processQuizAnswersForQuiz(
        mcQuestions[1]?.answers,
        mcQuestions[1]?.distractors,
      )[2] ?? " ",
    question_3: processQuizQuestionText(mcQuestions[2]?.question, 2),
    question_3_answer_a:
      processQuizAnswersForQuiz(
        mcQuestions[2]?.answers,
        mcQuestions[2]?.distractors,
      )[0] ?? " ",
    question_3_answer_b:
      processQuizAnswersForQuiz(
        mcQuestions[2]?.answers,
        mcQuestions[2]?.distractors,
      )[1] ?? " ",
    question_3_answer_c:
      processQuizAnswersForQuiz(
        mcQuestions[2]?.answers,
        mcQuestions[2]?.distractors,
      )[2] ?? " ",
    question_4: processQuizQuestionText(mcQuestions[3]?.question, 3),
    question_4_answer_a:
      processQuizAnswersForQuiz(
        mcQuestions[3]?.answers,
        mcQuestions[3]?.distractors,
      )[0] ?? " ",
    question_4_answer_b:
      processQuizAnswersForQuiz(
        mcQuestions[3]?.answers,
        mcQuestions[3]?.distractors,
      )[1] ?? " ",
    question_4_answer_c:
      processQuizAnswersForQuiz(
        mcQuestions[3]?.answers,
        mcQuestions[3]?.distractors,
      )[2] ?? " ",
    question_5: processQuizQuestionText(mcQuestions[4]?.question, 4),
    question_5_answer_a:
      processQuizAnswersForQuiz(
        mcQuestions[4]?.answers,
        mcQuestions[4]?.distractors,
      )[0] ?? " ",
    question_5_answer_b:
      processQuizAnswersForQuiz(
        mcQuestions[4]?.answers,
        mcQuestions[4]?.distractors,
      )[1] ?? " ",
    question_5_answer_c:
      processQuizAnswersForQuiz(
        mcQuestions[4]?.answers,
        mcQuestions[4]?.distractors,
      )[2] ?? " ",
    question_6: processQuizQuestionText(mcQuestions[5]?.question, 5),
    question_6_answer_a:
      processQuizAnswersForQuiz(
        mcQuestions[5]?.answers,
        mcQuestions[5]?.distractors,
      )[0] ?? " ",
    question_6_answer_b:
      processQuizAnswersForQuiz(
        mcQuestions[5]?.answers,
        mcQuestions[5]?.distractors,
      )[1] ?? " ",
    question_6_answer_c:
      processQuizAnswersForQuiz(
        mcQuestions[5]?.answers,
        mcQuestions[5]?.distractors,
      )[2] ?? " ",
  });
}
