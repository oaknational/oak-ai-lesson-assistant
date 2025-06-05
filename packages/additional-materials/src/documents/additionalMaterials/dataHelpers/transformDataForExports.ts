import { aiLogger } from "@oakai/logger";

import { comprehensionTaskSchema } from "../comprehension/schema";
import type { AdditionalMaterialType } from "../configSchema";
import { exitQuizSchema } from "../exitQuiz/schema";
import { glossarySchema } from "../glossary/schema";
import { starterQuizSchema } from "../starterQuiz/schema";

const log = aiLogger("additional-materials");

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

    log.info("Transforming glossary data", {
      lessonTitle,
      glossaryLength: glossary.length,
      firstTerm: glossary[0],
      allTerms: glossary.map((t) => ({
        term: t.term,
        definition: t.definition,
      })),
    });

    const placeholderMap: Record<string, string> = {
      title: lessonTitle,
    };

    // Use the correct placeholder names that match the template
    glossary.forEach((term, index) => {
      const termNum = index + 1;
      placeholderMap[`label_${termNum}`] = term.term;
      placeholderMap[`value_${termNum}`] = term.definition;
    });

    // Fill any missing placeholders with empty strings for up to 15 terms
    for (let i = 1; i <= 15; i++) {
      if (!placeholderMap[`label_${i}`]) {
        placeholderMap[`label_${i}`] = "";
      }
      if (!placeholderMap[`value_${i}`]) {
        placeholderMap[`value_${i}`] = "";
      }
    }

    log.info("Generated glossary placeholders", {
      placeholderCount: Object.keys(placeholderMap).length,
      samplePlaceholders: {
        title: placeholderMap["title"],
        label_1: placeholderMap["label_1"],
        value_1: placeholderMap["value_1"],
        label_2: placeholderMap["label_2"],
        value_2: placeholderMap["value_2"],
        label_3: placeholderMap["label_3"],
        value_3: placeholderMap["value_3"],
      },
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
    const { title, questions } = parsedData;

    log.info("Transforming starter quiz data", {
      title,
      questionCount: questions.length,
      firstQuestion: questions[0],
    });

    const placeholderMap: Record<string, string> = {
      title: `Starter Quiz: ${title}`,
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

    log.info("Generated starter quiz placeholders", {
      placeholderCount: Object.keys(placeholderMap).length,
      samplePlaceholders: {
        question_1: placeholderMap["question_1"],
        question_1_answer_1: placeholderMap["question_1_answer_1"],
        question_1_answer_2: placeholderMap["question_1_answer_2"],
        question_1_answer_3: placeholderMap["question_1_answer_3"],
      },
    });

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

    log.info("Transforming exit quiz data", {
      title,
      questionCount: questions.length,
      firstQuestion: questions[0],
    });

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

    log.info("Generated exit quiz placeholders", {
      placeholderCount: Object.keys(placeholderMap).length,
      samplePlaceholders: {
        question_1: placeholderMap["question_1"],
        question_1_answer_1: placeholderMap["question_1_answer_1"],
        question_1_answer_2: placeholderMap["question_1_answer_2"],
        question_1_answer_3: placeholderMap["question_1_answer_3"],
      },
    });

    const transformedData: TransformResult = [
      { type: "title", text: `Exit Quiz: ${title}` },
      { type: "placeholders", map: placeholderMap },
    ];

    return Promise.resolve(transformedData);
  };
