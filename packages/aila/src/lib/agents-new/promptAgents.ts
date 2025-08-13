import { compare } from "fast-json-patch/index.mjs";
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
  directResponseSchema,
  errorSchema,
  refusalSchema,
} from "./agentRegistry";
import { basedOnInstructions } from "./agents/basedOn/basedOn.instructions";
import { subjectsByKeyStage } from "./agents/subject/subject.examples";
import { titleExamples } from "./agents/title/title.examples";
import { callLLM } from "./callLLM";
import { getStepsExecutedAsText } from "./getStepsExecutedAsText";
import { messageToUserInstructions, routerInstructions } from "./prompts";
import { additionalMaterialsInstructions } from "./prompts/additionalMaterialsInstructions";
import { exitQuizInstructions } from "./prompts/exitQuizInstructions";
import { keyLearningPointsInstructions } from "./prompts/keyLearningPointsInstructions";
import { keyStageInstructions } from "./prompts/keyStageInstructions";
import { keywordsInstructions } from "./prompts/keywordsInstructions";
import { learningCycleTitlesInstructions } from "./prompts/learningCycleTitlesInstructions";
import { learningCyclesInstructions } from "./prompts/learningCyclesInstructions";
import { learningOutcomeInstructions } from "./prompts/learningOutcomeInstructions";
import { misconceptionsInstructions } from "./prompts/misconceptionsInstructions";
import { priorKnowledgeInstructions } from "./prompts/priorKnowledgeInstructions";
import { starterQuizInstructions } from "./prompts/starterQuizInstructions";
import { subjectInstructions } from "./prompts/subjectInstructions";
import { titleInstructions } from "./prompts/titleInstructions";
import { stringListToText } from "./utils/stringListToText";

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
      additionalContextFromState: (state) => {
        return `## Example titles

${stringListToText(titleExamples[state.doc.subject ?? ""]?.[state.doc.keyStage ?? ""] ?? [])}`;
      },
    }),
    keyStage: createPromptAgent({
      id: "keyStage",
      description: "Determines the key stage for the lesson plan",
      responseSchema: z
        .enum(["early-years-foundation-stage", "ks1", "ks2", "ks3", "ks4"])
        .or(z.string())
        .describe("Key stage for the lesson plan"),
      instructions: keyStageInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            keyStage: output,
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
      additionalContextFromState: (state) => {
        return `## Example subjects

${state.doc.keyStage ? stringListToText(subjectsByKeyStage[state.doc.keyStage]) : stringListToText(Array.from(new Set(Object.values(subjectsByKeyStage).flat())))}`;
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
      instructions: learningCycleTitlesInstructions,
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
    fetchRelevantLessons: {
      id: "fetchRelevantLessons",
      description: "Fetches relevant lessons based on the current state.",
      handler: async (state) => {
        // This is a placeholder for the actual implementation
        // In a real application, this would query a database or API
        const relevantLessons = [
          {
            id: "ID-software-testing-techniques",
            title: "Software Testing Techniques",
            topic: "Testing methodologies and practices",
            cycle1: {
              title: "Identifying Software Testing Techniques",
              feedback:
                "Model answer: Black-box testing is matched with 'testing based on inputs and outputs', white-box with 'testing internal structures', manual with 'checking without tools', and automated with 'using software tools'.",
              practice:
                "Match the definitions to the correct testing technique: black-box, white-box, manual, or automated.",
              explanation: {
                slideText:
                  "Learn about black-box and white-box testing techniques and their roles in software testing.",
                imagePrompt: "black-box vs white-box testing diagram",
                spokenExplanation: [
                  "Explain the role of software testing in ensuring application quality.",
                  "Introduce black-box and white-box testing as key techniques.",
                  "Define black-box testing: focuses on inputs and outputs without knowledge of internal code.",
                  "Define white-box testing: involves testing internal structures of the application.",
                  "Discuss manual testing: manually checking the software for defects without tools.",
                  "Introduce automated testing: using software tools to execute tests automatically.",
                ],
                accompanyingSlideDetails:
                  "A diagram comparing black-box and white-box testing techniques.",
              },
              durationInMinutes: 15,
              checkForUnderstanding: [
                {
                  questionType: "multiple-choice" as const,
                  question: "What is black-box testing?",
                  answers: ["Testing based on inputs and outputs"],
                  distractors: [
                    "Testing internal structures",
                    "Testing with software tools",
                  ],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question: "What does white-box testing involve?",
                  answers: ["Testing internal structures"],
                  distractors: [
                    "Testing inputs and outputs",
                    "Testing without tools",
                  ],
                  hint: null,
                },
              ],
            },
            cycle2: {
              title: "Explaining Purposes of Testing Techniques",
              feedback:
                "Model answer: Black-box testing is best for testing user interfaces, white-box for code correctness, manual for exploratory tasks, and automated for repetitive tests.",
              practice:
                "Explain, in your own words, when it would be most advantageous to use each testing technique: black-box, white-box, manual, and automated.",
              explanation: {
                slideText:
                  "Understand the purposes and advantages of different testing techniques.",
                imagePrompt: "testing techniques purposes table",
                spokenExplanation: [
                  "Discuss the purpose of black-box testing: validating software functionality from an end-user perspective.",
                  "Explain white-box testing purpose: ensuring internal code correctness and structure integrity.",
                  "Introduce the advantages of manual testing: flexibility and human insight in exploratory testing.",
                  "Discuss the purpose of automated testing: efficiency in repetitive test cases and regression testing.",
                  "Highlight scenarios where each technique is most effective.",
                ],
                accompanyingSlideDetails:
                  "A table listing testing techniques with their purposes and advantages.",
              },
              durationInMinutes: 15,
              checkForUnderstanding: [
                {
                  questionType: "multiple-choice" as const,
                  question: "What is the purpose of black-box testing?",
                  answers: [
                    "Validating functionality from an end-user perspective",
                  ],
                  distractors: [
                    "Ensuring code correctness",
                    "Testing with automation tools",
                  ],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question: "Why is manual testing beneficial?",
                  answers: ["Provides flexibility and human insight"],
                  distractors: [
                    "Ensures internal code correctness",
                    "Automates repetitive tasks",
                  ],
                  hint: null,
                },
              ],
            },
            cycle3: {
              title: "Evaluating Testing Effectiveness",
              feedback:
                "Model answer: User interfaces benefit from black-box testing, code quality from white-box, usability from manual, and regression from automated testing.",
              practice:
                "Given a set of scenarios, evaluate and justify which testing technique would be most effective for each.",
              explanation: {
                slideText:
                  "Evaluate the effectiveness of testing techniques in various scenarios.",
                imagePrompt: "testing scenarios evaluation",
                spokenExplanation: [
                  "Present scenarios where different testing techniques are applied.",
                  "Evaluate the effectiveness of black-box testing for user interface scenarios.",
                  "Discuss white-box testing's effectiveness for code quality assurance.",
                  "Examine manual testing's role in usability testing.",
                  "Consider automated testing's efficiency in regression testing.",
                ],
                accompanyingSlideDetails:
                  "Scenarios with testing techniques applied and their evaluations.",
              },
              durationInMinutes: 15,
              checkForUnderstanding: [
                {
                  questionType: "multiple-choice" as const,
                  question:
                    "In which scenario is black-box testing most effective?",
                  answers: ["User interface testing"],
                  distractors: ["Code quality assurance", "Regression testing"],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question:
                    "Which testing is efficient for regression testing?",
                  answers: ["Automated testing"],
                  distractors: ["Manual testing", "Black-box testing"],
                  hint: null,
                },
              ],
            },
            subject: "computing",
            exitQuiz: {
              version: "v2" as const,
              imageAttributions: [],
              questions: [
                {
                  questionType: "multiple-choice" as const,
                  question: "What is the main focus of black-box testing?",
                  answers: ["Inputs and outputs"],
                  distractors: ["Internal code", "Testing tools"],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question:
                    "Which technique involves testing internal structures?",
                  answers: ["White-box testing"],
                  distractors: ["Black-box testing", "Manual testing"],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question: "Why is automated testing used?",
                  answers: ["For efficiency in repetitive tasks"],
                  distractors: [
                    "For human insight",
                    "For testing inputs and outputs",
                  ],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question: "When is manual testing most beneficial?",
                  answers: ["In exploratory tasks"],
                  distractors: ["In repetitive tasks", "In regression testing"],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question:
                    "Which testing technique validates functionality from an end-user perspective?",
                  answers: ["Black-box testing"],
                  distractors: ["White-box testing", "Automated testing"],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question: "What is the role of white-box testing?",
                  answers: ["Ensuring code correctness"],
                  distractors: ["Testing user interfaces", "Automating tasks"],
                  hint: null,
                },
              ],
            },
            keyStage: "key-stage-4",
            keywords: [
              {
                keyword: "Quality assurance",
                definition:
                  "A systematic process to ensure products meet specified requirements and customer expectations.",
              },
              {
                keyword: "Black-box testing",
                definition:
                  "A testing technique that examines the functionality without looking into internal structures.",
              },
              {
                keyword: "White-box testing",
                definition:
                  "A testing technique that examines the internal structures or workings of an application.",
              },
              {
                keyword: "Automated testing",
                definition:
                  "The use of software tools to execute tests automatically, often for repetitive tasks.",
              },
              {
                keyword: "Manual testing",
                definition:
                  "The process of manually checking software for defects without the use of tools or scripts.",
              },
            ],
            starterQuiz: {
              version: "v2" as const,
              imageAttributions: [],
              questions: [
                {
                  questionType: "multiple-choice" as const,
                  question: "What is the software development lifecycle?",
                  answers: ["A series of phases in software development"],
                  distractors: [
                    "A single stage process in software creation",
                    "An unrelated sequence of steps",
                  ],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question:
                    "Why is quality assurance important in software development?",
                  answers: ["To ensure products meet requirements"],
                  distractors: [
                    "To reduce the cost of software",
                    "To increase the complexity of software",
                  ],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question: "What is debugging?",
                  answers: ["Finding and fixing errors in code"],
                  distractors: ["Writing new code", "Testing user interfaces"],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question: "Name a type of software application.",
                  answers: ["Web application"],
                  distractors: ["Hardware device", "Network cable"],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question: "What is a basic programming concept?",
                  answers: ["Loops"],
                  distractors: ["Photoshop filters", "Network routers"],
                  hint: null,
                },
                {
                  questionType: "multiple-choice" as const,
                  question: "What is the purpose of testing?",
                  answers: ["To ensure functionality and reliability"],
                  distractors: [
                    "To increase the price",
                    "To make the software more colourful",
                  ],
                  hint: null,
                },
              ],
            },
            learningCycles: [
              "Identify various software testing techniques and their definitions",
              "Explain the purposes of different software testing techniques",
              "Evaluate the effectiveness of different software testing techniques for specific scenarios",
            ],
            misconceptions: [
              {
                description:
                  "Testing should occur at multiple stages throughout the software development lifecycle to catch issues early.",
                misconception: "Testing is only done after development",
              },
              {
                description:
                  "Both automated and manual testing have their roles; manual testing is still necessary for exploratory and usability testing.",
                misconception:
                  "Automated testing eliminates the need for manual testing",
              },
              {
                description:
                  "Testing reduces the number of bugs but cannot guarantee a completely bug-free application.",
                misconception: "Testing guarantees bug-free software",
              },
            ],
            priorKnowledge: [
              "Understand the software development lifecycle",
              "Recognise the importance of quality assurance in software development",
              "Familiarity with basic programming concepts",
              "Awareness of different types of software applications",
              "Basic knowledge of debugging techniques",
            ],
            learningOutcome:
              "I can explain different software testing techniques and their purposes.",
            keyLearningPoints: [
              "Software testing ensures the functionality and reliability of applications",
              "Different testing techniques are used depending on the objectives",
              "Manual and automated testing have distinct advantages and disadvantages",
              "Black-box testing focuses on input and output without considering internal code structure",
              "White-box testing involves testing the internal structures and workings of an application",
            ],
            additionalMaterials: "None",
          },
        ];
        return Promise.resolve({
          ...state,
          relevantLessons,
          messages: [
            ...state.messages,
            {
              role: "assistant",
              content: `I have fetched the following existing Oak lessons that look relevant:
${relevantLessons.map((lesson) => `- ${lesson.title}`).join("\n")}
Would you like to base your lesson on one of these? Otherwise we can create one from scratch!`,
              // @todo this is quite brittle. Better for the messageToUser agent to be adding this message
              stepsExecuted: [
                ...state.currentTurn.stepsExecuted,
                { agentId: "fetchRelevantLessons" },
              ],
            },
          ],
        });
      },
    },
    basedOn: createPromptAgent({
      id: "basedOn",
      description:
        "Updates the 'based on' field of the lesson plan. Return null if the user does not want to base this lesson on an existing lesson plan. This means they will be creating one from scratch.",
      responseSchema: z
        .object({
          id: z.string().describe("ID of the lesson plan"),
          title: z
            .string()
            .describe(
              "Title of the RAG lesson that we are basing this lesson on",
            ),
        })
        .nullable(),
      instructions: basedOnInstructions,
      openAIClient,
      mergeFunction: (state, output) => {
        return {
          ...state,
          doc: {
            ...state.doc,
            basedOn: output,
          },
        };
      },
      additionalContextFromState: (state) => {
        return `## RAG lesson plans
These are the lesson plans the user was given the option to base this lesson on. Check their last message, and respond accordingly.

${state.relevantLessons?.map((lesson) => `- ${JSON.stringify({ id: lesson.id, title: lesson.title })}`).join("\n")}
`;
      },
    }),
  };

  return agents;
}

export function getMessageToUserAgent({
  openAIClient,
}: {
  openAIClient: OpenAI;
}): AgentDefinition<AilaState, "messageToUser"> {
  return createPromptAgent({
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
          {
            role: "assistant",
            content: output.message,
            stepsExecuted: state.currentTurn.stepsExecuted,
          },
        ],
      };
    },
    openAIClient,
    additionalContextFromState: (state) => {
      const error = state.currentTurn.error
        ? `## Error
An error occurred during processing -- it's up to you to write a message to the user in the correct voice (only give them details if the error is due to their input):
\`\`\`json
${JSON.stringify(state.currentTurn.error, null, 2)}
\`\`\`
`
        : "";
      const refusalText = state.currentTurn.refusal
        ? `## Refusal
The agent refused to complete the request for the following reason -- it's up to you to write a message to the user in the correct voice:
${JSON.stringify(state.currentTurn.refusal, null, 2)}
`
        : "";

      const directResponseText = state.currentTurn.directResponse
        ? `## Direct Response
It looks like know action was required, here's some context -- it's up to you to write a message to the user in the correct voice:
${JSON.stringify(state.currentTurn.directResponse, null, 2)}
`
        : "";

      const jsonDiff = compare(state.docAtStartOfTurn, state.doc);
      const jsonDiffText = `## Changes
${jsonDiff.length === 0 ? "Since the last user message, no changes have been made." : JSON.stringify(jsonDiff, null, 2)}
`;

      return [error, refusalText, directResponseText, jsonDiffText].join(
        "\n\n",
      );
    },
  });
}

