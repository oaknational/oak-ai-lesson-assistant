import { latexToImageReplacements } from "../gSuite/docs/latexToImageReplacements";
import type { Quiz, QuizV2Question } from "../schema/input.schema";
import type { QuestionData } from "../gSuite/docs/questionHandlers";

/**
 * Convert a quiz question to our internal format for template processing
 */
async function convertQuestionToData(
  question: QuizV2Question,
  index: number
): Promise<QuestionData> {
  // Process question text for LaTeX
  const { modifiedText: processedQuestion } = await latexToImageReplacements(
    question.question
  );

  const baseData: QuestionData = {
    question: processedQuestion,
    type: question.questionType,
  };

  switch (question.questionType) {
    case "multiple-choice": {
      // Process answers and distractors for LaTeX
      const allOptions = [...question.answers, ...question.distractors];
      const processedOptions = await Promise.all(
        allOptions.map(async (option) => {
          const { modifiedText } = await latexToImageReplacements(option);
          return modifiedText;
        })
      );
      
      return {
        ...baseData,
        answers: processedOptions,
      };
    }

    case "order": {
      // Process items for LaTeX
      const processedItems = await Promise.all(
        question.answers.map(async (item) => {
          const { modifiedText } = await latexToImageReplacements(item);
          return modifiedText;
        })
      );
      
      return {
        ...baseData,
        items: processedItems,
      };
    }

    case "match": {
      // Process match pairs for LaTeX
      const processedPairs = await Promise.all(
        question.answers.map(async ([left, right]) => {
          const { modifiedText: processedLeft } = await latexToImageReplacements(left);
          const { modifiedText: processedRight } = await latexToImageReplacements(right);
          return { left: processedLeft, right: processedRight };
        })
      );
      
      return {
        ...baseData,
        pairs: processedPairs,
      };
    }

    case "short-answer": {
      // Short answer questions don't need additional processing
      return baseData;
    }

    default: {
      // Type guard - should never reach here
      const _exhaustive: never = question;
      throw new Error(`Unknown question type: ${JSON.stringify(question)}`);
    }
  }
}

export async function prepQuizForDocsV2({
  title,
  quiz,
  quizType,
}: {
  title: string;
  quiz: Quiz;
  quizType: "exit" | "starter";
}) {
  const quizTypeText = quizType === "exit" ? "Exit quiz" : "Starter quiz";

  // Convert all questions to our internal format
  const questionData = await Promise.all(
    quiz.questions.map((question, index) => 
      convertQuestionToData(question, index)
    )
  );

  return {
    lesson_title: title,
    quiz_type: quizTypeText,
    questions: questionData,
  };
}