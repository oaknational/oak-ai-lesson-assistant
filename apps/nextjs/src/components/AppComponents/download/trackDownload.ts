import type { PartialLessonPlan } from "@oakai/aila/src/protocol/schema";

import { getLessonTrackingProps } from "@/lib/analytics/helpers";
import type useAnalytics from "@/lib/analytics/useAnalytics";
import type {
  ResourceFileTypeValueType,
  ResourceTypeValueType,
} from "@/lib/avo/Avo";

export function trackDownload(
  resourceFileType: ResourceFileTypeValueType,
  analyticsResourceType: ResourceTypeValueType | ResourceTypeValueType[],
  lesson: PartialLessonPlan,
  track: ReturnType<typeof useAnalytics>["track"],
  chatId: string,
) {
  track.lessonPlanResourcesDownloaded({
    chatId,
    ...getLessonTrackingProps({ lesson }),
    resourceType: Array.isArray(analyticsResourceType)
      ? analyticsResourceType
      : [analyticsResourceType],
    resourceFileType,
  });
}
