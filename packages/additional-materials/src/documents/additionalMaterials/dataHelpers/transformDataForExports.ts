import { aiLogger } from "@oakai/logger";

import type { z } from "zod";

import { comprehensionTaskSchema } from "../comprehension/schema";
import type { AdditionalMaterialType } from "../configSchema";
import type { exitQuizSchema } from "../exitQuiz/schema";
import { glossarySchema } from "../glossary/schema";
import type { starterQuizSchema } from "../starterQuiz/schema";

// Define types for the schemas
export type StarterQuizData = z.infer<typeof starterQuizSchema>;
export type ExitQuizData = z.infer<typeof exitQuizSchema>;
export type ComprehensionTaskData = z.infer<typeof comprehensionTaskSchema>;
export type GlossaryData = z.infer<typeof glossarySchema>;

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

const sanitizePlaceholders = (placeholders: Record<string, string>) => {
  Object.keys(placeholders).forEach((key) => {
    if (placeholders[key] !== undefined) {
      placeholders[key] = placeholders[key].replace(/\n{2,}/g, "\n");
    }
  });
};

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
      placeholderMap[`value_${termNum}`] =
        `- ${term.definition.charAt(0).toUpperCase()}${term.definition.slice(1)}`;
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
      placeholderMap[`question_${i}`] = question?.questionText ?? "";
      placeholderMap[`question_${i}_answer`] = question?.answer ?? "";
    }

    sanitizePlaceholders(placeholderMap);

    const transformedData: TransformResult = [
      { type: "title", text: comprehension.lessonTitle },
      { type: "placeholders", map: placeholderMap },
    ];

    return Promise.resolve(transformedData);
  };

// Helper function to transform quiz data
const transformQuizData = <T extends StarterQuizData | ExitQuizData>(
  data: T,
  type: "Starter" | "Exit",
): TransformResult => {
  const { title, questions } = data;

  const placeholderMap: Record<string, string> = {
    title,
    ms_title: `${title}: answers`,
    type,
  };

  // Add questions and answers up to 10 questions
  questions.slice(0, 10).forEach(
    (
      q: {
        question: string;
        options: { text: string; isCorrect: boolean }[];
      },
      qIndex: number,
    ) => {
      const questionNum = qIndex + 1;
      placeholderMap[`question_${questionNum}`] = q.question;

      q.options.forEach(
        (option: { text: string; isCorrect: boolean }, aIndex: number) => {
          if (aIndex < 3) {
            const answerNum = aIndex + 1;

            placeholderMap[`question_${questionNum}_answer_${answerNum}`] =
              `${option.text}`;
          }
        },
      );
    },
  );

  // Add mark scheme questions and answers up to 10 questions
  questions.slice(0, 10).forEach(
    (
      q: {
        question: string;
        options: { text: string; isCorrect: boolean }[];
      },
      qIndex: number,
    ) => {
      const questionNum = qIndex + 1;
      placeholderMap[`ms_question_${questionNum}`] = q.question;
      q.options.forEach(
        (option: { text: string; isCorrect: boolean }, aIndex: number) => {
          if (aIndex < 3) {
            const marker = option.isCorrect ? "✓ " : "";
            const answerNum = aIndex + 1;
            placeholderMap[`ms_question_${questionNum}_answer_${answerNum}`] =
              `${option.text} ${marker}`;
          }
        },
      );
    },
  );

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

  return [
    { type: "title", text: `${title}` },
    { type: "placeholders", map: placeholderMap },
  ];
};

export const transformDataStarterQuiz =
  () =>
  (data: StarterQuizData): Promise<TransformResult> => {
    const transformedData = transformQuizData(data, "Starter");
    return Promise.resolve(transformedData);
  };

export const transformDataExitQuiz =
  () =>
  (data: ExitQuizData): Promise<TransformResult> => {
    const transformedData = transformQuizData(data, "Exit");
    return Promise.resolve(transformedData);
  };
