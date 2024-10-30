import { useEffect, useState } from "react";

import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import type { Message } from "ai";

import type { AilaStreamingStatus } from "@/components/AppComponents/Chat/Chat/hooks/useAilaStreamingStatus";

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
      ["StreamingLessonPlan", "Moderating"].includes(ailaStreamingStatus) &&
      lessonPlan.title
    ) {
      console.log("Show lesson mobile");
      if (!showLessonMobile) {
        setShowLessonMobile(true);
      }
    } else {
      console.log("Not showing lesson mobile", {
        userHasOverRiddenAutoPullOut,
        lessonPlanTitle: lessonPlan.title,
        ailaStreamingStatus,
      });
    }
    if (ailaStreamingStatus === "Idle") {
      if (userHasOverRiddenAutoPullOut) {
        setUserHasOverRiddenAutoPullOut(false);
      }
    }
  }, [
    ailaStreamingStatus,
    messages,
    userHasOverRiddenAutoPullOut,
    setUserHasOverRiddenAutoPullOut,
    setShowLessonMobile,
    showLessonMobile,
    lessonPlan.title,
    lessonPlan,
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
