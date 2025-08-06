import { docs_v1 } from "@googleapis/docs";
import { aiLogger } from "@oakai/logger";
import { getQuestionTemplate, generateInsertRequests } from "./templateStructures";

const log = aiLogger("exports");

export interface QuestionData {
  question: string;
  type: "multiple-choice" | "order" | "match" | "short-answer";
  answers?: string[];
  items?: string[]; // for order questions
  pairs?: Array<{ left: string; right: string }>; // for match questions
}

export interface QuestionHandler {
  extractAndPrepareContent(
    questionData: QuestionData,
    insertIndex: number,
    questionNumber: number
  ): docs_v1.Schema$Request[];
}

// Removed unused functions - now using template-based approach

const multipleChoiceHandler: QuestionHandler = {
  extractAndPrepareContent(questionData, insertIndex, questionNumber) {
    const template = getQuestionTemplate("multiple-choice");
    if (!template) {
      log.error("Multiple choice template not found");
      return [];
    }
    
    const replacements: Record<string, string> = {
      "{{questionNumber}}": `${questionNumber}`,
      "{{question}}": questionData.question,
      "{{answer_a}}": questionData.answers?.[0] || "",
      "{{answer_b}}": questionData.answers?.[1] || "",
      "{{answer_c}}": questionData.answers?.[2] || "",
    };
    
    return generateInsertRequests(template, replacements, insertIndex);
  }
};

const orderHandler: QuestionHandler = {
  extractAndPrepareContent(questionData, insertIndex, questionNumber) {
    const template = getQuestionTemplate("order");
    if (!template) {
      log.error("Order template not found");
      return [];
    }
    
    const replacements: Record<string, string> = {
      "{{questionNumber}}": `${questionNumber}`,
      "{{question}}": questionData.question,
    };
    
    questionData.items?.forEach((item, index) => {
      replacements[`{{item_${index + 1}}}`] = item;
    });
    
    return generateInsertRequests(template, replacements, insertIndex);
  }
};

const matchHandler: QuestionHandler = {
  extractAndPrepareContent(questionData, insertIndex, questionNumber) {
    const template = getQuestionTemplate("match");
    if (!template) {
      log.error("Match template not found");
      return [];
    }
    
    const replacements: Record<string, string> = {
      "{{questionNumber}}": `${questionNumber}`,
      "{{question}}": questionData.question,
    };
    
    questionData.pairs?.forEach((pair, index) => {
      replacements[`{{left_${index + 1}}}`] = pair.left;
      replacements[`{{right_${index + 1}}}`] = pair.right;
    });
    
    return generateInsertRequests(template, replacements, insertIndex);
  }
};

const shortAnswerHandler: QuestionHandler = {
  extractAndPrepareContent(questionData, insertIndex, questionNumber) {
    const template = getQuestionTemplate("short-answer");
    if (!template) {
      log.error("Short answer template not found");
      return [];
    }
    
    const replacements: Record<string, string> = {
      "{{questionNumber}}": `${questionNumber}`,
      "{{question}}": questionData.question,
    };
    
    return generateInsertRequests(template, replacements, insertIndex);
  }
};

export const questionHandlers: Record<QuestionData["type"], QuestionHandler> = {
  "multiple-choice": multipleChoiceHandler,
  "order": orderHandler,
  "match": matchHandler,
  "short-answer": shortAnswerHandler,
};

export function getQuestionHandler(type: QuestionData["type"]): QuestionHandler {
  const handler = questionHandlers[type];
  if (!handler) {
    throw new Error(`No handler found for question type: ${type}`);
  }
  return handler;
}