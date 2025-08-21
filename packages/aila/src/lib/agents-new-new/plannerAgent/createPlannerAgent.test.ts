import { describe, expect, it } from "@jest/globals";

import type { ChatMessage } from "../types";
import { createPlannerAgent } from "./createPlannerAgent";

describe("createPlannerAgent", () => {
  it("should create a planner agent with correct structure", () => {
    const mockMessages: ChatMessage[] = [
      { role: "user", content: "Hello, can you help me create a lesson?" },
      { role: "assistant", content: "Of course! I'd be happy to help." },
      { role: "user", content: "I need a lesson about photosynthesis." },
    ];

    const mockDocument = {
      title: "Plant Biology",
      subject: "Science",
      keyStage: "KS2",
      topic: "Photosynthesis",
    };

    const mockRelevantLessons = [
      { id: 1, title: "Introduction to Plants" },
      { id: 2, title: "Plant Cells and Structure" },
      { id: 3, title: "How Plants Make Food" },
    ];

    const agent = createPlannerAgent({
      messages: mockMessages,
      document: mockDocument,
      relevantLessons: mockRelevantLessons,
    });

    expect(agent.input).toMatchSnapshot();
  });

  it("should handle null relevant lessons", () => {
    const mockMessages: ChatMessage[] = [
      { role: "user", content: "Can you help me with a math lesson?" },
    ];

    const mockDocument = {
      title: "Basic Arithmetic",
      subject: "Mathematics",
      keyStage: "KS1",
    };

    const agent = createPlannerAgent({
      messages: mockMessages,
      document: mockDocument,
      relevantLessons: null,
    });

    expect(agent.input).toMatchSnapshot();
  });

  it("should handle empty messages array", () => {
    const mockDocument = {
      title: "Empty Lesson",
      subject: "General",
    };

    const agent = createPlannerAgent({
      messages: [],
      document: mockDocument,
      relevantLessons: [],
    });

    expect(agent.input).toMatchSnapshot();
  });

  it("should handle complex document structure", () => {
    const mockMessages: ChatMessage[] = [
      {
        role: "user",
        content: "I want to create a comprehensive history lesson.",
      },
    ];

    const mockDocument = {
      title: "The Industrial Revolution",
      subject: "History",
      keyStage: "KS3",
      topic: "British Industrial Revolution",
      learningOutcome:
        "Students will understand the key changes during the Industrial Revolution",
      priorKnowledge: [
        "Basic understanding of timeline",
        "Knowledge of rural vs urban life",
      ],
      keyLearningPoints: [
        "Steam power revolutionized manufacturing",
        "Population moved from rural to urban areas",
        "Working conditions in factories were harsh",
      ],
      misconceptions: [
        "The Industrial Revolution happened overnight",
        "Only positive changes occurred during this period",
      ],
      keywords: [
        { word: "Steam engine", definition: "A machine powered by steam" },
        {
          word: "Factory",
          definition: "A building where goods are manufactured",
        },
      ],
    };

    const mockRelevantLessons = [
      { title: "Pre-Industrial Britain" },
      { title: "Transportation Revolution" },
      { title: "Social Changes in 19th Century Britain" },
    ];

    const agent = createPlannerAgent({
      messages: mockMessages,
      document: mockDocument,
      relevantLessons: mockRelevantLessons,
    });

    expect(agent.input).toMatchSnapshot();
  });

  it("should handle long conversation history", () => {
    const mockMessages: ChatMessage[] = [
      { role: "user", content: "Hi there!" },
      { role: "assistant", content: "Hello! How can I help you today?" },
      { role: "user", content: "I need help with a science lesson." },
      { role: "assistant", content: "What topic would you like to cover?" },
      { role: "user", content: "Something about forces and motion." },
      {
        role: "assistant",
        content:
          "Great choice! Forces and motion is a fundamental physics topic.",
      },
      {
        role: "user",
        content: "Can you help me plan the learning objectives?",
      },
      {
        role: "assistant",
        content: "Absolutely! What age group are you teaching?",
      },
      { role: "user", content: "Year 7 students, so around 11-12 years old." },
    ];

    const mockDocument = {
      title: "Forces and Motion",
      subject: "Physics",
      keyStage: "KS3",
      topic: "Introduction to Forces",
    };

    const mockRelevantLessons = [
      { title: "What is a Force?" },
      { title: "Types of Forces" },
      { title: "Measuring Forces" },
      { title: "Balanced and Unbalanced Forces" },
    ];

    const agent = createPlannerAgent({
      messages: mockMessages,
      document: mockDocument,
      relevantLessons: mockRelevantLessons,
    });

    expect(agent.input).toMatchSnapshot();
  });
});
