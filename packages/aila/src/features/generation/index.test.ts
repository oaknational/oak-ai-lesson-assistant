import { Aila } from "../../core/Aila";
import type { Message } from "../../core/chat";
import { AilaChat } from "../../core/chat";
import type { AilaInitializationOptions } from "../../core/types";
import { AilaGeneration } from "./AilaGeneration";

const ailaArgs: AilaInitializationOptions = {
  plugins: [],
  chat: {
    id: "chat_1",
    userId: "user_1",
  },
};

describe("calculateTokenUsage", () => {
  // correctly calculates prompt tokens from chat messages
  it("should correctly calculate prompt tokens from chat messages", () => {
    const messages: Message[] = [
      { id: "1", role: "user", content: "Hello" },
      { id: "2", role: "user", content: "How are you?" },
    ];

    const mockEncoding = {
      encode: jest
        .fn()
        .mockImplementation((text: string) => text.split(" ").length),
    };
    jest.mock("js-tiktoken", () => ({
      getEncoding: () => mockEncoding,
    }));

    const aila = new Aila(ailaArgs);
    const chat = new AilaChat({
      messages,
      aila,
      id: aila.chat.id,
      userId: aila.chat.userId,
    });
    const ailaGeneration = new AilaGeneration({
      aila,
      id: "test-id",
      status: "PENDING",
      chat,
      systemPrompt: "Test system prompt",
      promptId: "test",
    });
    ailaGeneration.complete({
      status: "SUCCESS",
      responseText: "I am fine, thank you!",
    });
    expect(ailaGeneration.tokenUsage.promptTokens).not.toBe(7);
  });

  // correctly calculates completion tokens from response text
  it("should correctly calculate completion tokens from response text", () => {
    const messages: Message[] = [
      { id: "1", role: "user", content: "Hello" },
      { id: "2", role: "user", content: "How are you?" },
    ];

    const mockEncoding = {
      encode: jest
        .fn()
        .mockImplementation((text: string) => text.split(" ").length),
    };
    jest.mock("js-tiktoken", () => ({
      getEncoding: () => mockEncoding,
    }));

    const aila = new Aila(ailaArgs);
    const chat = new AilaChat({
      messages,
      aila,
      id: ailaArgs.chat.id,
      userId: ailaArgs.chat.userId,
    });
    const ailaGeneration = new AilaGeneration({
      aila,
      id: "test-id",
      status: "PENDING",
      chat,
      systemPrompt: "Test system prompt",
      promptId: "test",
    });
    ailaGeneration.complete({
      status: "SUCCESS",
      responseText: "I am fine, thank you!",
    });
    expect(ailaGeneration.tokenUsage.completionTokens).toBe(7);
  });
});
