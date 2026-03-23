import { AilaThreatDetectionError } from "../../features/threatDetection";
import * as threatDetectionHandling from "../../utils/threatDetection/threatDetectionHandling";
import { AilaChat } from "./AilaChat";

describe("AilaChat.generationFailed", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("handles threat detection errors before generation is initialised", async () => {
    const chat = new AilaChat({
      id: "chat_123",
      userId: "user_123",
      messages: [
        {
          id: "msg_1",
          role: "user",
          content: "test prompt",
        },
      ],
      aila: {
        options: {
          quizSources: [],
          useAgenticAila: true,
        },
      } as never,
    });

    const handledThreatMessage = {
      type: "error" as const,
      value: "Threat detected",
      message: "Threat was detected",
    };

    const handleThreatDetectionErrorSpy = jest
      .spyOn(threatDetectionHandling, "handleThreatDetectionError")
      .mockResolvedValue(handledThreatMessage);
    const enqueueSpy = jest.spyOn(chat, "enqueue").mockResolvedValue();

    await expect(
      chat.generationFailed(
        new AilaThreatDetectionError("user_123", "Potential threat detected"),
      ),
    ).resolves.toBeUndefined();

    expect(handleThreatDetectionErrorSpy).toHaveBeenCalledWith({
      userId: "user_123",
      chatId: "chat_123",
      error: expect.any(AilaThreatDetectionError),
      messages: chat.messages,
    });
    expect(enqueueSpy).toHaveBeenCalledWith(handledThreatMessage);
  });

  it("still requires generation for non-threat errors", async () => {
    const chat = new AilaChat({
      id: "chat_123",
      userId: "user_123",
      aila: {
        options: {
          quizSources: [],
          useAgenticAila: true,
        },
      } as never,
    });

    await expect(chat.generationFailed(new Error("Unexpected failure"))).rejects
      .toThrow("Generation not initialised");
  });
});
