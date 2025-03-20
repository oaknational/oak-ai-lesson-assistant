import { type StoreApi } from "zustand";

import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";
import { buildStoreGetter } from "@/stores/AilaStoresProvider";
import type { ChatState } from "@/stores/chatStore";
import type { LessonPlanState } from "@/stores/lessonPlanStore";

import { createLessonPlanTrackingStore } from "..";
import { lessonPlans, messages } from "./fixtures";

const chatStoreMock = {
  getState: jest.fn(),
};
const lessonPlanStoreMock = {
  getState: jest.fn(),
};

const createArgs: Parameters<typeof createLessonPlanTrackingStore>[0] = {
  id: "test_id",
  getStore: buildStoreGetter({
    chat: chatStoreMock as unknown as StoreApi<ChatState>,
    lessonPlan: lessonPlanStoreMock as unknown as StoreApi<LessonPlanState>,
  }),

  track: {
    lessonPlanInitiated: jest.fn(),
    lessonPlanRefined: jest.fn(),
    lessonPlanCompleted: jest.fn(),
    lessonPlanTerminated: jest.fn(),
  } as unknown as TrackFns,
};

const commonTrackingFields = {
  chatId: "test_id",
  product: "ai lesson assistant",
};
const ragTrackingFields = {
  keyStageSlug: "ks3",
  lessonPlanTitle: "Roman Britain",
  subjectSlug: "history",
};

