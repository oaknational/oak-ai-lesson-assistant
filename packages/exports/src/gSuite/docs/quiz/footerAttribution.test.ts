/**
 * Unit tests for footer attribution functionality
 */
import type { docs_v1 } from "@googleapis/docs";
import { describe, expect, it, jest } from "@jest/globals";

import type { ImageMetadata, QuizQuestion } from "../../../schema/input.schema";
import { addFooterAttribution } from "./footerAttribution";

// Mock the Google Docs API
const mockBatchUpdate =
  jest.fn<
    (
      params: docs_v1.Params$Resource$Documents$Batchupdate,
    ) => Promise<docs_v1.Schema$BatchUpdateDocumentResponse>
  >();
const mockGet = jest.fn<
  (params: docs_v1.Params$Resource$Documents$Get) => Promise<{
    data: docs_v1.Schema$Document;
  }>
>();

const mockGoogleDocs = {
  documents: {
    get: mockGet,
    batchUpdate: mockBatchUpdate,
  },
} as unknown as docs_v1.Docs;

describe("addFooterAttribution", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add attribution to both footers for short content", async () => {
    // Mock document with both footers
    mockGet.mockResolvedValue({
      data: {
        documentStyle: {
          defaultFooterId: "footer1",
          firstPageFooterId: "footer2",
        },
      },
    });

    const questions: QuizQuestion[] = [
      {
        questionType: "multiple-choice",
        question: "What is ![diagram](https://example.com/image1.jpg)?",
        answers: ["Answer A", "Answer B"],
        distractors: [],
        hint: null,
      },
    ];

    const imageAttributions: ImageMetadata[] = [
      {
        imageUrl: "https://example.com/image1.jpg",
        attribution: "Pixabay",
        width: 800,
        height: 600,
      },
    ];

    await addFooterAttribution(
      mockGoogleDocs,
      "doc123",
      questions,
      imageAttributions,
    );

    expect(mockGet).toHaveBeenCalledWith({ documentId: "doc123" });
    expect(mockBatchUpdate).toHaveBeenCalledWith({
      documentId: "doc123",
      requestBody: {
        requests: expect.arrayContaining([
          // Should have requests for both footers
          expect.objectContaining({
            insertText: expect.objectContaining({
              location: expect.objectContaining({
                segmentId: "footer2", // firstPageFooterId
              }),
            }),
          }),
          expect.objectContaining({
            insertText: expect.objectContaining({
              location: expect.objectContaining({
                segmentId: "footer1", // defaultFooterId
              }),
            }),
          }),
        ]),
      },
    });
  });

  it("should add attribution to global footer only for long content", async () => {
    // Mock document with both footers
    mockGet.mockResolvedValue({
      data: {
        documentStyle: {
          defaultFooterId: "footer1",
          firstPageFooterId: "footer2",
        },
      },
    });

    // Create long content (multiple questions to exceed threshold)
    const questions: QuizQuestion[] = Array.from({ length: 15 }, (_, i) => ({
      questionType: "multiple-choice",
      question: `Question ${i + 1} with ![image](https://example.com/image${i + 1}.jpg)?`,
      answers: ["A", "B", "C"],
      distractors: [],
      hint: null,
    }));

    const imageAttributions: ImageMetadata[] = questions.map((_, i) => ({
      imageUrl: `https://example.com/image${i + 1}.jpg`,
      attribution: "Pixabay",
      width: 800,
      height: 600,
    }));

    await addFooterAttribution(
      mockGoogleDocs,
      "doc123",
      questions,
      imageAttributions,
    );

    expect(mockBatchUpdate).toHaveBeenCalledWith({
      documentId: "doc123",
      requestBody: {
        requests: expect.arrayContaining([
          // Should only have requests for default footer
          expect.objectContaining({
            insertText: expect.objectContaining({
              location: expect.objectContaining({
                segmentId: "footer1", // defaultFooterId only
              }),
            }),
          }),
        ]),
      },
    });

    // Verify no requests for firstPageFooterId
    const batchUpdateCall = mockBatchUpdate.mock.calls[0]![0];
    const requests = batchUpdateCall.requestBody!.requests!;
    const firstPageRequests = requests.filter(
      (req) => req.insertText?.location?.segmentId === "footer2",
    );
    expect(firstPageRequests).toHaveLength(0);
  });

  it("should skip when no image attributions exist", async () => {
    mockGet.mockResolvedValue({
      data: {
        documentStyle: {
          defaultFooterId: "footer1",
        },
      },
    });

    const questions: QuizQuestion[] = [
      {
        questionType: "short-answer",
        question: "What is 2 + 2?",
        answers: ["4"],
        hint: null,
      },
    ];

    const imageAttributions: ImageMetadata[] = [];

    await addFooterAttribution(
      mockGoogleDocs,
      "doc123",
      questions,
      imageAttributions,
    );

    expect(mockGet).toHaveBeenCalledWith({ documentId: "doc123" });
    expect(mockBatchUpdate).not.toHaveBeenCalled();
  });

  it("should generate correct text insertion and formatting requests", async () => {
    mockGet.mockResolvedValue({
      data: {
        documentStyle: {
          defaultFooterId: "footer1",
        },
      },
    });

    const questions: QuizQuestion[] = [
      {
        questionType: "multiple-choice",
        question: "What is ![diagram](https://example.com/image1.jpg)?",
        answers: ["Answer A"],
        distractors: [],
        hint: null,
      },
    ];

    const imageAttributions: ImageMetadata[] = [
      {
        imageUrl: "https://example.com/image1.jpg",
        attribution: "Pixabay",
        width: 800,
        height: 600,
      },
    ];

    await addFooterAttribution(
      mockGoogleDocs,
      "doc123",
      questions,
      imageAttributions,
    );

    const batchUpdateCall = mockBatchUpdate.mock.calls[0]![0];
    const requests = batchUpdateCall.requestBody!.requests;

    // Should have requests in exact order: text insertions (reverse), then formatting
    expect(requests).toEqual([
      {
        insertText: {
          location: {
            index: 0,
            segmentId: "footer1",
          },
          text: " Pixabay",
        },
      },
      {
        insertText: {
          location: {
            index: 0,
            segmentId: "footer1",
          },
          text: "Q1 Image 1",
        },
      },
      {
        updateTextStyle: {
          range: {
            segmentId: "footer1",
            startIndex: 0,
            endIndex: 10, // Length of "Q1 Image 1"
          },
          textStyle: {
            bold: true,
          },
          fields: "bold",
        },
      },
    ]);
  });
});
