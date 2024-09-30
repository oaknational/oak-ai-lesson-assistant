import { useEffect, useState } from "react";

import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { Message } from "ai";

import { AilaStreamingStatus } from "@/components/AppComponents/Chat/Chat/hooks/useAilaStreamingStatus";

export const useMobileLessonPullOutControl = ({
  ailaStreamingStatus,
  messages,
  lessonPlan,
}: {
  ailaStreamingStatus: AilaStreamingStatus;
  messages: Message[];
  lessonPlan: LooseLessonPlan;
}) => {
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
    messages,
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
