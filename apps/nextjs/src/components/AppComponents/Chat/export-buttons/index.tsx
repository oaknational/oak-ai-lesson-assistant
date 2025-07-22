"use client";

import { OakSmallSecondaryButton } from "@oaknational/oak-components";
import Link from "next/link";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { useChatStore, useLessonPlanStore } from "@/stores/AilaStoresProvider";
import { getAilaUrl } from "@/utils/getAilaUrl";

import { useDialog } from "../../DialogContext";
import { LessonPlanProgressDropdown } from "./LessonPlanProgressDropdown";

const ExportButtons = () => {
  const id = useLessonPlanStore((store) => store.id);
  const isStreaming = useChatStore(
    (state) => state.ailaStreamingStatus !== "Idle",
  );
  const { trackEvent } = useAnalytics();
  const { setDialogWindow } = useDialog();
  const demo = useDemoUser();

  return (
    <div className="sticky left-0 right-10 top-26 z-10 mt-26 hidden bg-white p-14 px-24 shadow-md sm:block">
      <div className="flex flex-col">
        <div className="flex items-center space-x-14">
          <LessonPlanProgressDropdown />
          <div className="flex space-x-10">
            <OakSmallSecondaryButton
              disabled={isStreaming}
              title={demo.isSharingEnabled ? undefined : "Not available"}
              data-testid="chat-share-button"
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
            </OakSmallSecondaryButton>
            <OakSmallSecondaryButton
              element={!isStreaming ? Link : "button"}
              disabled={isStreaming}
              data-testid="chat-download-resources"
              href={
                demo.isSharingEnabled
                  ? `${getAilaUrl("lesson")}/${id}/download`
                  : "#"
              }
              title={demo.isSharingEnabled ? undefined : "Not available"}
              onClick={() => {
                trackEvent("chat:open_chat_actions", {
                  id,
                });
                if (!demo.isSharingEnabled) {
                  setDialogWindow("demo-share-locked");
                }
              }}
            >
              Download resources
            </OakSmallSecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportButtons;

export function handleRewordingSections(section: string) {
  if (section.includes("Learning cycle 1")) {
    return "Learning cycles";
  }
  if (section === "Learning cycles") {
    return "Learning Cycle Outcomes";
  }
  return section;
}
