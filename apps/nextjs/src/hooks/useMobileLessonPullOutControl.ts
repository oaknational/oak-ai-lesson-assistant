import { useEffect, useState } from "react";

import { Message } from "ai";

import { AilaStreamingStatus } from "@/components/AppComponents/Chat/Chat/hooks/useAilaStreamingStatus";

export const useMobileLessonPullOutControl = ({
  ailaStreamingStatus,
  messages,
}: {
  ailaStreamingStatus: AilaStreamingStatus;
  messages: Message[];
}) => {
  const [showLessonMobile, setShowLessonMobile] = useState(false);
  const [userHasOverRiddenAutoPullOut, setUserHasOverRiddenAutoPullOut] =
    useState(false);

  useEffect(() => {
    console.log("ailaStreamingStatus", ailaStreamingStatus);
    if (!userHasOverRiddenAutoPullOut && ailaStreamingStatus === "Loading") {
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
  ]);

  return {
    showLessonMobile,
    setShowLessonMobile,
    userHasOverRiddenAutoPullOut,
    setUserHasOverRiddenAutoPullOut,
  };
};
