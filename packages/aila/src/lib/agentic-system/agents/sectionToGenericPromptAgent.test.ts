import { z } from "zod";

import type { PartialLessonPlan } from "../../../protocol/schema";
import type { RagLessonPlan } from "../../../utils/rag/fetchRagContent";
import type {
  AilaExecutionContext,
  ChatMessage,
  SectionPromptAgentProps,
} from "../types";
import type { VoiceId } from "./sectionAgents/shared/voices";
import { sectionToGenericPromptAgent } from "./sectionToGenericPromptAgent";

// Mock schema for testing
const mockSchema = z.object({
  content: z.string(),
  items: z.array(z.string()).optional(),
});

type MockSchemaType = z.infer<typeof mockSchema>;

describe("sectionToGenericPromptAgent", () => {
  const mockMessages: ChatMessage[] = [
    {
      id: "msg-1",
      role: "user",
      content:
        "Can you help me create a lesson about photosynthesis for Year 7 students?",
    },
    {
      id: "msg-2",
      role: "assistant",
      content:
        "I'd be happy to help you create a lesson about photosynthesis for Year 7 students.",
    },
    {
      id: "msg-3",
      role: "user",
      content:
        "Please make sure to include the key learning points about chlorophyll and glucose production.",
    },
  ];

  const mockDocument: PartialLessonPlan = {
    title: "Introduction to Photosynthesis",
    keyStage: "ks3",
    subject: "science",
    topic: "Plants and ecosystems",
    learningOutcome: "Students will understand the process of photosynthesis",
  };

  const mockRelevantLessons: RagLessonPlan[] = [];

  const mockExecutionContext: AilaExecutionContext = {
    persistedState: {
      messages: mockMessages,
      initialDocument: mockDocument,
      relevantLessons: mockRelevantLessons,
    },
    runtime: {
      plannerAgent: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sectionAgents: {} as any, // Mock - not used in this test
      messageToUserAgent: jest.fn(),
      fetchRelevantLessons: jest.fn(),
      config: {
        mathsQuizEnabled: false,
      },
    },
    currentTurn: {
      document: mockDocument,
      plannerOutput: null,
      errors: [],
      stepsExecuted: [],
      relevantLessonsFetched: false,
    },
    callbacks: {
      onPlannerComplete: jest.fn(),
      onSectionComplete: jest.fn(),
      onTurnComplete: jest.fn(),
    },
  };

  const mockContentToString = (content: MockSchemaType): string => {
    if (!content) return "";
    return `${content.content}${content.items ? ` - ${content.items.join(", ")}` : ""}`;
  };

  const baseProps: SectionPromptAgentProps<MockSchemaType> = {
    responseSchema: mockSchema,
    messages: mockMessages,
    instructions:
      "Generate key learning points for a science lesson about photosynthesis.",
    currentValue: undefined,
    exemplarContent: undefined,
    basedOnContent: undefined,
    contentToString: mockContentToString,
    ctx: mockExecutionContext,
  };

  describe("input message generation", () => {
    it("should generate consistent input messages with minimal props", () => {
      const agent = sectionToGenericPromptAgent(baseProps);

      expect(agent.input).toMatchSnapshot();
    });

    it("should handle current value", () => {
      const currentValue: MockSchemaType = {
        content: "Photosynthesis is the process plants use to make food",
        items: ["chlorophyll", "sunlight", "water"],
      };

      const propsWithCurrentValue: SectionPromptAgentProps<MockSchemaType> = {
        ...baseProps,
        currentValue,
      };

      const agent = sectionToGenericPromptAgent(propsWithCurrentValue);

      expect(agent.input).toMatchSnapshot();
    });

    it("should handle exemplar content", () => {
      const exemplarContent: MockSchemaType[] = [
        {
          content: "Respiration is the process animals use to release energy",
          items: ["oxygen", "glucose", "carbon dioxide"],
        },
        {
          content: "Digestion breaks down food into useful nutrients",
          items: ["enzymes", "nutrients", "absorption"],
        },
      ];

      const propsWithExemplar: SectionPromptAgentProps<MockSchemaType> = {
        ...baseProps,
        exemplarContent,
      };

      const agent = sectionToGenericPromptAgent(propsWithExemplar);

      expect(agent.input).toMatchSnapshot();
    });

    it("should handle based on content", () => {
      const basedOnContent: MockSchemaType = {
        content: "Plant structure and function basics",
        items: ["leaves", "roots", "stem"],
      };

      const propsWithBasedOn: SectionPromptAgentProps<MockSchemaType> = {
        ...baseProps,
        basedOnContent,
      };

      const agent = sectionToGenericPromptAgent(propsWithBasedOn);

      expect(agent.input).toMatchSnapshot();
    });

    it("should handle default voice", () => {
      const propsWithVoice: SectionPromptAgentProps<MockSchemaType> = {
        ...baseProps,
        defaultVoice: "TEACHER_TO_PUPIL_WRITTEN" as VoiceId,
      };

      const agent = sectionToGenericPromptAgent(propsWithVoice);

      expect(agent.input).toMatchSnapshot();
    });

    it("should handle multiple voices", () => {
      const propsWithVoices: SectionPromptAgentProps<MockSchemaType> = {
        ...baseProps,
        defaultVoice: "AILA_TO_TEACHER" as VoiceId,
        voices: ["AILA_TO_TEACHER", "TEACHER_TO_PUPIL_WRITTEN"] as VoiceId[],
      };

      const agent = sectionToGenericPromptAgent(propsWithVoices);

      expect(agent.input).toMatchSnapshot();
    });

    it("should handle extra input from context", () => {
      const extraInputFromCtx = (_ctx: AilaExecutionContext) => [
        {
          role: "developer" as const,
          content:
            "Additional context: This is a Year 7 science lesson focused on biological processes.",
        },
        {
          role: "user" as const,
          content:
            "Remember to keep explanations age-appropriate for 11-12 year-old students.",
        },
      ];

      const propsWithExtra: SectionPromptAgentProps<MockSchemaType> = {
        ...baseProps,
        extraInputFromCtx,
      };

      const agent = sectionToGenericPromptAgent(propsWithExtra);

      expect(agent.input).toMatchSnapshot();
    });

    it("should handle all options combined", () => {
      const currentValue: MockSchemaType = {
        content: "Basic photosynthesis overview",
        items: ["plants", "energy", "sunlight"],
      };

      const exemplarContent: MockSchemaType[] = [
        {
          content: "Cellular respiration example",
          items: ["mitochondria", "ATP", "glucose"],
        },
      ];

      const basedOnContent: MockSchemaType = {
        content: "Foundation knowledge about plant biology",
        items: ["cell structure", "organelles", "life processes"],
      };

      const extraInputFromCtx = (_ctx: AilaExecutionContext) => [
        {
          role: "developer" as const,
          content: "Context: Advanced Year 7 class with strong prior knowledge",
        },
      ];

      const complexProps: SectionPromptAgentProps<MockSchemaType> = {
        ...baseProps,
        currentValue,
        exemplarContent,
        basedOnContent,
        extraInputFromCtx,
        defaultVoice: "EXPERT_TEACHER" as VoiceId,
        voices: ["EXPERT_TEACHER", "TEACHER_TO_PUPIL_WRITTEN"] as VoiceId[],
      };

      const agent = sectionToGenericPromptAgent(complexProps);

      expect(agent.input).toMatchSnapshot();
    });

    it("should handle empty messages array", () => {
      const propsWithNoMessages: SectionPromptAgentProps<MockSchemaType> = {
        ...baseProps,
        messages: [],
      };

      const agent = sectionToGenericPromptAgent(propsWithNoMessages);

      expect(agent.input).toMatchSnapshot();
    });

    it("should handle different instruction types", () => {
      const detailedInstructions = `
Generate comprehensive key learning points for a photosynthesis lesson.

Requirements:
- Include 3-5 main points
- Focus on the process, inputs, and outputs
- Make connections to everyday life
- Consider common misconceptions

The content should be suitable for Key Stage 3 students.
      `.trim();

      const propsWithDetailedInstructions: SectionPromptAgentProps<MockSchemaType> =
        {
          ...baseProps,
          instructions: detailedInstructions,
        };

      const agent = sectionToGenericPromptAgent(propsWithDetailedInstructions);

      expect(agent.input).toMatchSnapshot();
    });
  });

  describe("schema validation", () => {
    it("should have the correct response schema", () => {
      const agent = sectionToGenericPromptAgent(baseProps);

      expect(agent.responseSchema).toBe(mockSchema);
      expect(typeof agent.responseSchema.parse).toBe("function");
    });
  });

  describe("voice handling", () => {
    it("should add default voice to voices array if not present", () => {
      const propsWithVoiceNotInArray: SectionPromptAgentProps<MockSchemaType> =
        {
          ...baseProps,
          defaultVoice: "AILA_TO_TEACHER" as VoiceId,
          voices: ["TEACHER_TO_PUPIL_WRITTEN"] as VoiceId[],
        };

      const agent = sectionToGenericPromptAgent(propsWithVoiceNotInArray);

      expect(agent.input).toMatchSnapshot();
    });

    it("should not duplicate default voice if already in voices array", () => {
      const propsWithVoiceInArray: SectionPromptAgentProps<MockSchemaType> = {
        ...baseProps,
        defaultVoice: "AILA_TO_TEACHER" as VoiceId,
        voices: ["AILA_TO_TEACHER", "TEACHER_TO_PUPIL_WRITTEN"] as VoiceId[],
      };

      const agent = sectionToGenericPromptAgent(propsWithVoiceInArray);

      expect(agent.input).toMatchSnapshot();
    });
  });
});
