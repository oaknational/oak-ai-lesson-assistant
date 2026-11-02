import { Aila } from "@oakai/aila/src/core/Aila";
import type { Message } from "@oakai/aila/src/core/chat/types";
import type { AilaInitializationOptions } from "@oakai/aila/src/core/types";
import { ailaTurn } from "@oakai/aila/src/lib/agentic-system/ailaTurn";
import type { JsonPatchDocumentOptional } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { PartialLessonPlan } from "@oakai/aila/src/protocol/schema";
import { createOpenAIClient } from "@oakai/core/src/llm/openai";

import { NextRequest } from "next/server";
import OpenAI from "openai";

import { handleChatPostRequest } from "./chatHandler";
import type { Config } from "./configTypes";
import { fetchAndCheckUser } from "./user";

const chatId = "test-chat-id";
const userId = "test-user-id";

const savedLessonPlan: PartialLessonPlan = {
  title: "Glaciers",
  subject: "geography",
  keyStage: "key-stage-3",
};
const savedMessages: Message[] = [
  { id: "u-1", role: "user", content: "Create a lesson about glaciers" },
  {
    id: "a-1",
    role: "assistant",
    content: JSON.stringify({
      type: "llmMessage",
      sectionsToEdit: [],
      patches: [],
      sectionsEdited: [],
      prompt: { type: "text", value: "Here's your lesson plan." },
      status: "complete",
    }),
  },
];
const newUserMessage: Message = {
  id: "u-2",
  role: "user",
  content: "Call it Glaciation",
};
const newTitle = "Glaciation";

jest.mock("./user", () => ({
  fetchAndCheckUser: jest.fn(),
}));

jest.mock("@oakai/api/src/utils/serverSideFeatureFlag", () => ({
  serverSideFeatureFlag: jest.fn(),
}));

jest.mock("@oakai/core/src/llm/openai", () => ({
  ...jest.requireActual<object>("@oakai/core/src/llm/openai"),
  createOpenAIClient: jest.fn(),
}));

jest.mock("@oakai/aila/src/lib/agentic-system/ailaTurn", () => ({
  ailaTurn: jest.fn(),
}));

jest.mock(
  "@oakai/aila/src/features/threatDetection/detectors/modelArmor/ModelArmorThreatDetector",
  () => ({
    ModelArmorThreatDetector: jest.fn().mockImplementation(() => ({
      detectThreat: jest.fn(),
    })),
  }),
);

const mockedAilaTurn = jest.mocked(ailaTurn);

type StreamedAssistantMessage = {
  type: "llmMessage";
  patches: { value: { op: string; path: string; value?: unknown } }[];
  prompt: { type: "text"; value: string };
};

/**
 * Splits the response body into what the client receives: events framed by
 * ␞, and the assistant's message streamed between them. Every non-blank
 * segment must be valid JSON, so a malformed message fails the test.
 */
function parseStreamedEvents(
  body: string,
): (JsonPatchDocumentOptional | StreamedAssistantMessage)[] {
  const text = body
    .split("\n")
    .filter((line) => line.startsWith("0:"))
    .map((line) => JSON.parse(line.slice(2)) as string)
    .join("");
  return text
    .split("␞")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map(
      (segment) =>
        JSON.parse(segment) as
          JsonPatchDocumentOptional | StreamedAssistantMessage,
    );
}

