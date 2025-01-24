import type { AilaStreamingStatus } from "..";
import type { AiMessage } from "../types";

export function calculateStreamingStatus(
  currentMessageData: AiMessage | null,
  streamingStatus: AilaStreamingStatus,
) {
  // Determine streaming status
  if (!currentMessageData) {
    streamingStatus = "Loading";
  } else if (currentMessageData.role === "user") {
    streamingStatus = "RequestMade";
  } else if (currentMessageData.content.includes("MODERATION_START")) {
    streamingStatus = "Moderating";
  } else if (currentMessageData.content.includes("experimentalPatch")) {
    streamingStatus = "StreamingExperimentalPatches";
  } else if (
    currentMessageData.content.includes('"type":"prompt"') ||
    currentMessageData.content.includes('\\"type\\":\\"prompt\\"')
  ) {
    streamingStatus = "StreamingChatResponse";
  } else if (currentMessageData.content.includes("CHAT_START")) {
    streamingStatus = "StreamingLessonPlan";
  } else {
    streamingStatus = "Loading";
  }
  return streamingStatus;
}
