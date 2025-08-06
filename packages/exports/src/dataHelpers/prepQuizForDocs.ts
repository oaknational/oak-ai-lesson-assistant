import { latexToImageReplacements } from "../gSuite/docs/latexToImageReplacements";
import type { Quiz } from "../schema/input.schema";
import { filterToMcQuestions, processQuizAnswers } from "../utils";

async function processQuizAnswersForQuiz(
  answers: string[] | undefined,
  distractors: string[] | undefined,
) {
  const processedAnswers = processQuizAnswers(
    {
      sortAlpha: true,
      includeTicks: false,
      prefixWithABC: true,
    },
    answers,
    distractors,
  );

  // Process each answer for LaTeX replacements
  const latexProcessedAnswers = await Promise.all(
    processedAnswers.map(async (answer) => {
      if (!answer) return answer;
      const { modifiedText } = await latexToImageReplacements(answer);
      return modifiedText;
    }),
  );

  return latexProcessedAnswers;
}
async function processQuizQuestionText(
  question: string | undefined,
  index: number,
) {
  if (!question) return " ";

  const numberedQuestion = `${index + 1}. ${question}`;
  const { modifiedText } = await latexToImageReplacements(numberedQuestion);
  return modifiedText;
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

  // Process all questions and answers in parallel for efficiency
  const [
    q1,
    q1_answers,
    q2,
    q2_answers,
    q3,
    q3_answers,
    q4,
    q4_answers,
    q5,
    q5_answers,
    q6,
    q6_answers,
  ] = await Promise.all([
    processQuizQuestionText(mcQuestions[0]?.question, 0),
    processQuizAnswersForQuiz(
      mcQuestions[0]?.answers,
      mcQuestions[0]?.distractors,
    ),
    processQuizQuestionText(mcQuestions[1]?.question, 1),
    processQuizAnswersForQuiz(
      mcQuestions[1]?.answers,
      mcQuestions[1]?.distractors,
    ),
    processQuizQuestionText(mcQuestions[2]?.question, 2),
    processQuizAnswersForQuiz(
      mcQuestions[2]?.answers,
      mcQuestions[2]?.distractors,
    ),
    processQuizQuestionText(mcQuestions[3]?.question, 3),
    processQuizAnswersForQuiz(
      mcQuestions[3]?.answers,
      mcQuestions[3]?.distractors,
    ),
    processQuizQuestionText(mcQuestions[4]?.question, 4),
    processQuizAnswersForQuiz(
      mcQuestions[4]?.answers,
      mcQuestions[4]?.distractors,
    ),
    processQuizQuestionText(mcQuestions[5]?.question, 5),
    processQuizAnswersForQuiz(
      mcQuestions[5]?.answers,
      mcQuestions[5]?.distractors,
    ),
  ]);

  return {
    lesson_title: title,
    quiz_type: quizTypeText,
    question_1: q1,
    question_1_answer_a: q1_answers[0] ?? " ",
    question_1_answer_b: q1_answers[1] ?? " ",
    question_1_answer_c: q1_answers[2] ?? " ",
    question_2: q2,
    question_2_answer_a: q2_answers[0] ?? " ",
    question_2_answer_b: q2_answers[1] ?? " ",
    question_2_answer_c: q2_answers[2] ?? " ",
    question_3: q3,
    question_3_answer_a: q3_answers[0] ?? " ",
    question_3_answer_b: q3_answers[1] ?? " ",
    question_3_answer_c: q3_answers[2] ?? " ",
    question_4: q4,
    question_4_answer_a: q4_answers[0] ?? " ",
    question_4_answer_b: q4_answers[1] ?? " ",
    question_4_answer_c: q4_answers[2] ?? " ",
    question_5: q5,
    question_5_answer_a: q5_answers[0] ?? " ",
    question_5_answer_b: q5_answers[1] ?? " ",
    question_5_answer_c: q5_answers[2] ?? " ",
    question_6: q6,
    question_6_answer_a: q6_answers[0] ?? " ",
    question_6_answer_b: q6_answers[1] ?? " ",
    question_6_answer_c: q6_answers[2] ?? " ",
  };
}
