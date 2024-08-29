"use client";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { useDemoUser } from "@/components/ContextProviders/Demo";
import useAnalytics from "@/lib/analytics/useAnalytics";

import { useDialog } from "../../DialogContext";
import ChatButton from "../ui/chat-button";
import { LessonPlanProgressDropdown } from "./LessonPlanProgressDropdown";

export type ExportButtonsProps = {
  sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
};

const ExportButtons = ({
  sectionRefs,
  documentContainerRef,
}: ExportButtonsProps) => {
  const chat = useLessonChat();
  const { id, isStreaming, lessonPlan } = chat;
  const { trackEvent } = useAnalytics();
  const { setDialogWindow } = useDialog();
  const demo = useDemoUser();

  return (
    <div className="sticky left-0 right-10 top-26 z-10 bg-white p-14 px-24 shadow-md">
      <div className="flex flex-col">
        <div className="flex items-center space-x-14">
          <LessonPlanProgressDropdown
            lessonPlan={lessonPlan}
            isStreaming={isStreaming}
            sectionRefs={sectionRefs}
            documentContainerRef={documentContainerRef}
          />
          <div className="flex space-x-10">
            <ChatButton
              variant="primary"
              size="sm"
              disabled={isStreaming}
              title={demo.isSharingEnabled ? undefined : "Not available"}
              onClick={() => {
                trackEvent("chat:share_chat", {
                  id,
                });
                if (demo.isSharingEnabled) {
                  setDialogWindow("share-chat");
                } else {
                  setDialogWindow("demo-share-locked");
                }
              }}
            >
              Share lesson
            </ChatButton>
            <ChatButton
              variant="primary"
              size="sm"
              href={demo.isSharingEnabled ? `/aila/download/${id}` : "#"}
              title={demo.isSharingEnabled ? undefined : "Not available"}
              disabled={isStreaming}
              onClick={() => {
                trackEvent("chat:open_chat_actions", {
                  id,
                });
                if (!demo.isSharingEnabled) {
                  setDialogWindow("demo-share-locked");
                }
              }}
              testId="chat-download-resources"
            >
              Download resources
            </ChatButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportButtons;

export function handleRewordingSections(section: string) {
  if (section.includes("Cycle 1")) {
    return "Learning cycles";
  }
  if (section === "Learning cycles") {
    return "Learning Cycle Outcomes";
  }
  return section;
}
