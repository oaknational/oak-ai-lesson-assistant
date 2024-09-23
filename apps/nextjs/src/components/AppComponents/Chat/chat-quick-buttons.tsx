import { useCallback, useEffect, useState, useRef } from "react";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { Icon } from "@/components/Icon";
import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import useAnalytics from "@/lib/analytics/useAnalytics";

import { useDialog } from "../DialogContext";
import ChatButton from "./ui/chat-button";
import { IconRefresh, IconStop } from "./ui/icons";

interface QuickActionButtonsProps {
  isEmptyScreen: boolean;
}

type QueuedUserAction = "regenerate" | "continue";

const QuickActionButtons = ({ isEmptyScreen }: QuickActionButtonsProps) => {
  const chat = useLessonChat();
  const { trackEvent } = useAnalytics();
  const lessonPlanTracking = useLessonPlanTracking();
  const { setDialogWindow } = useDialog();
  const [queuedUserAction, setQueuedUserAction] =
    useState<QueuedUserAction | null>(null);
  const { messages, reload, append, id, stop, ailaStreamingStatus } = chat;
  const isExecutingAction = useRef(false);

  const shouldAllowUserAction =
    ["Idle", "Moderating"].includes(ailaStreamingStatus) && !queuedUserAction;
  const shouldQueueUserAction = ailaStreamingStatus === "Moderating";

  const handleRegenerate = useCallback(() => {
    trackEvent("chat:regenerate", { id: id });
    const lastUserMessage =
      messages.findLast((m) => m.role === "user")?.content || "";
    lessonPlanTracking.onClickRetry(lastUserMessage);
    reload();
  }, [reload, lessonPlanTracking, messages, trackEvent, id]);

  const handleContinue = useCallback(async () => {
    trackEvent("chat:continue");
    lessonPlanTracking.onClickContinue();
    await append({
      content: "Continue",
      role: "user",
    });
  }, [append, lessonPlanTracking, trackEvent]);

  const queueUserAction = useCallback(
    (action: QueuedUserAction) => {
      setQueuedUserAction(action);
    },
    [setQueuedUserAction],
  );

  const executeQueuedAction = useCallback(async () => {
    if (!queuedUserAction || shouldQueueUserAction || isExecutingAction.current)
      return;

    isExecutingAction.current = true;
    const actionToExecute = queuedUserAction;
    setQueuedUserAction(null);

    try {
      if (actionToExecute === "regenerate") {
        handleRegenerate();
      } else if (actionToExecute === "continue") {
        await handleContinue();
      }
    } catch (error) {
      console.error("Error handling queued action:", error);
    } finally {
      isExecutingAction.current = false;
    }
  }, [
    queuedUserAction,
    shouldQueueUserAction,
    handleRegenerate,
    handleContinue,
  ]);

  useEffect(() => {
    executeQueuedAction();
  }, [executeQueuedAction]);

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
                if (shouldQueueUserAction) {
                  queueUserAction("regenerate");
                  return;
                }
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

        {[
          "Loading",
          "RequestMade",
          "StreamingLessonPlan",
          "StreamingChatResponse",
        ].includes(ailaStreamingStatus) &&
          isEmptyScreen && (
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
      <ChatButton
        size="sm"
        variant="primary"
        disabled={!shouldAllowUserAction}
        onClick={async () => {
          if (shouldQueueUserAction) {
            queueUserAction("continue");
            return;
          }
          await handleContinue();
        }}
        testId="chat-continue"
      >
        Continue
      </ChatButton>
    </div>
  );
};

export default QuickActionButtons;
