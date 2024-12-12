import type { OpenAI } from "openai";

import { getEmbedding } from "./embedding";

// Mocked OpenAI client
const mockOpenAI = {
  embeddings: {
    create: jest.fn(),
  },
} as unknown as OpenAI;

describe("getEmbedding", () => {
  const mockText = "This is a test text.";
  const mockEmbedding = Array(256).fill(0.1); // Example embedding

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the embedding for valid input", async () => {
    (mockOpenAI.embeddings.create as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          embedding: mockEmbedding,
        },
      ],
    });

    const result = await getEmbedding({ text: mockText, openai: mockOpenAI });

    expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
      model: "text-embedding-3-large",
      dimensions: 256,
      input: mockText,
      encoding_format: "float",
    });

    expect(result).toEqual(mockEmbedding);
  });

  it("throws an error if no embedding is returned", async () => {
    (mockOpenAI.embeddings.create as jest.Mock).mockResolvedValueOnce({
      data: [],
    });

    await expect(
      getEmbedding({ text: mockText, openai: mockOpenAI }),
    ).rejects.toThrow("Failed to get embedding");
  });

  it("handles API errors gracefully", async () => {
    (mockOpenAI.embeddings.create as jest.Mock).mockRejectedValueOnce(
      new Error("API Error"),
    );

    await expect(
      getEmbedding({ text: mockText, openai: mockOpenAI }),
    ).rejects.toThrow("API Error");
  });
});
