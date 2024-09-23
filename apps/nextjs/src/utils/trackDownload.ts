import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";

import { getLessonTrackingProps } from "@/lib/analytics/helpers";
import useAnalytics from "@/lib/analytics/useAnalytics";
import {
  ResourceFileTypeValueType,
  ResourceTypeValueType,
} from "@/lib/avo/Avo";

export function trackDownload(
  resourceFileType: ResourceFileTypeValueType,
  analyticsResourceType: ResourceTypeValueType | ResourceTypeValueType[],
  lesson: LooseLessonPlan,
  track: ReturnType<typeof useAnalytics>["track"],
) {
  track.lessonPlanResourcesDownloaded({
    ...getLessonTrackingProps({ lesson }),
    resourceType: Array.isArray(analyticsResourceType)
      ? analyticsResourceType
      : [analyticsResourceType],
    resourceFileType,
  });
}
