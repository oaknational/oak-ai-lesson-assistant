import { useDemoUser } from "@/components/ContextProviders/Demo";
import { STATUS_BANNER_OFFSET } from "@/components/StatusBanner";
import { useMobileLessonPullOutControl } from "@/hooks/useMobileLessonPullOutControl";
import { cn } from "@/lib/utils";
import { useLessonPlanStore } from "@/stores/AilaStoresProvider";

import ChatLeftHandSide from "./chat-left-hand-side";
import ChatRightHandSideLesson from "./chat-right-hand-side-lesson";

export interface ChatLayoutProps {
  className?: string;
}

export const ChatLayout = ({ className }: Readonly<ChatLayoutProps>) => {
  const lessonPlan = useLessonPlanStore((state) => state.lessonPlan);
  const demo = useDemoUser();
  const { showLessonMobile, setShowLessonMobile, closeMobileLessonPullOut } =
    useMobileLessonPullOutControl({ lessonPlan });
  return (
    // The chat is pinned to the viewport, so nothing above it can push it down.
    // Its top edge moves instead, by 0 when the banner is hidden.
    <div
      className={cn("fixed bottom-0 left-0 right-0 z-30", className)}
      style={{ top: STATUS_BANNER_OFFSET }}
    >
      <div
        className={`flex h-full flex-row justify-start ${demo.isDemoUser ? "pt-22" : ""}`}
      >
        <ChatLeftHandSide
          key="chat-left-hand-side"
          showLessonMobile={showLessonMobile}
          setShowLessonMobile={setShowLessonMobile}
        />
        <ChatRightHandSideLesson
          key="chat-right-hand-side-lesson"
          showLessonMobile={showLessonMobile}
          closeMobileLessonPullOut={closeMobileLessonPullOut}
          demo={demo}
        />
      </div>
    </div>
  );
};
