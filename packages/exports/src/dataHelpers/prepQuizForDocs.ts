import type { Quiz } from "../schema/input.schema";
import { processQuizAnswers } from "../utils";

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

  return {
    lesson_title: title,
    quiz_type: quizTypeText,
    question_1: processQuizQuestionText(quiz[0]?.question, 0),
    question_1_answer_a: processQuizAnswersForQuiz(
      quiz[0]?.answers,
      quiz[0]?.distractors,
    )[0],
    question_1_answer_b: processQuizAnswersForQuiz(
      quiz[0]?.answers,
      quiz[0]?.distractors,
    )[1],
    question_1_answer_c: processQuizAnswersForQuiz(
      quiz[0]?.answers,
      quiz[0]?.distractors,
    )[2],
    question_2: processQuizQuestionText(quiz[1]?.question, 1),
    question_2_answer_a:
      processQuizAnswersForQuiz(quiz[1]?.answers, quiz[1]?.distractors)[0] ??
      " ",
    question_2_answer_b:
      processQuizAnswersForQuiz(quiz[1]?.answers, quiz[1]?.distractors)[1] ??
      " ",
    question_2_answer_c:
      processQuizAnswersForQuiz(quiz[1]?.answers, quiz[1]?.distractors)[2] ??
      " ",
    question_3: processQuizQuestionText(quiz[2]?.question, 2),
    question_3_answer_a:
      processQuizAnswersForQuiz(quiz[2]?.answers, quiz[2]?.distractors)[0] ??
      " ",
    question_3_answer_b:
      processQuizAnswersForQuiz(quiz[2]?.answers, quiz[2]?.distractors)[1] ??
      " ",
    question_3_answer_c:
      processQuizAnswersForQuiz(quiz[2]?.answers, quiz[2]?.distractors)[2] ??
      " ",
    question_4: processQuizQuestionText(quiz[3]?.question, 3),
    question_4_answer_a:
      processQuizAnswersForQuiz(quiz[3]?.answers, quiz[3]?.distractors)[0] ??
      " ",
    question_4_answer_b:
      processQuizAnswersForQuiz(quiz[3]?.answers, quiz[3]?.distractors)[1] ??
      " ",
    question_4_answer_c:
      processQuizAnswersForQuiz(quiz[3]?.answers, quiz[3]?.distractors)[2] ??
      " ",
    question_5: processQuizQuestionText(quiz[4]?.question, 4),
    question_5_answer_a:
      processQuizAnswersForQuiz(quiz[4]?.answers, quiz[4]?.distractors)[0] ??
      " ",
    question_5_answer_b:
      processQuizAnswersForQuiz(quiz[4]?.answers, quiz[4]?.distractors)[1] ??
      " ",
    question_5_answer_c:
      processQuizAnswersForQuiz(quiz[4]?.answers, quiz[4]?.distractors)[2] ??
      " ",
    question_6: processQuizQuestionText(quiz[5]?.question, 5),
    question_6_answer_a:
      processQuizAnswersForQuiz(quiz[5]?.answers, quiz[5]?.distractors)[0] ??
      " ",
    question_6_answer_b:
      processQuizAnswersForQuiz(quiz[5]?.answers, quiz[5]?.distractors)[1] ??
      " ",
    question_6_answer_c:
      processQuizAnswersForQuiz(quiz[5]?.answers, quiz[5]?.distractors)[2] ??
      " ",
  };
}
