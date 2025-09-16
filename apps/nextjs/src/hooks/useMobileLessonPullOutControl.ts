import { useEffect, useState } from "react";

import type { PartialLessonPlan } from "@oakai/aila/src/protocol/schema";

import { useChatStore } from "@/stores/AilaStoresProvider";

export const useMobileLessonPullOutControl = ({
  lessonPlan,
}: {
  lessonPlan: PartialLessonPlan;
}) => {
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );
  const [showLessonMobile, setShowLessonMobile] = useState(false);
  const [userHasOverRiddenAutoPullOut, setUserHasOverRiddenAutoPullOut] =
    useState(false);

  useEffect(() => {
    if (
      !userHasOverRiddenAutoPullOut &&
      ailaStreamingStatus === "StreamingLessonPlan" &&
      lessonPlan.title
    ) {
      setShowLessonMobile(true);
    }
    if (ailaStreamingStatus === "Idle") {
      setUserHasOverRiddenAutoPullOut(false);
    }
  }, [
    ailaStreamingStatus,
    userHasOverRiddenAutoPullOut,
    setUserHasOverRiddenAutoPullOut,
    setShowLessonMobile,
    lessonPlan.title,
  ]);

  function closeMobileLessonPullOut() {
    setShowLessonMobile(false);
    setUserHasOverRiddenAutoPullOut(true);
  }

  return {
    closeMobileLessonPullOut,
    showLessonMobile,
    setShowLessonMobile,
    userHasOverRiddenAutoPullOut,
    setUserHasOverRiddenAutoPullOut,
  };
};
