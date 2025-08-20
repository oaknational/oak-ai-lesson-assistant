import { describe, expect, it } from "@jest/globals";

import type { PlannerOutput, SectionStep } from "../schema";
import type { ChatMessage } from "../types";
import { createPresentationAgent } from "./createPresentationAgent";

describe("createPresentationAgent", () => {
  const mockMessages: ChatMessage[] = [
    { role: "user", content: "Can you help me create a lesson about plants?" },
    {
      role: "assistant",
      content: "I'd be happy to help you create a lesson about plants!",
    },
    { role: "user", content: "Let's focus on photosynthesis." },
  ];

  const mockPrevDoc = {
    title: "Plant Lesson",
    subject: "Science",
    keyStage: "KS2",
  };

  const mockNextDoc = {
    title: "Plant Lesson",
    subject: "Science",
    keyStage: "KS2",
    topic: "Photosynthesis",
    learningOutcome: "Students will understand how plants make their own food",
    keywords: [
      {
        keyword: "Photosynthesis",
        definition: "The process by which plants make their own food",
      },
      {
        keyword: "Chlorophyll",
        definition: "The green substance in leaves that captures sunlight",
      },
    ],
  };

  const mockStepsExecuted: SectionStep[] = [
    { type: "section", sectionKey: "topic", action: "create" },
    { type: "section", sectionKey: "learningOutcome", action: "create" },
    { type: "section", sectionKey: "keywords", action: "create" },
  ];

  const mockPlannerOutputPlan: PlannerOutput = {
    decision: "plan",
    parsedUserMessage: "Let's focus on photosynthesis.",
    plan: [
      { type: "section", sectionKey: "topic", action: "create" },
      { type: "section", sectionKey: "learningOutcome", action: "create" },
      { type: "section", sectionKey: "keywords", action: "create" },
    ],
  };

  const mockPlannerOutputExit: PlannerOutput = {
    decision: "exit",
    parsedUserMessage: "Can you email this lesson to my colleague?",
    reasonType: "capability_limitation",
    reasonJustification: "I cannot send emails or access external systems.",
  };

  it("should create a presentation agent with successful plan execution", () => {
    const agent = createPresentationAgent({
      messages: mockMessages,
      prevDoc: mockPrevDoc,
      nextDoc: mockNextDoc,
      stepsExecuted: mockStepsExecuted,
      errors: [],
      plannerOutput: mockPlannerOutputPlan,
    });

    expect(agent.input).toMatchSnapshot();
  });

  it("should handle presentation agent with errors", () => {
    const mockErrors = [
      { message: "Failed to generate topic due to insufficient context" },
      { message: "Keywords generation timeout" },
    ];

    const agent = createPresentationAgent({
      messages: mockMessages,
      prevDoc: mockPrevDoc,
      nextDoc: mockNextDoc,
      stepsExecuted: [mockStepsExecuted[0]!], // Only first step executed
      errors: mockErrors,
      plannerOutput: mockPlannerOutputPlan,
    });

    expect(agent.input).toMatchSnapshot();
  });

  it("should handle presentation agent with exit decision", () => {
    const agent = createPresentationAgent({
      messages: mockMessages,
      prevDoc: mockPrevDoc,
      nextDoc: mockPrevDoc, // No changes made
      stepsExecuted: [],
      errors: [],
      plannerOutput: mockPlannerOutputExit,
    });

    expect(agent.input).toMatchSnapshot();
  });

  it("should handle no steps executed", () => {
    const agent = createPresentationAgent({
      messages: mockMessages,
      prevDoc: mockPrevDoc,
      nextDoc: mockPrevDoc, // No changes
      stepsExecuted: [],
      errors: [],
      plannerOutput: mockPlannerOutputPlan,
    });

    expect(agent.input).toMatchSnapshot();
  });

  it("should handle single message conversation", () => {
    const singleMessage: ChatMessage[] = [
      { role: "user", content: "Create a lesson about fractions for Year 4." },
    ];

    const agent = createPresentationAgent({
      messages: singleMessage,
      prevDoc: {},
      nextDoc: {
        title: "Introduction to Fractions",
        subject: "Mathematics",
        keyStage: "KS2",
      },
      stepsExecuted: [
        { type: "section", sectionKey: "title", action: "create" },
        { type: "section", sectionKey: "subject", action: "create" },
        { type: "section", sectionKey: "keyStage", action: "create" },
      ],
      errors: [],
      plannerOutput: {
        decision: "plan",
        parsedUserMessage: "Create a lesson about fractions for Year 4.",
        plan: [
          { type: "section", sectionKey: "title", action: "create" },
          { type: "section", sectionKey: "subject", action: "create" },
          { type: "section", sectionKey: "keyStage", action: "create" },
        ],
      },
    });

    expect(agent.input).toMatchSnapshot();
  });

  it("should handle complex document changes", () => {
    const complexPrevDoc = {
      title: "Basic Plant Biology",
      subject: "Science",
      keyStage: "KS2",
      keywords: [
        {
          keyword: "Plant",
          definition: "A living organism that makes its own food",
        },
      ],
    };

    const complexNextDoc = {
      title: "Photosynthesis in Plants",
      subject: "Science",
      keyStage: "KS2",
      topic: "How Plants Make Food",
      learningOutcome: "Students will understand the process of photosynthesis",
      keywords: [
        {
          keyword: "Plant",
          definition: "A living organism that makes its own food",
        },
        {
          keyword: "Photosynthesis",
          definition: "The process by which plants make food using sunlight",
        },
        {
          keyword: "Chlorophyll",
          definition: "The green pigment that captures light energy",
        },
        {
          keyword: "Carbon dioxide",
          definition: "A gas that plants absorb from the air",
        },
      ],
      priorKnowledge: [
        "Students know that plants are living things",
        "Students understand that plants need water and sunlight",
      ],
    };

    const agent = createPresentationAgent({
      messages: [
        {
          role: "user",
          content: "Update this lesson to focus specifically on photosynthesis",
        },
        {
          role: "assistant",
          content:
            "I'll help you update the lesson to focus on photosynthesis.",
        },
        {
          role: "user",
          content:
            "Add more detailed keywords and some prior knowledge requirements",
        },
      ],
      prevDoc: complexPrevDoc,
      nextDoc: complexNextDoc,
      stepsExecuted: [
        { type: "section", sectionKey: "title", action: "refine" },
        { type: "section", sectionKey: "topic", action: "create" },
        { type: "section", sectionKey: "learningOutcome", action: "create" },
        { type: "section", sectionKey: "keywords", action: "refine" },
        { type: "section", sectionKey: "priorKnowledge", action: "create" },
      ],
      errors: [],
      plannerOutput: {
        decision: "plan",
        parsedUserMessage:
          "Add more detailed keywords and some prior knowledge requirements",
        plan: [
          { type: "section", sectionKey: "keywords", action: "refine" },
          { type: "section", sectionKey: "priorKnowledge", action: "create" },
        ],
      },
    });

    expect(agent.input).toMatchSnapshot();
  });
});
