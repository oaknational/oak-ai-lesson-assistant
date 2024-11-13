import { useCallback } from "react";

import { findLast } from "remeda";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { Icon } from "@/components/Icon";
import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import useAnalytics from "@/lib/analytics/useAnalytics";

import { useDialog } from "../DialogContext";
import type { AilaStreamingStatus } from "./Chat/hooks/useAilaStreamingStatus";
import ChatButton from "./ui/chat-button";
import { IconRefresh, IconStop } from "./ui/icons";

interface QuickActionButtonsProps {
  isEmptyScreen: boolean;
}

const shouldAllowStop = (
  ailaStreamingStatus: AilaStreamingStatus,
  isEmptyScreen: boolean,
  queuedUserAction: string | null,
) => {
  if (!isEmptyScreen) {
    return false;
  }

  if (
    [
      "Loading",
      "RequestMade",
      "StreamingLessonPlan",
      "StreamingChatResponse",
    ].includes(ailaStreamingStatus)
  ) {
    return true;
  }

  if (queuedUserAction) {
    return true;
  }

  return false;
};

const QuickActionButtons = ({ isEmptyScreen }: QuickActionButtonsProps) => {
  const chat = useLessonChat();
  const { trackEvent } = useAnalytics();
  const lessonPlanTracking = useLessonPlanTracking();
  const { setDialogWindow } = useDialog();
  const {
    messages,
    id,
    stop,
    ailaStreamingStatus,
    queueUserAction,
    queuedUserAction,
  } = chat;

  const shouldAllowUserAction =
    ["Idle", "Moderating"].includes(ailaStreamingStatus) && !queuedUserAction;

  const handleRegenerate = useCallback(() => {
    trackEvent("chat:regenerate", { id: id });
    const lastUserMessage =
      findLast(messages, (m) => m.role === "user")?.content || "";
    lessonPlanTracking.onClickRetry(lastUserMessage);
    queueUserAction("regenerate");
  }, [queueUserAction, lessonPlanTracking, messages, trackEvent, id]);

  const handleContinue = useCallback(async () => {
    trackEvent("chat:continue");
    lessonPlanTracking.onClickContinue();
    queueUserAction("continue");
  }, [queueUserAction, lessonPlanTracking, trackEvent]);

  return (
    <div className="-ml-7 flex justify-between space-x-7 rounded-bl rounded-br pt-8">
      <div className="flex items-center">
        {shouldAllowUserAction && (
          <>
            <ChatButton
              data-testid="chat-continue"
              size="sm"
              variant="text-link"
              onClick={() => {
                handleRegenerate();
              }}
            >
              <span className="opacity-70">
                <IconRefresh className="mr-3" />
              </span>
              <span className="font-light text-[#575757]">Retry</span>
            </ChatButton>
            <ChatButton
              variant="text-link"
              onClick={() => setDialogWindow("report-content")}
            >
              <span className="opacity-70">
                <Icon icon="warning" className="mr-3" size="xs" />
              </span>
              <span className="font-light text-[#575757]">Report</span>
            </ChatButton>
          </>
        )}

        {shouldAllowStop(
          ailaStreamingStatus,
          isEmptyScreen,
          queuedUserAction,
        ) && (
          <ChatButton
            size="sm"
            variant="text-link"
            onClick={() => {
              trackEvent("chat:stop_generating");
              stop();
            }}
            testId="chat-stop"
          >
            <span className="opacity-50">
              <IconStop className="mr-3" />
            </span>
            <span className="font-light text-[#575757]">Stop</span>
          </ChatButton>
        )}
      </div>
      {/* <ChatButton
        size="sm"
        variant="primary"
        disabled={!shouldAllowUserAction}
        onClick={async () => {
          await handleContinue();
        }}
        testId="chat-continue"
      >
        Continue
      </ChatButton> */}
    </div>
  );
};

export default QuickActionButtons;
