import type { ZodEventSchemas } from "inngest";
import { z } from "zod";

import { notifyModerationSchema } from "./slack/notifyModeration.schema";
import { notifyModerationTeachingMaterialsSchema } from "./slack/notifyModerationTeachingMaterials.schema";
import { notifyRateLimitSchema } from "./slack/notifyRateLimit.schema";
import { notifyThreatDetectionAilaSchema } from "./slack/notifyThreatDetectionAila.schema";
import { notifyThreatDetectionTeachingMaterialsSchema } from "./slack/notifyThreatDetectionTeachingMaterials.schema";
import { notifyUserBanSchema } from "./slack/notifyUserBan.schema";

const schemas = {
  "app/healthcheck": { data: z.any() },
  "app/slack.notifyRateLimit": notifyRateLimitSchema,
  "app/slack.notifyModeration": notifyModerationSchema,
  "app/slack.notifyThreatDetectionAila": notifyThreatDetectionAilaSchema,
  "app/slack.notifyThreatDetectionTeachingMaterials":
    notifyThreatDetectionTeachingMaterialsSchema,
  "app/slack.notifyModerationTeachingMaterials":
    notifyModerationTeachingMaterialsSchema,
  "app/slack.notifyUserBan": notifyUserBanSchema,
} satisfies ZodEventSchemas;

export default schemas;
