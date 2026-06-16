import type { AiMessage } from "@/stores/chatStore/types";
import type { TrpcUtils } from "@/utils/trpc";

import { createLessonPlanStore } from "..";
import type { LessonPlanState } from "../types";

const trpcUtils = {} as unknown as TrpcUtils;

const recordSeparator = "␞";

function assistantMessage(parts: object[]): AiMessage {
  return {
    id: "msg-1",
    role: "assistant",
    content: parts.map((p) => JSON.stringify(p)).join(recordSeparator),
  };
}

const setupStore = (initialValues?: Partial<LessonPlanState>) =>
  createLessonPlanStore({ id: "test-id", trpcUtils, initialValues });

const basedOn = { id: "old-1", title: "Angles in triangles" };

describe("lessonPlanStore messagesUpdated", () => {
  it("removes the basedOn attribution when a remove patch streams", () => {
    const store = setupStore({
      lessonPlan: { title: "Angle bisectors", basedOn },
      isAcceptingChanges: true,
    });

    store.getState().actions.messagesUpdated([
      assistantMessage([
        {
          type: "patch",
          reasoning: "stale basedOn cleared",
          value: { op: "remove", path: "/basedOn" },
          status: "complete",
        },
      ]),
    ]);

    expect(store.getState().lessonPlan.basedOn).toBeUndefined();
    expect(store.getState().lessonPlan.title).toBe("Angle bisectors");
  });

  it("shows a basedOn only after an add patch streams", () => {
    const store = setupStore({
      lessonPlan: { title: "Angle bisectors" },
      isAcceptingChanges: true,
    });

    expect(store.getState().lessonPlan.basedOn).toBeUndefined();

    store.getState().actions.messagesUpdated([
      assistantMessage([
        {
          type: "patch",
          reasoning: "user selected a lesson to adapt",
          value: { op: "add", path: "/basedOn", value: basedOn },
          status: "complete",
        },
      ]),
    ]);

    expect(store.getState().lessonPlan.basedOn).toEqual(basedOn);
  });
});
