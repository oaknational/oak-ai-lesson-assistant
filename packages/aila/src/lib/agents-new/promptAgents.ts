import type OpenAI from "openai";
import { z } from "zod";

import {
  AdditionalMaterialsSchema,
  CycleSchema,
  KeyLearningPointsSchema,
  KeywordsSchema,
  LearningCyclesSchema,
  LearningOutcomeSchema,
  LessonTitleSchema,
  MisconceptionsSchema,
  PriorKnowledgeSchema,
  QuizV2Schema,
  SubjectSchema,
} from "../../protocol/schema";
import {
  AGENT_IDS,
  type AgentDefinition,
  type AgentRegistry,
  type AilaState,
} from "./agentRegistry";
import { callLLM } from "./callLLM";
import { messageToUserInstructions, routerInstructions } from "./prompts";
import { additionalMaterialsInstructions } from "./prompts/additionalMaterialsInstructions";
import { exitQuizInstructions } from "./prompts/exitQuizInstructions";
import { keyLearningPointsInstructions } from "./prompts/keyLearningPointsInstructions";
import { keywordsInstructions } from "./prompts/keywordsInstructions";
import { learningCyclesInstructions } from "./prompts/learningCyclesInstructions";
import { learningOutcomeInstructions } from "./prompts/learningOutcomeInstructions";
import { misconceptionsInstructions } from "./prompts/misconceptionsInstructions";
import { priorKnowledgeInstructions } from "./prompts/priorKnowledgeInstructions";
import { starterQuizInstructions } from "./prompts/starterQuizInstructions";
import { subjectInstructions } from "./prompts/subjectInstructions";
import { titleInstructions } from "./prompts/titleInstructions";

const sectionKeysSchema = z.union([
  z.literal("title"),
  z.literal("keyStage"),
  z.literal("subject"),
  z.literal("topic"),
  z.literal("basedOn"),
  z.literal("learningOutcome"),
  z.literal("learningCycles"),
  z.literal("priorKnowledge"),
  z.literal("keyLearningPoints"),
  z.literal("misconceptions"),
  z.literal("keywords"),
  z.literal("starterQuiz"),
  z.literal("cycle1"),
  z.literal("cycle2"),
  z.literal("cycle3"),
  z.literal("exitQuiz"),
  z.literal("additionalMaterials"),
]);

