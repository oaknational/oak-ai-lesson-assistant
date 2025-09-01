import type { LooseLessonPlan } from "../../../../protocol/schema";
import type { RagLessonPlan } from "../../../../utils/rag/fetchRagContent";
import type { PlanStep, PlannerOutput } from "../../schema";
import type { ChatMessage, PresentationAgentProps } from "../../types";
import { createPresentationAgent } from "./createPresentationAgent";

describe("createPresentationAgent", () => {
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

  const mockPrevDoc: LooseLessonPlan = {
    title: "Introduction to Photosynthesis",
    keyStage: "ks3",
    subject: "science",
    topic: "Plants and ecosystems",
    learningOutcome: "Students will understand the process of photosynthesis",
  };

  const mockNextDoc: LooseLessonPlan = {
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

  const mockStepsExecuted: PlanStep[] = [
    {
      type: "section",
      sectionKey: "learningOutcome",
      action: "generate",
    },
    {
      type: "section",
      sectionKey: "priorKnowledge",
      action: "generate",
    },
    {
      type: "section",
      sectionKey: "keyLearningPoints",
      action: "generate",
    },
  ];

  const mockPlannerOutput: PlannerOutput = {
    decision: "plan",
    parsedUserMessage:
      "User requested inclusion of practical activities and common misconceptions",
    plan: [
      {
        type: "section",
        sectionKey: "misconceptions",
        action: "generate",
      },
      {
        type: "section",
        sectionKey: "keywords",
        action: "generate",
      },
    ],
  };

  const mockErrors = [
    { message: "Failed to generate quiz questions due to content complexity" },
  ];

  const mockRelevantLessons: RagLessonPlan[] = [];

  const mockProps: PresentationAgentProps = {
    messages: mockMessages,
    prevDoc: mockPrevDoc,
    nextDoc: mockNextDoc,
    stepsExecuted: mockStepsExecuted,
    errors: [],
    plannerOutput: mockPlannerOutput,
    relevantLessons: mockRelevantLessons,
    relevantLessonsFetched: true,
  };

  describe("input message generation", () => {
    it("should generate consistent input messages for presentation", () => {
      const presentationAgent = createPresentationAgent(mockProps);

      expect(presentationAgent.input).toMatchSnapshot();
    });

    it("should handle errors in the presentation", () => {
      const propsWithErrors: PresentationAgentProps = {
        ...mockProps,
        errors: mockErrors,
      };

      const presentationAgent = createPresentationAgent(propsWithErrors);

      expect(presentationAgent.input).toMatchSnapshot();
    });

    it("should handle exit decision from planner", () => {
      const exitPlannerOutput: PlannerOutput = {
        decision: "exit",
        parsedUserMessage: "User wants to exit the lesson planning session",
        reasonType: "relevant_query",
        reasonJustification: "User has completed their lesson planning needs",
        additionalInfo: "Lesson plan is ready for use",
      };

      const propsWithExit: PresentationAgentProps = {
        ...mockProps,
        plannerOutput: exitPlannerOutput,
      };

      const presentationAgent = createPresentationAgent(propsWithExit);

      expect(presentationAgent.input).toMatchSnapshot();
    });

    it("should handle no steps executed", () => {
      const propsWithNoSteps: PresentationAgentProps = {
        ...mockProps,
        stepsExecuted: [],
      };

      const presentationAgent = createPresentationAgent(propsWithNoSteps);

      expect(presentationAgent.input).toMatchSnapshot();
    });

    it("should handle null planner output", () => {
      const propsWithNullPlanner: PresentationAgentProps = {
        ...mockProps,
        plannerOutput: null,
      };

      const presentationAgent = createPresentationAgent(propsWithNullPlanner);

      expect(presentationAgent.input).toMatchSnapshot();
    });

    it("should handle relevant lessons not fetched", () => {
      const propsWithoutRelevantLessons: PresentationAgentProps = {
        ...mockProps,
        relevantLessonsFetched: false,
        relevantLessons: null,
      };

      const presentationAgent = createPresentationAgent(
        propsWithoutRelevantLessons,
      );

      expect(presentationAgent.input).toMatchSnapshot();
    });

    it("should handle multiple errors and complex state", () => {
      const complexErrors = [
        { message: "Network timeout when fetching external resources" },
        { message: "Invalid schema in user input" },
        { message: "Rate limit exceeded for AI service" },
      ];

      const complexSteps: PlanStep[] = [
        { type: "section", sectionKey: "title", action: "generate" },
        { type: "section", sectionKey: "learningOutcome", action: "generate" },
        { type: "section", sectionKey: "priorKnowledge", action: "generate" },
        {
          type: "section",
          sectionKey: "keyLearningPoints",
          action: "generate",
        },
        { type: "section", sectionKey: "misconceptions", action: "generate" },
      ];

      const propsWithComplexState: PresentationAgentProps = {
        ...mockProps,
        errors: complexErrors,
        stepsExecuted: complexSteps,
      };

      const presentationAgent = createPresentationAgent(propsWithComplexState);

      expect(presentationAgent.input).toMatchSnapshot();
    });

    it("should handle empty document changes", () => {
      const propsWithSameDoc: PresentationAgentProps = {
        ...mockProps,
        prevDoc: mockNextDoc,
        nextDoc: mockNextDoc,
      };

      const presentationAgent = createPresentationAgent(propsWithSameDoc);

      expect(presentationAgent.input).toMatchSnapshot();
    });
  });

  describe("schema validation", () => {
    it("should have the correct response schema", () => {
      const presentationAgent = createPresentationAgent(mockProps);

      expect(presentationAgent.responseSchema).toBeDefined();
      expect(typeof presentationAgent.responseSchema.parse).toBe("function");
    });
  });
});
