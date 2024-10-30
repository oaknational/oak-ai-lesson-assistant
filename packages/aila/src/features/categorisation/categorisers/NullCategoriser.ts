import type { Message } from "../../../core/chat";
import type { LooseLessonPlan } from "../../../protocol/schema";
import type { AilaCategorisationFeature } from "../../types";

export class NullCategoriser implements AilaCategorisationFeature {
  public async categorise(
    messages: Message[],
  ): Promise<LooseLessonPlan | undefined> {
    if (messages.length === 0) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve({
      keyStage: "key-stage-1",
      subject: "geography",
      title: "Warning: this is a default lesson plan",
      topic: "Warning: this is default topic",
    });
  }
}
