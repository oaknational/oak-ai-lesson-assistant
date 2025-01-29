import type { AilaStreamingStatus } from "..";
import type { AiMessage } from "../types";

export function calculateStreamingStatus(
  currentMessageData: AiMessage | null,
): AilaStreamingStatus {
  // Determine streaming status
  if (!currentMessageData) {
    return "Loading";
  } else if (currentMessageData.role === "user") {
    return "RequestMade";
  } else if (currentMessageData.content.includes("MODERATION_START")) {
    return "Moderating";
  } else if (currentMessageData.content.includes("experimentalPatch")) {
    return "StreamingExperimentalPatches";
  } else if (
    currentMessageData.content.includes('"type":"prompt"') ||
    currentMessageData.content.includes('\\"type\\":\\"prompt\\"')
  ) {
    return "StreamingChatResponse";
  } else if (currentMessageData.content.includes("CHAT_START")) {
    return "StreamingLessonPlan";
  } else {
    return "Loading";
  }
  // TODO: look at isLoading to determine idle?
}
