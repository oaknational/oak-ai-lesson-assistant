import { useEffect, useState } from "react";

import {
  useChatLessonPlan,
  useChatStreaming,
} from "@/components/ContextProviders/ChatProvider";

export const useMobileLessonPullOutControl = () => {
  const { lessonPlan } = useChatLessonPlan();
  const { ailaStreamingStatus } = useChatStreaming();
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
