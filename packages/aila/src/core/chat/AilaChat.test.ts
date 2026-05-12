import { subjectWarnings } from "@oakai/core/src/utils/subjects";

import { AilaThreatDetectionError } from "../../features/threatDetection";
import * as threatDetectionHandling from "../../utils/threatDetection/threatDetectionHandling";
import { AilaChat } from "./AilaChat";

jest.mock("../../utils/threatDetection/threatDetectionHandling", () => ({
  handleThreatDetectionError: jest.fn(),
}));

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

    await expect(
      chat.generationFailed(new Error("Unexpected failure")),
    ).rejects.toThrow("Generation not initialised");
  });
});

describe("AilaChat.handleSubjectWarning", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createChat({
    subject,
    persistedSubject,
  }: {
    subject?: string;
    persistedSubject?: string;
  } = {}) {
    const chat = new AilaChat({
      id: "chat_123",
      userId: "user_123",
      aila: {
        options: {
          quizSources: [],
          useAgenticAila: true,
        },
        document: { content: { subject } },
      } as never,
    });

    if (persistedSubject !== undefined) {
      (
        chat as unknown as {
          _persistedChat: { lessonPlan: { subject: string } };
        }
      )._persistedChat = { lessonPlan: { subject: persistedSubject } };
    }

    return chat;
  }

  it("enqueues no warning when no subject is set", async () => {
    const chat = createChat();
    const enqueueSpy = jest.spyOn(chat, "enqueue").mockResolvedValue();

    await chat.handleSubjectWarning();

    expect(enqueueSpy).not.toHaveBeenCalled();
  });

  it("enqueues no warning for a supported subject", async () => {
    const chat = createChat({ subject: "history" });
    const enqueueSpy = jest.spyOn(chat, "enqueue").mockResolvedValue();

    await chat.handleSubjectWarning();

    expect(enqueueSpy).not.toHaveBeenCalled();
  });

  it("enqueues the unsupportedSubject warning for an unsupported subject", async () => {
    const chat = createChat({ subject: "maths" });
    const enqueueSpy = jest.spyOn(chat, "enqueue").mockResolvedValue();

    await chat.handleSubjectWarning();

    expect(enqueueSpy).toHaveBeenCalledWith({
      type: "prompt",
      message: subjectWarnings.unsupportedSubject,
    });
  });

  it("enqueues the unknownSubject warning for a subject Oak does not cover", async () => {
    const chat = createChat({ subject: "underwater-basket-weaving" });
    const enqueueSpy = jest.spyOn(chat, "enqueue").mockResolvedValue();

    await chat.handleSubjectWarning();

    expect(enqueueSpy).toHaveBeenCalledWith({
      type: "prompt",
      message: subjectWarnings.unknownSubject,
    });
  });

  it("slugify a multi-word subject before matching against the known list", async () => {
    // "Combined Science" → "combined-science", which is in unsupportedSubjects.
    // This guards against regressions in the slug-derivation logic.
    const chat = createChat({ subject: "Combined Science" });
    const enqueueSpy = jest.spyOn(chat, "enqueue").mockResolvedValue();

    await chat.handleSubjectWarning();

    expect(enqueueSpy).toHaveBeenCalledWith({
      type: "prompt",
      message: subjectWarnings.unsupportedSubject,
    });
  });

  it("works if the subject is already a slug", async () => {
    const chat = createChat({ subject: "combined-science" });
    const enqueueSpy = jest.spyOn(chat, "enqueue").mockResolvedValue();

    await chat.handleSubjectWarning();

    expect(enqueueSpy).toHaveBeenCalledWith({
      type: "prompt",
      message: subjectWarnings.unsupportedSubject,
    });
  });

  it("enqueues no warning when the subject is unchanged from the persisted lesson plan", async () => {
    // "maths" would normally warn, but the user has already seen it for this chat.
    const chat = createChat({ subject: "maths", persistedSubject: "maths" });
    const enqueueSpy = jest.spyOn(chat, "enqueue").mockResolvedValue();

    await chat.handleSubjectWarning();

    expect(enqueueSpy).not.toHaveBeenCalled();
  });

  it("enqueues a warning when the subject differs from the persisted lesson plan", async () => {
    const chat = createChat({
      subject: "maths",
      persistedSubject: "history",
    });
    const enqueueSpy = jest.spyOn(chat, "enqueue").mockResolvedValue();

    await chat.handleSubjectWarning();

    expect(enqueueSpy).toHaveBeenCalledWith({
      type: "prompt",
      message: subjectWarnings.unsupportedSubject,
    });
  });
});