export function getRoutingAgent({
  openAIClient,
  subAgents,
}: {
  openAIClient: OpenAI;
  subAgents: { id: string; description: string }[];
}): AgentDefinition<AilaState, "router"> {
  return createPromptAgent({
    id: "router",
    description:
      "Routes messages to the appropriate agents based on user input",
    responseSchema: z.object({
      plan: z
        .array(
          z.union([
            z.object({
              agentId: z.enum(
                AGENT_IDS.filter((id) => id !== "deleteSection") as [
                  string,
                  ...string[],
                ],
              ),
            }),
            z.object({
              agentId: z.enum(["deleteSection"]),
              args: z.object({
                sectionKey: sectionKeysSchema,
              }),
            }),
          ]),
        )
        .describe("Plan of actions for the agents"),
      refusal: refusalSchema.nullable(),
      error: errorSchema.nullable(),
      directResponse: directResponseSchema.nullable(),
    }), // This agent does not return a specific schema
    instructions: routerInstructions.replace(
      "{{agents_list}}",
      subAgents
        .map((agent) => `- ${agent.id}: ${agent.description}`)
        .join("\n"),
    ),
    openAIClient,
    mergeFunction: (state, output) => ({
      ...state,
      currentTurn: {
        ...state.currentTurn,
        plan: output.plan as AilaState["currentTurn"]["plan"], // @todo plan steps should be defined schema first
        refusal: output.refusal,
        error: output.error,
        directResponse: output.directResponse,
      },
    }),
    additionalContextFromState: (state) => {
      return getStepsExecutedAsText(state);
    },
  });
}

