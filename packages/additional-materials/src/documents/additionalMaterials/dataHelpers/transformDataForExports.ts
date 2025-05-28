import { comprehensionTaskSchema } from "../comprehension/schema";
import type { AdditionalMaterialType } from "../configSchema";
import { exitQuizSchema } from "../exitQuiz/schema";
import { glossarySchema } from "../glossary/schema";
import { starterQuizSchema } from "../starterQuiz/schema";

export const transformDataForExport = (
  documentType: AdditionalMaterialType,
) => {
  switch (documentType) {
    case "additional-glossary":
      return transformDataGlossary;
    case "additional-comprehension":
      return transformDataComprehension;
    case "additional-starter-quiz":
      return transformDataStarterQuiz;
    case "additional-exit-quiz":
      return transformDataExitQuiz;
    default:
      throw new Error(`Unknown document type`);
  }
};

type TransformResult = Array<
  | { type: "title"; text: string }
  | { type: "placeholders"; map: Record<string, string> }
>;

export const transformDataGlossary =
  () =>
  (data: unknown): Promise<TransformResult> => {
    const parsedData = glossarySchema.parse(data);
    const { glossary, lessonTitle } = parsedData;

    const placeholderMap: Record<string, string> = {
      title: lessonTitle,
    };

    glossary.forEach((term, index) => {
      const termNum = index + 1;
      placeholderMap[`term_${termNum}`] = `${term.term}:`;
      placeholderMap[`definition_${termNum}`] = term.definition;
    });

    const transformedData: TransformResult = [
      { type: "title", text: lessonTitle },
      { type: "placeholders", map: placeholderMap },
    ];

    return Promise.resolve(transformedData);
  };

export const transformDataComprehension =
  () =>
  (data: unknown): Promise<TransformResult> => {
    const parsedData = comprehensionTaskSchema.parse(data);
    const { comprehension } = parsedData;
    const questions = comprehension.questions || [];

    const placeholderMap: Record<string, string> = {
      title: comprehension.lessonTitle,
      comprehension_text: comprehension.text,
    };

    // Add questions and answers up to 10 questions
    for (let i = 1; i <= 10; i++) {
      const question = questions[i - 1];
      placeholderMap[`question_${i}`] = question?.questionText || "";
      placeholderMap[`question_${i}_answer`] = question?.answer || "";
    }

    const transformedData: TransformResult = [
      { type: "title", text: comprehension.lessonTitle },
      { type: "placeholders", map: placeholderMap },
    ];

    return Promise.resolve(transformedData);
  };

export const transformDataStarterQuiz =
  () =>
  (data: unknown): Promise<TransformResult> => {
    const parsedData = starterQuizSchema.parse(data);
    const { title } = parsedData;

    const placeholderMap: Record<string, string> = {
      title: `Starter Quiz: ${title}`,
    };

    const transformedData: TransformResult = [
      { type: "title", text: `Starter Quiz: ${title}` },
      { type: "placeholders", map: placeholderMap },
    ];

    return Promise.resolve(transformedData);
  };

export const transformDataExitQuiz =
  () =>
  (data: unknown): Promise<TransformResult> => {
    const parsedData = exitQuizSchema.parse(data);
    const { title, questions } = parsedData;

    const placeholderMap: Record<string, string> = {
      title: `Exit Quiz: ${title}`,
    };

    // Add questions and answers up to 10 questions
    questions.slice(0, 10).forEach((q, qIndex) => {
      const questionNum = qIndex + 1;
      placeholderMap[`question_${questionNum}`] = q.question;

      q.options.forEach((option, aIndex) => {
        if (aIndex < 3) {
          const answerNum = aIndex + 1;
          const marker = option.isCorrect ? "✓ " : "";
          placeholderMap[`question_${questionNum}_answer_${answerNum}`] =
            `${marker}${option.text}`;
        }
      });
    });

    // Fill any missing placeholders with empty strings for up to 10 questions
    for (let i = 1; i <= 10; i++) {
      if (!placeholderMap[`question_${i}`]) {
        placeholderMap[`question_${i}`] = "";
      }
      for (let j = 1; j <= 3; j++) {
        if (!placeholderMap[`question_${i}_answer_${j}`]) {
          placeholderMap[`question_${i}_answer_${j}`] = "";
        }
      }
    }

    const transformedData: TransformResult = [
      { type: "title", text: `Exit Quiz: ${title}` },
      { type: "placeholders", map: placeholderMap },
    ];

    return Promise.resolve(transformedData);
  };