export type SectionKey = z.infer<typeof sectionKeysSchema>;
export function getPromptAgents({ openAIClient }: { openAIClient: OpenAI }) {
  const agents: AgentRegistry = {
    title: createPromptAgent({
      id: "title",
      description: "Generates a title for the lesson plan",
      responseSchema: LessonTitleSchema,
      instructions: titleInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            title: output,
          },
        };
      },
    }),
    subject: createPromptAgent({
      id: "subject",
      description: "Determines the subject for the lesson plan",
      responseSchema: SubjectSchema,
      instructions: subjectInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            subject: output,
          },
        };
      },
    }),
    learningOutcome: createPromptAgent({
      id: "learningOutcome",
      description: "Generates the learning outcome for the lesson",
      responseSchema: LearningOutcomeSchema,
      instructions: learningOutcomeInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            learningOutcome: output,
          },
        };
      },
    }),
    learningCycles: createPromptAgent({
      id: "learningCycles",
      description: "Generates learning cycle titles for the lesson",
      responseSchema: LearningCyclesSchema,
      instructions: learningCyclesInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            learningCycles: output,
          },
        };
      },
    }),
    priorKnowledge: createPromptAgent({
      id: "priorKnowledge",
      description: "Generates prior knowledge statements for the lesson",
      responseSchema: PriorKnowledgeSchema,
      instructions: priorKnowledgeInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            priorKnowledge: output,
          },
        };
      },
    }),
    keyLearningPoints: createPromptAgent({
      id: "keyLearningPoints",
      description: "Generates key learning points for the lesson",
      responseSchema: KeyLearningPointsSchema,
      instructions: keyLearningPointsInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            keyLearningPoints: output,
          },
        };
      },
    }),
    misconceptions: createPromptAgent({
      id: "misconceptions",
      description: "Generates common misconceptions for the lesson topic",
      responseSchema: MisconceptionsSchema,
      instructions: misconceptionsInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            misconceptions: output,
          },
        };
      },
    }),
    keywords: createPromptAgent({
      id: "keywords",
      description: "Generates keywords and definitions for the lesson",
      responseSchema: KeywordsSchema,
      instructions: keywordsInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            keywords: output,
          },
        };
      },
    }),
    starterQuiz: createPromptAgent({
      id: "starterQuiz",
      description: "Generates the starter quiz for the lesson",
      responseSchema: QuizV2Schema,
      instructions: starterQuizInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            starterQuiz: output,
          },
        };
      },
    }),
    cycle1: createPromptAgent({
      id: "cycle1",
      description: "Generates the first learning cycle content",
      responseSchema: CycleSchema,
      instructions: learningCyclesInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            cycle1: output,
          },
        };
      },
    }),
    cycle2: createPromptAgent({
      id: "cycle2",
      description: "Generates the second learning cycle content",
      responseSchema: CycleSchema,
      instructions: learningCyclesInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            cycle2: output,
          },
        };
      },
    }),
    cycle3: createPromptAgent({
      id: "cycle3",
      description: "Generates the third learning cycle content",
      responseSchema: CycleSchema,
      instructions: learningCyclesInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            cycle3: output,
          },
        };
      },
    }),
    exitQuiz: createPromptAgent({
      id: "exitQuiz",
      description: "Generates the exit quiz for the lesson",
      responseSchema: QuizV2Schema,
      instructions: exitQuizInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            exitQuiz: output,
          },
        };
      },
    }),
    additionalMaterials: createPromptAgent({
      id: "additionalMaterials",
      description: "Generates additional materials for the lesson",
      responseSchema: AdditionalMaterialsSchema,
      instructions: additionalMaterialsInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            additionalMaterials: output,
          },
        };
      },
    }),
    messageToUser: createPromptAgent({
      id: "messageToUser",
      description: "Sends a message to the user with the current state",
      responseSchema: z.object({
        message: z.string().describe("Message to the user"),
      }),
      instructions: messageToUserInstructions,
      mergeFunction: (state, output) => {
        return {
          ...state,
          messages: [
            ...state.messages,
            { role: "assistant", content: output.message },
          ],
        };
      },
      openAIClient,
    }),
    deleteSection: {
      id: "deleteSection",
      description: "Deletes a section from the lesson plan",
      handler: (state, args) => {
        return Promise.resolve({
          ...state,
          doc: {
            ...state.doc,
            [args.sectionKey]: undefined,
          },
        });
      },
    },
  };

  return agents;
}

export function getRoutingAgent({
  openAIClient,
}: {
  openAIClient: OpenAI;
}): AgentDefinition<AilaState, "router"> {
  return createPromptAgent({
    id: "router",
    description:
      "Routes messages to the appropriate agents based on user input",
    responseSchema: z.object({
      plan: z.array(
        z.union([
          z.object({
            agentId: z.literal("deleteSection"),
            args: z.object({
              sectionKey: sectionKeysSchema,
            }),
          }),
          z.object({
            agentId: z.enum(
              AGENT_IDS.filter((id) => id !== "deleteSection") as [
                string,
                ...string[],
              ],
            ),
          }),
        ]),
      ),
      error: z.string().nullable(),
    }), // This agent does not return a specific schema
    instructions: routerInstructions,
    openAIClient,
    mergeFunction: (state) => state,
  });
}

function createPromptAgent<OutputType, TId extends string>(props: {
  id: TId;
  description: string;
  responseSchema: z.ZodType<OutputType>;
  instructions: string; // these are the instructions that do not change between sessions or interactions
  // contextFromState: (state: AilaState) => string; // this is anything that could change, current doc state, relevant messages, relevant lesson content, retry error context
  openAIClient: OpenAI;
  mergeFunction: (state: AilaState, response: OutputType) => AilaState;
}): AgentDefinition<AilaState, TId> {
  const {
    id,
    description,
    openAIClient,
    responseSchema,
    instructions,
    mergeFunction,
  } = props;

  return {
    id,
    description,
    handler: async (state) => {
      const res = await callLLM({
        systemPrompt: decorateInstructionsWithRole({ instructions }),
        userPrompt: contextFromState(state),
        responseSchema,
        openAIClient,
        model: "gpt-4o",
      });

      if (res.error !== null) {
        return { ...state, error: res.error };
      }

      return mergeFunction(state, res.data);
    },
  };
}

function contextFromState(state: AilaState): string {
  return `## Current lesson plan
${JSON.stringify(state.doc)}

## Relevant messages
${state.messages.map((m) => `- ${m.role}: ${m.content}`).join("\n")}
`;
}

function decorateInstructionsWithRole({
  instructions,
}: {
  instructions: string;
}): string {
  return `${instructions}`;
}
