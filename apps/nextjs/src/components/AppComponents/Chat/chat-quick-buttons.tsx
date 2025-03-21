import { useCallback } from "react";

import { findLast } from "remeda";

import { useTranslation } from "@/components/ContextProviders/LanguageContext";
import { Icon } from "@/components/Icon";
import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import useAnalytics from "@/lib/analytics/useAnalytics";
import {
  useChatActions,
  useChatStore,
  useLessonPlanStore,
} from "@/stores/AilaStoresProvider";
import type { AilaStreamingStatus } from "@/stores/chatStore";
import { canAppendSelector } from "@/stores/chatStore/selectors";

import { useDialog } from "../DialogContext";
import ChatButton from "./ui/chat-button";
import { IconRefresh, IconStop } from "./ui/icons";

const shouldAllowStop = (
  ailaStreamingStatus: AilaStreamingStatus,
  hasMessages: boolean,
  queuedUserAction: string | null,
) => {
  if (!hasMessages) {
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

const QuickActionButtons = () => {
  const { trackEvent } = useAnalytics();
  const lessonPlanTracking = useLessonPlanTracking();
  const { setDialogWindow } = useDialog();
  const queuedUserAction = useChatStore((state) => state.queuedUserAction);
  const { append, stop } = useChatActions();
  const id = useLessonPlanStore((state) => state.id);
  const { t } = useTranslation();

  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );
  const shouldAllowUserAction = useChatStore(canAppendSelector);

  const stableMessages = useChatStore((state) => state.stableMessages);
  const hasMessages = useChatStore(
    (state) => state.stableMessages.length > 0 || !!state.streamingMessage,
  );

  const handleRegenerate = useCallback(() => {
    trackEvent("chat:regenerate", { id: id });
    const lastUserMessage =
      findLast(stableMessages, (m) => m.role === "user")?.content ?? "";
    lessonPlanTracking.onClickRetry(lastUserMessage);
    append("regenerate");
  }, [append, lessonPlanTracking, stableMessages, trackEvent, id]);

  const handleContinue = useCallback(() => {
    trackEvent("chat:continue");
    lessonPlanTracking.onClickContinue();
    append("continue");
  }, [append, lessonPlanTracking, trackEvent]);

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
              <span className="font-light text-[#575757]">
                {t("chat.retry")}
              </span>
            </ChatButton>
            <ChatButton
              variant="text-link"
              onClick={() => setDialogWindow("report-content")}
            >
              <span className="opacity-70">
                <Icon icon="warning" className="mr-3" size="xs" />
              </span>
              <span className="font-light text-[#575757]">
                {t("chat.report")}
              </span>
            </ChatButton>
          </>
        )}

        {shouldAllowStop(
          ailaStreamingStatus,
          hasMessages,
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
            <span className="font-light text-[#575757]">{t("chat.stop")}</span>
          </ChatButton>
        )}
      </div>
      <ChatButton
        size="sm"
        variant="primary"
        disabled={!shouldAllowUserAction}
        onClick={() => {
          handleContinue();
        }}
        testId="chat-continue"
      >
        {t("chat.continue")}
      </ChatButton>
    </div>
  );
};

export default QuickActionButtons;
