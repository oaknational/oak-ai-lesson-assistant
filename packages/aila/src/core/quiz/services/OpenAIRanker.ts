import { createOpenAIClient } from "@oakai/core/src/llm/openai";

import type { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ParsedChatCompletion } from "openai/resources/beta/chat/completions.mjs";
import { z } from "zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import { constrainImageUrl } from "../../../protocol/schemas/quiz/conversion/cloudinaryImageHelper";
import { QuizInspectionSystemPrompt } from "../QuestionAssesmentPrompt";
import type { QuizQuestionWithRawJson, RatingResponse } from "../interfaces";
import { unpackLessonPlanForPrompt } from "../unpackLessonPlan";

// OpenAI model constant
// const OPENAI_MODEL = "gpt-4o-2024-08-06";
const OPENAI_MODEL: string = "o4-mini";

const IS_REASONING_MODEL = OPENAI_MODEL === "o3" || OPENAI_MODEL === "o4-mini";

// Zod schema for AI evaluator rating responses
export const ratingResponseSchema = z.object({
  justification: z
    .string()
    .describe("The chain of thought that led to the rating"),
  rating: z
    .number()
    .describe(
      "The rating for the given criteria and response taking the chain of thought into account. The rating is a float between 0 and 1.",
    ),
}) satisfies z.ZodType<RatingResponse>;

type ChatContent = OpenAI.Chat.Completions.ChatCompletionContentPart;

export type ChatMessage =
  | OpenAI.Chat.Completions.ChatCompletionSystemMessageParam
  | OpenAI.Chat.Completions.ChatCompletionUserMessageParam;

function processStringWithImages(text: string): ChatContent[] {
  // Split by markdown image patterns: ![alt](url) - secure regex prevents ReDoS
  const parts = text.split(/(!\[[^\]]*\]\([^)]*\))/);
  return parts
    .map((part): ChatContent | null => {
      if (part.startsWith("![")) {
        // Extract URL from markdown image: ![alt](url)
        // Use bounded quantifier to prevent ReDoS vulnerability
        const extractedImageUrl = part.match(/\(([^)]{0,2000})\)/)?.[1];
        if (!extractedImageUrl) {
          return null;
        }

        const imageUrl = constrainImageUrl(extractedImageUrl);
        return {
          type: "image_url" as const,
          image_url: { url: imageUrl },
        };
      } else if (part.trim()) {
        return { type: "text" as const, text: part.trim() };
      }
      return null;
    })
    .filter((part): part is ChatContent => part !== null);
}

function quizToLLMMessages(quizQuestion: QuizQuestionWithRawJson): ChatMessage {
  const content: ChatContent[] = [];

  // Process question
  content.push(...processStringWithImages(quizQuestion.question));

  // Process answers
  content.push({ type: "text" as const, text: "\n\nCorrect answer(s):" });
  quizQuestion.answers.forEach((answer, index) => {
    content.push({ type: "text" as const, text: `${index + 1}: ` });
    content.push(...processStringWithImages(answer));
    content.push({ type: "text" as const, text: "\n" });
  });

  // Process distractors
  content.push({ type: "text" as const, text: "\n\nDistractors:" });
  quizQuestion.distractors.forEach((distractor, index) => {
    content.push({ type: "text" as const, text: `${index + 1}: ` });
    content.push(...processStringWithImages(distractor));
    content.push({ type: "text" as const, text: "\n" });
  });

  return { role: "user" as const, content };
}

function contentListToUser(messages: ChatContent[]): ChatMessage {
  return { role: "user" as const, content: messages };
}

/**
 * Converts an array of quiz questions into a formatted message for OpenAI
 *
 * @param {QuizQuestion[]} questions - An array of QuizQuestion objects to be converted.
 * @returns {ChatMessage} A formatted ChatMessage object ready for use with OpenAI API.
 */
function quizQuestionsToOpenAIMessageFormat(
  questions: QuizQuestionWithRawJson[],
): ChatMessage {
  const content: ChatContent[] = [];
  const promptList = questions.map((question) => quizToLLMMessages(question));
  promptList.forEach((prompt, index) => {
    content.push({ type: "text" as const, text: `# Question ${index + 1}:\n` });
    if (Array.isArray(prompt.content)) {
      content.push(...prompt.content);
    }
  });
  return { role: "user" as const, content };
}

/**
 * Combines a lesson plan, quiz questions, and a system prompt into a formatted array of messages for OpenAI.
 * Formats the prompt for reasoning models with unpacked lesson plan and quiz type-specific instructions.
 *
 * @param {PartialLessonPlan} lessonPlan - The lesson plan to be used in the prompts.
 * @param {QuizQuestion[]} questions - An array of QuizQuestion objects to be converted.
 * @param {OpenAI.Chat.Completions.ChatCompletionSystemMessageParam} systemPrompt - The system prompt to be used.
 * @param {QuizPath} quizType - The type of quiz ("/starterQuiz" or "/exitQuiz").
 * @returns {ChatMessage[]} An array of formatted messages ready for use with OpenAI API.
 */
