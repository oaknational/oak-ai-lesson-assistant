import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { useDemoUser } from "@/components/ContextProviders/Demo";
import { useDemoLocking } from "@/hooks/useDemoLocking";
import { useMobileLessonPullOutControl } from "@/hooks/useMobileLessonPullOutControl";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chatStore";

import ChatLeftHandSide from "./chat-left-hand-side";
import ChatRightHandSideLesson from "./chat-right-hand-side-lesson";

export interface ChatLayoutProps {
  className?: string;
}

export const ChatLayout = ({ className }: Readonly<ChatLayoutProps>) => {
  const { lessonPlan, messages } = useLessonChat();

  const isLoading = useChatStore((state) => state.isLoading);
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );
  const demo = useDemoUser();
  const isDemoLocked = useDemoLocking(messages, isLoading);
  const { showLessonMobile, setShowLessonMobile, closeMobileLessonPullOut } =
    useMobileLessonPullOutControl({
      ailaStreamingStatus: ailaStreamingStatus,
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
        {/* <div className="mt-28 flex w-full flex-col">
          <div className="w-half h-[50vh] overflow-y-scroll bg-red-200">
            {messages && (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(messages, null, 2)}
              </pre>
            )}
          </div>
          <div className="w-half h-[50vh] overflow-y-scroll">
            {messagesFromStore && (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(messagesFromStore, null, 2)}
              </pre>
            )}
          </div>
        </div> */}
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