describe("lessonPlanTracking tracking", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.skip("throws an error if there isn't a currentMessage", () => {
    const store = createLessonPlanTrackingStore(createArgs);
    const actions = store.getState().actions;

    expect(() => actions.trackCompletion()).toThrow("No current message");
  });

  it.skip("throws an error if no assistant message was found", () => {
    const store = createLessonPlanTrackingStore(createArgs);
    const actions = store.getState().actions;

    expect(() => actions.trackCompletion()).toThrow(
      "No assistant message content found",
    );
  });

  describe("lessonPlanInitiated", () => {
    it("tracks when started from an example", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const actions = store.getState().actions;

      actions.clickedStart(
        "Create a lesson plan about the end of Roman Britain for key stage 3 history",
      );

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [
          {
            role: "user",
            content:
              "Create a lesson plan about the end of Roman Britain for key stage 3 history",
          },
          messages.assistant1,
        ],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: {
          title: "Roman Britain",
          subject: "history",
          keyStage: "key-stage-3",
        },
      });

      actions.trackCompletion();

      expect(createArgs.track.lessonPlanInitiated).toHaveBeenCalledWith({
        componentType: "example_lesson_button",
        text: "Create a lesson plan about the end of Roman Britain for key stage 3 history",
        moderatedContentType: null,
        ...ragTrackingFields,
        ...commonTrackingFields,
      });
    });

    it("tracks when started from free text", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const actions = store.getState().actions;

      actions.clickedStart("Make me a custom lesson plan about Roman Britain");

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [messages.user1, messages.assistant1],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: {
          title: "Roman Britain",
          subject: "history",
          keyStage: "key-stage-3",
        },
      });

      actions.trackCompletion();

      expect(createArgs.track.lessonPlanInitiated).toHaveBeenCalledWith({
        componentType: "text_input",
        text: "Make me a custom lesson plan about Roman Britain",
        moderatedContentType: null,
        ...ragTrackingFields,
        ...commonTrackingFields,
      });
    });
  });

  describe("lessonPlanRefined", () => {
    it("tracks when selecting a RAG lesson", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const actions = store.getState().actions;

      actions.submittedText("1");

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [
          messages.user1,
          {
            role: "assistant",
            content: "Please pick from the following options:",
            // TODO: add realistic parts
            parts: [],
          },
          {
            role: "user",
            content: "1",
          },
          {
            role: "assistant",
            content: "Here's your lesson",
            parts: [
              {
                document: {
                  type: "patch",
                  value: {
                    path: "/basedOn",
                    op: "add",
                    value: {
                      id: "based-on-test-id",
                      title: "Oak Lesson on Romans",
                    },
                  },
                },
              },
            ],
          },
        ],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: {
          title: "Roman Britain",
          subject: "history",
          keyStage: "key-stage-3",
          basedOn: {
            id: "based-on-test-id",
            title: "Oak Lesson on Romans",
          },
        },
      });

      actions.trackCompletion();

      expect(createArgs.track.lessonPlanRefined).toHaveBeenCalledWith({
        componentType: "select_oak_lesson",
        text: "1",
        moderatedContentType: null,
        refinements: [
          {
            refinementPath: "/basedOn",
            refinementType: "add",
          },
        ],
        ...ragTrackingFields,
        ...commonTrackingFields,
      });
    });

    it("tracks when typing free text", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const actions = store.getState().actions;

      actions.submittedText("Add more castles");

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [
          messages.user1,
          messages.assistant1,
          messages.user2Refinement,
          messages.assistant2Refinement,
        ],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: {
          title: "Roman Britain",
          subject: "history",
          keyStage: "key-stage-3",
        },
      });

      actions.trackCompletion();

      expect(createArgs.track.lessonPlanRefined).toHaveBeenCalledWith({
        componentType: "type_edit",
        text: "Add more castles",
        // TODO: Add example refinements
        refinements: [],
        moderatedContentType: null,
        ...ragTrackingFields,
        ...commonTrackingFields,
      });
    });

    it("tracks when continuing", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const actions = store.getState().actions;

      actions.clickedContinue();

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [
          messages.user1,
          messages.assistant1,
          messages.user2Continue,
          messages.assistant2Refinement,
        ],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: {
          title: "Roman Britain",
          subject: "history",
          keyStage: "key-stage-3",
        },
      });

      actions.trackCompletion();

      expect(createArgs.track.lessonPlanRefined).toHaveBeenCalledWith({
        componentType: "continue_button",
        text: "",
        // TODO: Add example refinements
        refinements: [],
        moderatedContentType: null,
        ...ragTrackingFields,
        ...commonTrackingFields,
      });
    });
  });

  describe("lessonPlanCompleted", () => {
    it("tracks when the lesson plan becomes completed", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      store.setState({
        lastLessonPlan: { ...lessonPlans.completed, exitQuiz: undefined },
      });
      const actions = store.getState().actions;

      actions.clickedContinue();

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [
          messages.user1,
          messages.assistant1,
          messages.user2Continue,
          messages.assistant2Refinement,
        ],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: lessonPlans.completed,
      });
      actions.trackCompletion();

      expect(createArgs.track.lessonPlanCompleted).toHaveBeenCalledWith({
        moderatedContentType: null,
        // TODO: fixture is for software testing techniques
        ...ragTrackingFields,
        ...commonTrackingFields,
      });
    });

    it("doesn't track when the lesson plan is not completed", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const lessonPlanWithoutExitQuiz = {
        ...lessonPlans.completed,
        exitQuiz: undefined,
      };
      store.setState({
        lastLessonPlan: lessonPlanWithoutExitQuiz,
      });
      const actions = store.getState().actions;

      // TODO: less plan state diff
      actions.clickedContinue();

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [
          messages.user1,
          messages.assistant1,
          messages.user2Continue,
          messages.assistant2Refinement,
        ],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: lessonPlanWithoutExitQuiz,
      });
      actions.trackCompletion();

      expect(createArgs.track.lessonPlanCompleted).not.toHaveBeenCalled();
    });

    it("doesn't track when the lesson plan is already completed", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      store.setState({
        lastLessonPlan: lessonPlans.completed,
      });
      const actions = store.getState().actions;

      actions.clickedContinue();

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [
          messages.user1,
          messages.assistant1,
          messages.user2Continue,
          messages.assistant2Refinement,
        ],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: lessonPlans.completed,
      });
      actions.trackCompletion();

      expect(createArgs.track.lessonPlanCompleted).not.toHaveBeenCalled();
    });
  });

  describe("modifying", () => {
    it.todo("tracks when using the modify drop down");
  });

  describe("lessonPlanTerminated", () => {
    it("tracks when the account is locked", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const actions = store.getState().actions;

      actions.trackCompletion();

      expect(createArgs.track.lessonPlanTerminated).toHaveBeenCalledWith({});
    });

    it("tracks when there's a toxic moderation", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const actions = store.getState().actions;

      actions.trackCompletion();

      expect(createArgs.track.lessonPlanTerminated).toHaveBeenCalledWith({});
    });

    // NOTE: not applicable as a threat doesn't terminate the chat
    it.skip("tracks when a threat is detected");
  });
});
