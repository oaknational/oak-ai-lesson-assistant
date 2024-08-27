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

const QuickActionButtons = ({ isEmptyScreen }: QuickActionButtonsProps) => {
  const chat = useLessonChat();
  const { trackEvent } = useAnalytics();
  const lessonPlanTracking = useLessonPlanTracking();
  const { setDialogWindow } = useDialog();

  const { isLoading, messages, reload, append, id, stop } = chat;

  return (
    <div className="-ml-7 flex justify-between space-x-7 rounded-bl rounded-br pt-8">
      {!isLoading && (
        <div className="flex items-center">
          <ChatButton
            data-testid="chat-continue"
            size="sm"
            variant="text-link"
            onClick={() => {
              trackEvent("chat:regenerate", { id: id });
              const lastUserMessage =
                messages.findLast((m) => m.role === "user")?.content || "";
              lessonPlanTracking.onClickRetry(lastUserMessage);
              reload();
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
        </div>
      )}
      {isLoading && isEmptyScreen && (
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
      <ChatButton
        size="sm"
        variant="primary"
        disabled={isLoading}
        onClick={async () => {
          trackEvent("chat:continue");
          lessonPlanTracking.onClickContinue();
          await append({
            id,
            content: "Continue",
            role: "user",
          });
        }}
        testId="chat-continue"
      >
        Continue
      </ChatButton>
    </div>
  );
};

export default QuickActionButtons;
