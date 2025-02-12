import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import type { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ParsedChatCompletion } from "openai/resources/beta/chat/completions.mjs";
// import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { z } from "zod";

import type {
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../protocol/schema";
// import type { SystemPrompt } from "./QuestionAssesmentPrompt";
import {
  keyLearningPointsPrompt,
  priorKnowledgePrompt,
  QuestionInspectionSystemPrompt,
  QuizInspectionSystemPrompt,
} from "./QuestionAssesmentPrompt";
import { starterQuizQuestionSuitabilityDescriptionSchema } from "./rerankers/RerankerStructuredOutputSchema";

const ThoughtStep = z.object({
  step: z.number(),
  thought: z.string(),
});

const OutputSchema = z.object({
  input: z.string(),
  chainOfThought: z.array(ThoughtStep),
  finalRanking: z.number().int().min(1).max(10),
  conclusion: z.string(),
});

type LLMOutput = z.infer<typeof OutputSchema>;
// TODO Change implementation to openai Provider
type sectionCategory = "priorKnowledge" | "keyLearningPoints";

type ChatContent =
  | OpenAI.Chat.Completions.ChatCompletionContentPartText
  | OpenAI.Chat.Completions.ChatCompletionContentPartImage;

// type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

type ChatMessage =
  | OpenAI.Chat.Completions.ChatCompletionSystemMessageParam
  | OpenAI.Chat.Completions.ChatCompletionUserMessageParam;

export class OpenAIRanker {
  public async rankQuestion(
    lessonPlan: LooseLessonPlan,
    question: QuizQuestion,
  ): Promise<number> {
    return 0;
  }

  private stuffLessonPlanIntoPrompt(lessonPlan: LooseLessonPlan): string {
    return "prompt";
  }

  private transformQuestionSchemaToOpenAIPayload(
    QuizQuestion: QuizQuestion,
  ): string {
    return "input";
  }
}

function processStringWithImages(text: string): ChatContent[] {
  const parts = text.split(/(\!\[.*?\]\(.*?\))/);
  return parts
    .map((part): ChatContent | null => {
      if (part.startsWith("![")) {
        const imageUrl = part.match(/\((.*?)\)/)?.[1];
        return imageUrl
          ? { type: "image_url" as const, image_url: { url: imageUrl } }
          : null;
      } else if (part.trim()) {
        return { type: "text" as const, text: part.trim() };
      }
      return null;
    })
    .filter((part): part is ChatContent => part !== null);
}

function quizToLLMMessages(quizQuestion: QuizQuestion): ChatMessage {
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

function lessonPlanSectionToMessage(
  lessonPlan: LooseLessonPlan,
  lessonPlanSectionName: sectionCategory,
): ChatContent {
  let promptprefix = "";
  if (lessonPlanSectionName === "priorKnowledge") {
    promptprefix = priorKnowledgePrompt;
  } else if (lessonPlanSectionName === "keyLearningPoints") {
    promptprefix = keyLearningPointsPrompt;
  } else {
    throw new Error("Invalid sectionCategory");
  }

  const lessonPlanSection = lessonPlan[lessonPlanSectionName] ?? [];
  const sectionContent = lessonPlanSection.join("\n");
  const outputContent = `${promptprefix}\n${sectionContent}`;
  return { type: "text" as const, text: outputContent };
}

function contentListToUser(messages: ChatContent[]): ChatMessage {
  return { role: "user" as const, content: messages };
}

function combinePrompts(
  lessonPlan: LooseLessonPlan,
  question: QuizQuestion,
): ChatMessage[] {
  const Messages: ChatMessage[] = [];
  const Content: ChatContent[] = [];

  Messages.push(QuestionInspectionSystemPrompt);

  Content.push(lessonPlanSectionToMessage(lessonPlan, "priorKnowledge"));
  const questionMessage = quizToLLMMessages(question);
  if (Array.isArray(questionMessage.content)) {
    Content.push(...questionMessage.content);
  }
  Messages.push(contentListToUser(Content));
  //   Messages.push(lessonPlanSectionToMessage(lessonPlan, "priorKnowledge"));
  //   Messages.push(quizToLLMMessages(question));
  return Messages;
}

/**
 * Converts an array of quiz questions into a formatted array of prompts for OpenAI
 *
 * @param {QuizQuestion[]} questions - An array of QuizQuestion objects to be converted.
 * @returns {any[]} An array of formatted content objects ready for use with a language model.
 */
function quizQuestionsToOpenAIMessageFormat(
  questions: QuizQuestion[],
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
 * Combines a lesson plan, quiz questions, and a system prompt into a formatted array of prompts for OpenAI Reranking. Interleaves the quiz questions with messages annotating which lesson it is. Dynamically adds the correct system prompt for the quiz type, with a system prompt section for either the prior knowledge or key learning points.
 * @param {LooseLessonPlan} lessonPlan - The lesson plan to be used in the prompts.
 * @param {QuizQuestion[]} questions - An array of QuizQuestion objects to be converted.
 * @param {SystemPrompt} systemPrompt - The system prompt to be used in the prompts.
 * @param {sectionCategory} lessonPlanSectionForConsideration - The section of the lesson plan to be considered in the prompts.
 * @returns {any[]} An array of formatted content objects ready for use with a language model.
 */
function combinePromptsAndQuestions(
  lessonPlan: LooseLessonPlan,
  questions: QuizQuestion[],
  systemPrompt: OpenAI.Chat.Completions.ChatCompletionSystemMessageParam,
  lessonPlanSectionForConsideration: sectionCategory,
): ChatMessage[] {
  const Messages: ChatMessage[] = [];
  const Content: ChatContent[] = [];

  Messages.push(systemPrompt);

  Content.push(
    lessonPlanSectionToMessage(lessonPlan, lessonPlanSectionForConsideration),
  );
  const questionMessage = quizQuestionsToOpenAIMessageFormat(questions);
  if (Array.isArray(questionMessage.content)) {
    Content.push(...questionMessage.content);
  }
  Messages.push(contentListToUser(Content));
  return Messages;
}

/**
 * Evaluates a starter quiz by combining lesson plan information, quiz questions, and a system prompt,
 * then sends this combined information to an OpenAI model for analysis.
 *
 * @async
 * @function
 * @param {LooseLessonPlan} lessonPlan - The lesson plan object containing information about the lesson.
 * @param {QuizQuestion[]} questions - An array of quiz questions to be evaluated.
 * @param {number} [max_tokens=1500] - The maximum number of tokens to be used in the OpenAI API call. Defaults to 1500.
 *
 * @returns {Promise<OpenAI.Chat.Completions.ChatCompletion>} A promise that resolves to the OpenAI chat completion response.
 */
async function evaluateStarterQuiz(
  lessonPlan: LooseLessonPlan,
  questions: QuizQuestion[],
  max_tokens: number = 1500,
  ranking_schema: z.ZodType<any> = starterQuizQuestionSuitabilityDescriptionSchema,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const openAIMessage = combinePromptsAndQuestions(
    lessonPlan,
    questions,
    QuizInspectionSystemPrompt,
    "priorKnowledge",
  );
  // TODO: Change remove zodtype any - make specific type.
  console.log("openAIMessage", JSON.stringify(openAIMessage));
  const response = await OpenAICallRerankerWithSchema(
    openAIMessage,
    max_tokens,
    ranking_schema,
  );
  return response;
}

/**
 * Evaluates a quiz by combining lesson plan information, quiz questions, and a system prompt,
 * then sends this combined information to an OpenAI model for analysis. Generic version of evaluateStarterQuiz
 *
 * @async
 * @function
 * @param {LooseLessonPlan} lessonPlan - The lesson plan object containing information about the lesson.
 * @param {QuizQuestion[]} questions - An array of quiz questions to be evaluated.
 * @param {number} [max_tokens=1500] - The maximum number of tokens to be used in the OpenAI API call. Defaults to 1500.
 * @param {z.ZodType<any>} [ranking_schema=starterQuizQuestionSuitabilityDescriptionSchema] - The schema to be used for parsing the response. Defaults to the starter quiz question suitability description schema.
 * @returns {Promise<OpenAI.Chat.Completions.ChatCompletion>} A promise that resolves to the OpenAI chat completion response.
 */
async function evaluateQuiz(
  lessonPlan: LooseLessonPlan,
  questions: QuizQuestion[],
  max_tokens: number = 1500,
  ranking_schema: z.ZodType<any>,
  quizType: QuizPath,
): Promise<ParsedChatCompletion<any>> {
  // TODO: change this to use the correct system prompt for the quiz type.
  // TODO: change this to use the correct lesson plan section for the quiz type.

  // if starter quiz, use prior knowledge, if exit quiz use key learning points.
  // TODO: abstract this to a more generic function for including other parts of the quiz.
  const lessonSectionSelection: sectionCategory =
    quizType === "/starterQuiz" ? "priorKnowledge" : "keyLearningPoints";

  const openAIMessage = combinePromptsAndQuestions(
    lessonPlan,
    questions,
    QuizInspectionSystemPrompt,
    lessonSectionSelection,
  );

  const response = await OpenAICallRerankerWithSchema(
    openAIMessage,
    max_tokens,
    ranking_schema,
  );
  return response;
}

export { evaluateQuiz };

export {
  combinePrompts,
  combinePromptsAndQuestions,
  evaluateStarterQuiz,
  quizQuestionsToOpenAIMessageFormat,
  quizToLLMMessages,
};

export function parsedResponse(schema: z.ZodType<any>, response: any) {
  const math_reasoning = response.choices[0].message;

  // If the model refuses to respond, you will get a refusal message
  if (math_reasoning.refusal) {
    console.log(math_reasoning.refusal);
  } else {
    console.log(math_reasoning.parsed);
  }

  const content = response.choices[0]?.message.content;

  if (schema && content) {
    try {
      const parsedContent = JSON.parse(content);
      return schema.parse(parsedContent);
    } catch (error) {
      console.error("Failed to parse or validate response:", error);
      throw new Error("Invalid response format");
    }
  }

  return content;
}

export async function OpenAICallReranker(
  messages: any[],
  max_tokens: number = 500,
  schema?: z.ZodType<any>,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const userId = "test-user-id";
  const chatId = "test-chat-id";
  const openai = createOpenAIClient({ app: "maths-reranker" });
  const startTime = Date.now();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    max_tokens,
    messages,
    // response_format: schema ? { type: "json_object" } : undefined,
    // response_format: schema ?? undefined,
  });

  const endTime = Date.now();
  const durationInSeconds = (endTime - startTime) / 1000;
  console.log(`OpenAI API call took ${durationInSeconds.toFixed(2)} seconds`);

  //   const content = response.choices[0]?.message.content;

  return response;
}

// TODO: type logit_bias properly.
export async function OpenAICallLogProbs(
  messages: any[],
  max_tokens: number = 500,
  logit_bias: Record<number, number>,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  // This allows us to treat the OpenAI API as a bodged cross encoder.
  // Returns the log probabilities of the tokens in the response.
  const userId = "test-user-id";
  const chatId = "test-chat-id";
  const openai = createOpenAIClient({ app: "maths-reranker" });
  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    max_tokens,
    messages,
    logit_bias,
    logprobs: true,
    top_logprobs: Object.keys(logit_bias).length,
  });
  const endTime = Date.now();
  const durationInSeconds = (endTime - startTime) / 1000;
  console.log(
    `OpenAI API log_probs call took ${durationInSeconds.toFixed(2)} seconds`,
  );
  return response;
}