describe("Chat API Route", () => {
  let testConfig: Config;
  let createdAila: Aila | undefined;
  let lessonSnapshotCreate: jest.Mock;

  beforeEach(() => {
    createdAila = undefined;

    // resetMocks clears factory implementations, so set them here
    jest.mocked(fetchAndCheckUser).mockResolvedValue(userId);
    jest
      .mocked(createOpenAIClient)
      .mockImplementation(() => new OpenAI({ apiKey: "test" }));

    // The callback sequence a real turn produces: the planner opens the
    // message, the section emits its patch, and the final document is the
    // starting document with that edit applied
    mockedAilaTurn.mockImplementation(async ({ persistedState, callbacks }) => {
      callbacks.onPlannerComplete({ sectionKeys: ["title"] });
      callbacks.onSectionComplete([
        { op: "replace", path: "/title", value: newTitle },
      ]);
      await callbacks.onTurnComplete({
        stepsExecuted: [
          {
            type: "section",
            sectionKey: "title",
            action: "generate",
            sectionInstructions: null,
          },
        ],
        document: { ...persistedState.initialDocument, title: newTitle },
        ailaMessage: "I've renamed the lesson.",
      });
      return {
        status: "success",
        correctorStats: { attempted: [], notNeeded: [], failed: [] },
      };
    });

    lessonSnapshotCreate = jest
      .fn()
      .mockResolvedValue({ id: "lesson_snapshot_1" });

    testConfig = {
      // Builds Aila from what the handler passes in, so the test checks
      // the identity, history and lesson the handler loaded
      createAila: jest
        .fn()
        .mockImplementation(
          async (options: Partial<AilaInitializationOptions>) => {
            const ailaInstance = new Aila({
              prisma: options.prisma!,
              options: {
                usePersistence: false,
                useAnalytics: false,
                useModeration: false,
                useErrorReporting: false,
                useThreatDetection: false,
              },
              chat: options.chat!,
              document: options.document,
              plugins: [],
            });
            await ailaInstance.initialise();
            createdAila = ailaInstance;
            return ailaInstance;
          },
        ),
      prisma: {
        appSession: {
          findUnique: jest.fn().mockResolvedValue({
            id: chatId,
            userId,
            output: {
              id: chatId,
              path: `/aila/${chatId}`,
              title: savedLessonPlan.title,
              userId,
              createdAt: 1767225600000,
              lessonPlan: savedLessonPlan,
              messages: savedMessages,
            },
            threatDetections: [],
          }),
          update: jest.fn(),
        },
        prompt: {
          findFirst: jest.fn().mockResolvedValue({ id: "prompt_1" }),
        },
        lessonSchema: {
          findFirst: jest.fn().mockResolvedValue({ id: "lesson_schema_1" }),
          create: jest.fn(),
        },
        lessonSnapshot: {
          create: lessonSnapshotCreate,
        },
      } as unknown as Config["prisma"],
    };
  });

  it("continues a saved chat with an agentic turn and keeps client, server and snapshot in step", async () => {
    const mockRequest = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        id: chatId,
        messages: [...savedMessages, newUserMessage],
        options: {},
      }),
    });

    const response = await handleChatPostRequest(mockRequest, testConfig);

    expect(response.status).toBe(200);
    const events = parseStreamedEvents(await response.text());

    expect(events.some((event) => event.type === "error")).toBe(false);
    expect(events).toContainEqual({ type: "comment", value: "CHAT_COMPLETE" });

    // The handler authenticated the user and loaded the saved chat
    expect(fetchAndCheckUser).toHaveBeenCalledWith(chatId);
    expect(createdAila?.userId).toBe(userId);
    expect(mockedAilaTurn).toHaveBeenCalledTimes(1);
    const { persistedState } = mockedAilaTurn.mock.calls[0]![0];
    expect(persistedState.initialDocument).toEqual(savedLessonPlan);
    // Saved history, with assistant replies reduced to their text, then the
    // new message
    expect(persistedState.messages).toEqual([
      expect.objectContaining(savedMessages[0]),
      expect.objectContaining({
        id: "a-1",
        role: "assistant",
        content: "Here's your lesson plan.",
      }),
      expect.objectContaining(newUserMessage),
    ]);

    // The assistant's reply reached the client with its edit and message
    const assistantReplies = events.filter(
      (event) => event.type === "llmMessage",
    );
    expect(assistantReplies).toEqual([
      expect.objectContaining({
        patches: [
          expect.objectContaining({
            value: { op: "replace", path: "/title", value: newTitle },
          }),
        ],
        prompt: { type: "text", value: "I've renamed the lesson." },
      }),
    ]);

    // The client, the server document and the snapshot agree
    const expectedLesson = { ...savedLessonPlan, title: newTitle };
    const finalState = events.find((event) => event.type === "state");
    expect(finalState).toMatchObject({ value: expectedLesson });
    expect(createdAila?.document.content).toEqual(expectedLesson);
    const assistantMessage = createdAila?.messages.at(-1);
    expect(assistantMessage?.role).toBe("assistant");
    expect(lessonSnapshotCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId,
        chatId,
        messageId: assistantMessage?.id,
        lessonJson: expectedLesson,
      }),
    });
  }, 60000);
});
