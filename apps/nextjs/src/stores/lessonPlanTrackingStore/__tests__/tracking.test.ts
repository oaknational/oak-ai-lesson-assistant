import { type StoreApi } from "zustand";

import { modifyOptions } from "@/components/AppComponents/Chat/drop-down-section/action-button.types";
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

  // Skipped for now until we know it doesn't trigger in production
  // For example with the Additional Materials dropdown
  it.skip("throws an error if there isn't a currentMessage", () => {
    const store = createLessonPlanTrackingStore(createArgs);
    const actions = store.getState().actions;

    expect(() => actions.trackCompletion()).toThrow("No current message");
  });

  describe("lessonPlanInitiated", () => {
    it("tracks when started from an example", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const actions = store.getState().actions;

      actions.clickedStart(
        "Create a lesson plan about the end of Roman Britain for key stage 3 history",
      );

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [messages.user1RomansExample, messages.assistant1],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: lessonPlans.categorised,
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
        lessonPlan: lessonPlans.categorised,
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
    it("tracks SELECT_OAK_LESSON when selecting a RAG lesson", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const actions = store.getState().actions;

      actions.submittedText("1");

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [
          messages.user1,
          messages.assistant1RagOptions,
          messages.user2SelectRagOption,
          messages.assistant2RagResult,
        ],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: lessonPlans.ragResult,
      });

      actions.trackCompletion();

      expect(createArgs.track.lessonPlanRefined).toHaveBeenCalledWith(
        expect.objectContaining({
          componentType: "select_oak_lesson",
          text: "1",
        }),
      );
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
        lessonPlan: lessonPlans.categorised,
      });

      actions.trackCompletion();

      expect(createArgs.track.lessonPlanRefined).toHaveBeenCalledWith({
        componentType: "type_edit",
        text: "Add more castles",
        refinements: [
          {
            refinementPath: "/learningOutcome",
            refinementType: "replace",
          },
        ],
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
        lessonPlan: lessonPlans.ragResult,
      });

      actions.trackCompletion();

      expect(createArgs.track.lessonPlanRefined).toHaveBeenCalledWith({
        componentType: "continue_button",
        text: "",
        refinements: [
          {
            refinementPath: "/learningOutcome",
            refinementType: "replace",
          },
        ],
        moderatedContentType: null,
        ...ragTrackingFields,
        ...commonTrackingFields,
      });
    });

    describe("tracking modifications from the dropdown", () => {
      it("tracks a modification from the dropdown", () => {
        const store = createLessonPlanTrackingStore(createArgs);
        const actions = store.getState().actions;

        actions.clickedModify(modifyOptions[0], "");

        chatStoreMock.getState.mockReturnValue({
          stableMessages: [
            messages.user1,
            messages.assistant1,
            messages.user2Modify,
            messages.assistant2ModifyResponse,
          ],
        });
        lessonPlanStoreMock.getState.mockReturnValue({
          lessonPlan: lessonPlans.categorised,
        });

        actions.trackCompletion();

        expect(createArgs.track.lessonPlanRefined).toHaveBeenCalledWith({
          componentType: "modify_button",
          text: "Make it easier",
          refinements: [
            {
              refinementPath: "/cycle1",
              refinementType: "replace",
            },
          ],
          moderatedContentType: null,
          ...ragTrackingFields,
          ...commonTrackingFields,
        });
      });

      it("tracks a custom modification", () => {
        const store = createLessonPlanTrackingStore(createArgs);
        const actions = store.getState().actions;

        actions.clickedModify(
          { label: "Other", enumValue: "OTHER" },
          "Add more detail",
        );

        chatStoreMock.getState.mockReturnValue({
          stableMessages: [
            messages.user1,
            messages.assistant1,
            messages.user2Modify,
            messages.assistant2ModifyResponse,
          ],
        });
        lessonPlanStoreMock.getState.mockReturnValue({
          lessonPlan: lessonPlans.categorised,
        });

        actions.trackCompletion();

        expect(createArgs.track.lessonPlanRefined).toHaveBeenCalledWith({
          componentType: "modify_button",
          text: "Add more detail",
          refinements: [
            {
              refinementPath: "/cycle1",
              refinementType: "replace",
            },
          ],
          moderatedContentType: null,
          ...ragTrackingFields,
          ...commonTrackingFields,
        });
      });
    });
  });

  describe("lessonPlanCompleted", () => {
    it("tracks when the lesson plan becomes completed", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      store.setState({
        lastLessonPlan: lessonPlans.completedExceptExitQuiz,
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
        keyStageSlug: "ks4",
        lessonPlanTitle: "Software Testing Techniques",
        subjectSlug: "computing",
        ...commonTrackingFields,
      });
    });

    it("doesn't track when the lesson plan is not completed", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      store.setState({
        lastLessonPlan: lessonPlans.completedExceptExitQuiz,
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
        lessonPlan: lessonPlans.completedExceptExitQuiz,
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

  describe("lessonPlanTerminated", () => {
    it("tracks when the account is locked", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const actions = store.getState().actions;

      actions.submittedText("Do something inappropriate");

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [
          messages.user1Inappropriate,
          messages.assistant1AccountLocked,
        ],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: {},
      });
      actions.trackCompletion();

      expect(createArgs.track.lessonPlanTerminated).toHaveBeenCalledWith({
        chatId: "test_id",
        isThreatDetected: false,
        isToxicContent: false,
        isUserBlocked: true,
      });
    });

    it("tracks when there's a toxic moderation", () => {
      const store = createLessonPlanTrackingStore(createArgs);
      const actions = store.getState().actions;

      actions.submittedText("Do something inappropriate");

      chatStoreMock.getState.mockReturnValue({
        stableMessages: [
          messages.user1Inappropriate,
          messages.assistant1ToxicModeration,
        ],
      });
      lessonPlanStoreMock.getState.mockReturnValue({
        lessonPlan: {},
      });
      actions.trackCompletion();

      expect(createArgs.track.lessonPlanTerminated).toHaveBeenCalledWith({
        chatId: "test_id",
        isThreatDetected: false,
        isToxicContent: true,
        isUserBlocked: false,
      });
    });

    // NOTE: in the payload but not applicable as a threat doesn't terminate the chat
    it.todo("tracks when a threat is detected");
  });
});
