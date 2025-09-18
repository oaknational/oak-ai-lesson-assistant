import type { LooseLessonPlan } from "../../../../protocol/schema";
import type { RagLessonPlan } from "../../../../utils/rag/fetchRagContent";
import type { ChatMessage, PlannerAgentProps } from "../../types";
import { createPlannerAgent } from "./createPlannerAgent";

describe("createPlannerAgent", () => {
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
        "I'd be happy to help you create a lesson about photosynthesis for Year 7 students. Let me start by creating a comprehensive lesson plan.",
    },
    {
      id: "msg-3",
      role: "user",
      content:
        "Please make sure to include practical activities and common misconceptions.",
    },
  ];

  const mockDocument: LooseLessonPlan = {
    title: "Introduction to Photosynthesis",
    keyStage: "ks3",
    subject: "science",
    topic: "Plants and ecosystems",
    learningOutcome:
      "Students will understand the process of photosynthesis and its importance in ecosystems",
    priorKnowledge: [
      "Basic understanding of plants",
      "Knowledge of the sun as an energy source",
    ],
    keyLearningPoints: [
      "Photosynthesis is the process by which plants make food",
      "Sunlight, water, and carbon dioxide are needed for photosynthesis",
      "Oxygen is produced as a by-product of photosynthesis",
    ],
  };

  const mockRelevantLessons: RagLessonPlan[] = [];

  const mockProps: PlannerAgentProps = {
    messages: mockMessages,
    document: mockDocument,
    relevantLessons: mockRelevantLessons,
  };

  describe("input message generation", () => {
    it("should generate consistent input messages for planning", () => {
      const plannerAgent = createPlannerAgent(mockProps);

      expect(plannerAgent.input).toMatchSnapshot();
    });

    it("should handle empty relevant lessons", () => {
      const propsWithoutLessons: PlannerAgentProps = {
        ...mockProps,
        relevantLessons: [],
      };

      const plannerAgent = createPlannerAgent(propsWithoutLessons);

      expect(plannerAgent.input).toMatchSnapshot();
    });

    it("should handle null relevant lessons", () => {
      const propsWithNullLessons: PlannerAgentProps = {
        ...mockProps,
        relevantLessons: null,
      };

      const plannerAgent = createPlannerAgent(propsWithNullLessons);

      expect(plannerAgent.input).toMatchSnapshot();
    });

    it("should handle minimal document", () => {
      const minimalDocument: LooseLessonPlan = {
        title: "Basic Science Lesson",
        keyStage: "ks2",
        subject: "science",
      };

      const propsWithMinimalDoc: PlannerAgentProps = {
        ...mockProps,
        document: minimalDocument,
      };

      const plannerAgent = createPlannerAgent(propsWithMinimalDoc);

      expect(plannerAgent.input).toMatchSnapshot();
    });

    it("should handle single message conversation", () => {
      const singleMessage: ChatMessage[] = [
        {
          id: "msg-1",
          role: "user",
          content: "Create a lesson about the water cycle.",
        },
      ];

      const propsWithSingleMessage: PlannerAgentProps = {
        ...mockProps,
        messages: singleMessage,
      };

      const plannerAgent = createPlannerAgent(propsWithSingleMessage);

      expect(plannerAgent.input).toMatchSnapshot();
    });

    it("should handle different subjects and key stages", () => {
      const mathDocument: LooseLessonPlan = {
        title: "Introduction to Fractions",
        keyStage: "ks2",
        subject: "maths",
        topic: "Number and place value",
        learningOutcome: "Students will understand basic fraction concepts",
      };

      const mathProps: PlannerAgentProps = {
        ...mockProps,
        document: mathDocument,
      };

      const plannerAgent = createPlannerAgent(mathProps);

      expect(plannerAgent.input).toMatchSnapshot();
    });
  });

  describe("schema validation", () => {
    it("should have the correct response schema", () => {
      const plannerAgent = createPlannerAgent(mockProps);

      expect(plannerAgent.responseSchema).toBeDefined();
      expect(typeof plannerAgent.responseSchema.parse).toBe("function");
    });
  });
});
