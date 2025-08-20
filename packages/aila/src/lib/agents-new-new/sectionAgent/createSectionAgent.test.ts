import { describe, expect, it } from "@jest/globals";

import type { ChatMessage } from "../types";
import { sectionAgentToGenericAgent } from "./createSectionAgent";
import { keywordsAgent } from "./keywordsAgent";

describe("sectionAgentToGenericAgent", () => {
  const mockMessages: ChatMessage[] = [
    { role: "user", content: "Can you help me add keywords to this lesson?" },
    {
      role: "assistant",
      content: "Of course! I'll help you create appropriate keywords.",
    },
    { role: "user", content: "This is about photosynthesis in plants." },
  ];

  const mockCurrentValue = [
    {
      keyword: "Photosynthesis",
      definition:
        "The process by which plants make their own food using sunlight",
    },
    {
      keyword: "Chlorophyll",
      definition: "The green pigment in plants that captures sunlight",
    },
  ];

  const mockExemplarContent = [
    [
      {
        keyword: "Adaptation",
        definition:
          "Changes that help living things survive in their environment",
      },
      {
        keyword: "Habitat",
        definition: "The place where an animal or plant lives",
      },
    ],
    [
      { keyword: "Carnivore", definition: "An animal that eats only meat" },
      { keyword: "Herbivore", definition: "An animal that eats only plants" },
    ],
  ];

  const mockBasedOnContent = [
    { keyword: "Plant", definition: "A living thing that makes its own food" },
    {
      keyword: "Leaf",
      definition: "The part of a plant that catches sunlight",
    },
  ];

  it("should create a generic agent for keywords section", () => {
    const sectionAgentInstance = keywordsAgent({
      exemplarContent: mockExemplarContent,
      basedOnContent: mockBasedOnContent,
      currentValue: mockCurrentValue,
      messages: mockMessages,
    });

    const genericAgent = sectionAgentToGenericAgent(sectionAgentInstance);

    expect(genericAgent.input).toMatchSnapshot();
  });

  it("should handle empty current value", () => {
    const sectionAgentInstance = keywordsAgent({
      exemplarContent: mockExemplarContent,
      basedOnContent: mockBasedOnContent,
      currentValue: [],
      messages: mockMessages,
    });

    const genericAgent = sectionAgentToGenericAgent(sectionAgentInstance);

    expect(genericAgent.input).toMatchSnapshot();
  });

  it("should handle empty basedOnContent", () => {
    const sectionAgentInstance = keywordsAgent({
      exemplarContent: mockExemplarContent,
      basedOnContent: [],
      currentValue: mockCurrentValue,
      messages: mockMessages,
    });

    const genericAgent = sectionAgentToGenericAgent(sectionAgentInstance);

    expect(genericAgent.input).toMatchSnapshot();
  });

  it("should handle empty messages", () => {
    const sectionAgentInstance = keywordsAgent({
      exemplarContent: mockExemplarContent,
      basedOnContent: mockBasedOnContent,
      currentValue: mockCurrentValue,
      messages: [],
    });

    const genericAgent = sectionAgentToGenericAgent(sectionAgentInstance);

    expect(genericAgent.input).toMatchSnapshot();
  });

  it("should handle empty exemplar content", () => {
    const sectionAgentInstance = keywordsAgent({
      exemplarContent: [],
      basedOnContent: mockBasedOnContent,
      currentValue: mockCurrentValue,
      messages: mockMessages,
    });

    const genericAgent = sectionAgentToGenericAgent(sectionAgentInstance);

    expect(genericAgent.input).toMatchSnapshot();
  });
});