function combinePromptsAndQuestions(
  lessonPlan: PartialLessonPlan,
  questions: QuizQuestionWithRawJson[],
  systemPrompt: OpenAI.Chat.Completions.ChatCompletionSystemMessageParam,
  quizType: QuizPath,
): ChatMessage[] {
  const lessonPlanUnpacked: string = unpackLessonPlanForPrompt(lessonPlan);
  const messages: ChatMessage[] = [];
  const content: ChatContent[] = [];

  messages.push(systemPrompt);

  content.push({
    type: "text" as const,
    text: `I want you to evaluate the quiz questions based on the lesson plan provided. Rate the quizzes based on their suitability for inclusion in the lesson plan. Consider best practice pedagogy, as you are part of a maths lesson plan generator for Oak National Academy, leaders in UK teaching.`,
  });

  if (quizType === "/starterQuiz") {
    content.push({
      type: "text" as const,
      text: `You are generating a starter quiz for a lesson plan. The purpose of the starter quiz is to assess the prior knowledge of the students, identify misconceptions, and reactivate prior knowledge. Please consider alignment with the "prior knowledge" section of the lesson plan.`,
    });
  } else if (quizType === "/exitQuiz") {
    content.push({
      type: "text" as const,
      text: `You are generating an exit quiz for a lesson plan. The purpose of the exit quiz is to assess the learning outcomes of the students, identify misconceptions, and consolidate the learning. Please consider alignment with the "key learning points" and "learning outcome" sections of the lesson plan.`,
    });
  }

  content.push({
    type: "text" as const,
    text: `The lesson plan is as follows: ${lessonPlanUnpacked}`,
  });
  const questionMessage = quizQuestionsToOpenAIMessageFormat(questions);
  if (Array.isArray(questionMessage.content)) {
    content.push(...questionMessage.content);
  }
  messages.push(contentListToUser(content));
  return messages;
}

/**
 * Evaluates a quiz by combining lesson plan information, quiz questions, and a system prompt,
 * then sends this combined information to an OpenAI reasoning model for analysis.
 *
 * @async
 * @function
 * @param {PartialLessonPlan} lessonPlan - The lesson plan object containing information about the lesson.
 * @param {QuizQuestion[]} questions - An array of quiz questions to be evaluated.
 * @param {number} [max_tokens=4000] - The maximum number of tokens to be used in the OpenAI API call.
 * @param {T} ranking_schema - The Zod schema to be used for parsing the response.
 * @param {QuizPath} quizType - The type of quiz being evaluated (determines which lesson plan section to use).
 * @returns {Promise<ParsedChatCompletion<z.infer<T>>>} A promise that resolves to the parsed OpenAI chat completion response.
 */
async function evaluateQuiz<T extends z.ZodType<RatingResponse>>(
  lessonPlan: PartialLessonPlan,
  questions: QuizQuestionWithRawJson[],
  max_tokens: number = 4000,
  ranking_schema: T,
  quizType: QuizPath,
): Promise<ParsedChatCompletion<z.infer<T>>> {
  const openAIMessage = combinePromptsAndQuestions(
    lessonPlan,
    questions,
    QuizInspectionSystemPrompt,
    quizType,
  );

  const response = await OpenAICallReranker(
    openAIMessage,
    max_tokens,
    ranking_schema,
  );
  return response;
}
export { evaluateQuiz };

export {
  combinePromptsAndQuestions,
  quizQuestionsToOpenAIMessageFormat,
  quizToLLMMessages,
};

/**
 * Makes an OpenAI API call for reranking with schema validation using the beta completions API.
 *
 * @async
 * @function
 * @param {ChatMessage[]} messages - The messages to send to the OpenAI API.
 * @param {number} [max_tokens=500] - The maximum number of tokens to generate.
 * @param {z.ZodType<RatingResponse>} schema - The Zod schema for response validation.
 * @returns {Promise<ParsedChatCompletion<z.infer<typeof schema>>>} A promise that resolves to the parsed OpenAI chat completion.
 */
export async function OpenAICallReranker(
  messages: ChatMessage[],
  max_tokens: number = 500,
  schema: z.ZodType<RatingResponse>,
): Promise<ParsedChatCompletion<z.infer<typeof schema>>> {
  const openai = createOpenAIClient({ app: "maths-reranker" });

  const response = await openai.beta.chat.completions.parse({
    model: OPENAI_MODEL,
    ...(IS_REASONING_MODEL
      ? { max_completion_tokens: max_tokens }
      : { max_tokens }),
    messages,
    response_format: zodResponseFormat(schema, "QuizRatingResponse"),
  });
  return response;
}
