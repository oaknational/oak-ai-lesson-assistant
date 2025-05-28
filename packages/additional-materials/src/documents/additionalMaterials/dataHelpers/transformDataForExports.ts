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

export const transformDataGlossary =
  <InputData, TemplateData>() =>
  (data: InputData): Promise<TemplateData> => {
    const parsedData = glossarySchema.parse(data);
    const { glossary, lessonTitle } = parsedData;

    // Create a simple placeholder map like all other document types
    const placeholderMap: Record<string, string> = {
      title: lessonTitle,
    };

    // Add glossary terms as numbered placeholders
    glossary.forEach((term, index) => {
      const termNum = index + 1;
      placeholderMap[`term_${termNum}`] = `${term.term}:`;
      placeholderMap[`definition_${termNum}`] = term.definition;
    });

    const transformedData = [
      { type: "title", text: lessonTitle },
      { type: "placeholders", map: placeholderMap },
    ];

    return Promise.resolve(transformedData) as Promise<TemplateData>;
  };

export const transformDataComprehension =
  <InputData, TemplateData>() =>
  (data: InputData): Promise<TemplateData> => {
    const parsedData = comprehensionTaskSchema.parse(data);
    const { comprehension } = parsedData;

    // Extract the questions and answers
    const questions = comprehension.questions || [];

    // Generate question and answer mappings programmatically
    const placeholderMap: Record<string, string> = {
      // Title and main content
      title: comprehension.lessonTitle,
      comprehension_text: comprehension.text,

      // Questions 1-10
      ...Object.fromEntries([
        ...Array.from({ length: 10 }, (_, i): [string, string] => [
          `question_${i + 1}`,
          (questions[i]?.questionText as string) || "",
        ]),
        // Answers 1-10
        ...Array.from({ length: 10 }, (_, i): [string, string] => [
          `question_${i + 1}_answer`,
          (questions[i]?.answer as string) || "",
        ]),
      ]),
    };

    // Transform into the expected format
    const transformedData = [
      { type: "title", text: comprehension.lessonTitle },
      { type: "placeholders", map: placeholderMap },
    ];

    return Promise.resolve(transformedData) as Promise<TemplateData>;
  };

export const transformDataStarterQuiz =
  <InputData, TemplateData>() =>
  (data: InputData): Promise<TemplateData> => {
    const parsedData = starterQuizSchema.parse(data);
    const { title, questions } = parsedData;

    // Define quiz template placeholder names
    const quizPlaceholders = ["title"];

    // Create a direct mapping from our data to the placeholder names
    const placeholderMap: Record<string, string> = {
      // Just map the title for now
      title: `Starter Quiz: ${title}`,
    };

    // Fill any remaining template placeholders with empty values
    quizPlaceholders.forEach((placeholder) => {
      if (!(placeholder in placeholderMap)) {
        placeholderMap[placeholder] = "";
      }
    });

    const transformedData = [
      { type: "title", text: `Starter Quiz: ${title}` },
      { type: "placeholders", map: placeholderMap },
    ];

    return Promise.resolve(transformedData) as Promise<TemplateData>;
  };

export const transformDataExitQuiz =
  <InputData, TemplateData>() =>
  (data: InputData): Promise<TemplateData> => {
    const parsedData = exitQuizSchema.parse(data);
    const { title, questions } = parsedData;

    // Define quiz template placeholder names
    const quizPlaceholders = [
      "title",
      "question_1",
      "question_1_answer_1",
      "question_1_answer_2",
      "question_1_answer_3",
      "question_2",
      "question_2_answer_1",
      "question_2_answer_2",
      "question_2_answer_3",
      "question_3",
      "question_3_answer_1",
      "question_3_answer_2",
      "question_3_answer_3",
      "question_4",
      "question_4_answer_1",
      "question_4_answer_2",
      "question_4_answer_3",
      "question_5",
      "question_5_answer_1",
      "question_5_answer_2",
      "question_5_answer_3",
      "question_6",
      "question_6_answer_1",
      "question_6_answer_2",
      "question_6_answer_3",
      "question_7",
      "question_7_answer_1",
      "question_7_answer_2",
      "question_7_answer_3",
      "question_8",
      "question_8_answer_1",
      "question_8_answer_2",
      "question_8_answer_3",
      "question_9",
      "question_9_answer_1",
      "question_9_answer_2",
      "question_9_answer_3",
      "question_10",
      "question_10_answer_1",
      "question_10_answer_2",
      "question_10_answer_3",
    ];

    // Create a direct mapping from our data to the placeholder names
    const placeholderMap: Record<string, string> = {
      // Title
      title: `Exit Quiz: ${title}`,
    };

    // Map individual questions and answers
    questions.slice(0, 10).forEach((q, qIndex) => {
      const questionNum = qIndex + 1;
      // Add the question
      placeholderMap[`question_${questionNum}`] = q.question;

      // Add each answer
      q.options.forEach((option, aIndex) => {
        if (aIndex < 3) {
          // Only handle up to 3 answers
          const answerNum = aIndex + 1;
          const marker = option.isCorrect ? "✓ " : "";
          placeholderMap[`question_${questionNum}_answer_${answerNum}`] =
            `${marker}${option.text}`;
        }
      });
    });

    // Fill any remaining template placeholders with empty values
    quizPlaceholders.forEach((placeholder) => {
      if (!(placeholder in placeholderMap)) {
        placeholderMap[placeholder] = "";
      }
    });

    const transformedData = [
      { type: "title", text: `Exit Quiz: ${title}` },
      { type: "placeholders", map: placeholderMap },
    ];

    return Promise.resolve(transformedData) as Promise<TemplateData>;
  };
