import { useChatStore } from "src/stores/chatStore";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { useDemoUser } from "@/components/ContextProviders/Demo";
import { useDemoLocking } from "@/hooks/useDemoLocking";
import { useMobileLessonPullOutControl } from "@/hooks/useMobileLessonPullOutControl";
import { cn } from "@/lib/utils";

import ChatLeftHandSide from "./chat-left-hand-side";
import ChatRightHandSideLesson from "./chat-right-hand-side-lesson";

export interface ChatLayoutProps {
  className?: string;
}

export const ChatLayout = ({ className }: Readonly<ChatLayoutProps>) => {
  const { isLoading, lessonPlan, messages } = useLessonChat();
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );
  const demo = useDemoUser();
  const isDemoLocked = useDemoLocking(messages, isLoading);
  const { showLessonMobile, setShowLessonMobile, closeMobileLessonPullOut } =
    useMobileLessonPullOutControl({
      ailaStreamingStatus,
      messages,
      lessonPlan,
    });
  return (
    <div className={cn("fixed bottom-0 left-0 right-0 top-0 z-30", className)}>
      <div
        className={`flex h-full flex-row justify-start ${demo.isDemoUser ? "pt-22" : ""}`}
      >
        <ChatLeftHandSide
          key="chat-left-hand-side"
          isDemoLocked={isDemoLocked}
          showLessonMobile={showLessonMobile}
          setShowLessonMobile={setShowLessonMobile}
          demo={demo}
          isDemoUser={demo.isDemoUser}
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
