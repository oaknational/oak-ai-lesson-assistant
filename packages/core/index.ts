import { notifyModeration } from "./src/functions/slack/notifyModeration";
import { notifyModerationTeachingMaterials } from "./src/functions/slack/notifyModerationTeachingMaterials";
import { notifyRateLimit } from "./src/functions/slack/notifyRateLimit";
import { notifyThreatDetectionAila } from "./src/functions/slack/notifyThreatDetectionAila";
import { notifyThreatDetectionTeachingMaterials } from "./src/functions/slack/notifyThreatDetectionTeachingMaterials";
import { notifyUserBan } from "./src/functions/slack/notifyUserBan";

export { inngest } from "./src/inngest";
export * from "./src/data/subjectsAndKeyStages";
export * from "./src/models";

export const functions = [
  notifyModeration,
  notifyThreatDetectionAila,
  notifyThreatDetectionTeachingMaterials,
  notifyModerationTeachingMaterials,
  notifyRateLimit,
  notifyUserBan,
];
