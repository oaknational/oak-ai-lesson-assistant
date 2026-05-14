import { AilaChat } from "./AilaChat";

jest.mock("@oakai/db", () => ({
  prisma: {},
}));

jest.mock("@oakai/db/client", () => ({
  prisma: {},
}));

describe("AilaChat", () => {
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