export async function OpenAICallCrossEncoder(
  reranking_prompt: OpenAI.Chat.Completions.ChatCompletionSystemMessageParam,
  reranking_messages: any[],
  bias_constant: number = 100,
) {
  const max_tokens = 1;
  // Quick bodge so we can escape with max tokens = 1.
  const n_messages = reranking_messages.length;
  if (n_messages >= 10) {
    throw new Error("The number of reranking messages cannot be 10 or more.");
  }
  // Its annoyingly hard to import the tokenizer from openai.
  // TODO: fix this.
  const tokenizedNumbers0Through9: number[] = [
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  ];
  const logit_bias: Record<number, number> = {};
  for (let i = 0; i < tokenizedNumbers0Through9.length; i++) {
    const token = tokenizedNumbers0Through9[i];
    if (token !== undefined) {
      logit_bias[token] = bias_constant;
    }
  }
  // TODO: add method of combining reranking_messages with an ordering function and reranking prompt.
  const response = await OpenAICallLogProbs(
    [reranking_prompt, ...reranking_messages],
    max_tokens,
    logit_bias,
  );
  return response;
}

export async function OpenAICallRerankerWithSchema(
  messages: any[],
  max_tokens: number = 500,
  schema: z.ZodType<any>,
): Promise<ParsedChatCompletion<any>> {
  const userId = "test-user-id";
  const chatId = "test-chat-id";
  const openai = createOpenAIClient({ app: "maths-reranker" });
  const startTime = Date.now();
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    max_tokens,
    messages,
    response_format: zodResponseFormat(schema, "QuizRatingResponse"),
  });
  return response;
}

export async function DummyOpenAICall() {
  const userId = "test-user-id";
  const chatId = "test-chat-id";
  const openai = createOpenAIClient({ app: "maths-reranker" });

  const Messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "What are in these images? Is there any difference between them?",
        },
        {
          type: "image_url",
          image_url: {
            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
            detail: "high",
          },
        },
        {
          type: "image_url",
          image_url: {
            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
            detail: "high",
          },
        },
      ],
    },
  ];
  //  This adds an id to each message.
  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What are in these images? Is there any difference between them?",
          },
          {
            type: "image_url",
            image_url: {
              url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
              detail: "high",
            },
          },
          {
            type: "image_url",
            image_url: {
              url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
              detail: "high",
            },
          },
        ],
      },
    ],
  });
  console.log("Image description received:", response);
  console.log("Image description received:", response.choices[0]);

  return response.choices[0]?.message.content;
}