function createPromptAgent<OutputType, TId extends string>(props: {
  id: TId;
  description: string;
  responseSchema: z.ZodType<OutputType>;
  instructions: string; // these are the instructions that do not change between sessions or interactions
  additionalContextFromState?: (state: AilaState) => string; // this is anything that could change, current doc state, relevant messages, relevant lesson content, retry error context
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
    additionalContextFromState,
  } = props;

  return {
    id,
    description,
    handler: async (state) => {
      let basedOnText = "";
      let relevantExamplesText = "";
      const sectionKey = sectionKeysSchema.safeParse(id).data;
      if (sectionKey) {
        const basedOnId = state.doc.basedOn?.id;
        const basedOnDocument = state.relevantLessons?.find(
          (lesson) => lesson.id === basedOnId,
        );

        basedOnText = basedOnDocument
          ? `## Based on
  
The user is basing this lesson plan on the lesson "${basedOnDocument.title}". Meaning you should only deviate from the content in that lesson where necessary or the user explicitly asks you to.
  
### Example ${sectionKey}

${JSON.stringify(state.doc[sectionKey])}
  `
          : "";

        relevantExamplesText = state.relevantLessons?.length
          ? `## Relevant examples
  
The following are example ${sectionKey} sections from exemplar lessons that the user has been given the option to base this lesson on. You can use these as inspiration for your response, to help make your response more pedagogically sound.
  
  ${state.relevantLessons
    .map(
      (
        lesson,
        i,
      ) => `### Example '${sectionKey}' ${i + 1} from lesson "${lesson.title}"

${JSON.stringify(lesson[sectionKey])}

  `,
    )
    .join("\n")}`
          : "";
      }

      const userPrompt = [
        contextFromState(state),
        additionalContextFromState ? additionalContextFromState(state) : "",
        basedOnText,
        relevantExamplesText,
      ].join("\n");

      const res = await callLLM({
        systemPrompt: decorateInstructionsWithRole({ instructions }),
        userPrompt,
        responseSchema,
        openAIClient,
        model: "gpt-4o",
      });

      if (res.error !== null) {
        return {
          ...state,
          currentTurn: {
            ...state.currentTurn,
            error: res.error,
          },
        };
      }

      return mergeFunction(state, res.data);
    },
  };
}

function contextFromState(state: AilaState): string {
  const contextNotes = state.currentTurn.contextNotes
    ? `## Context Notes
${state.currentTurn.contextNotes}`
    : "";

  const messages = state.messages
    ? `## User message

The user has said:

${state.messages.findLast((m) => m.role === "user")?.content}

## Relevant messages

This is the conversation with the user. The **last message** is the most recent user input:

${state.messages.map((m) => `- ${m.role}: ${m.content}`).join("\n")}`
    : "";

  const currentDoc = state.doc
    ? `## Current lesson plan

${JSON.stringify(state.doc, null, 2)}`
    : "";

  return [contextNotes, messages, currentDoc].filter(Boolean).join("\n\n");
}

function decorateInstructionsWithRole({
  instructions,
}: {
  instructions: string;
}): string {
  return `${instructions}`;
}
