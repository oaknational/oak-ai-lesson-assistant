import { useEffect } from "react";

import type { AiMessage } from "@/stores/chatStore/types";

import { useLessonPlanStore } from "..";

export const useLessonPlanStoreMirror = (
  messages: AiMessage[],
  isLoading: boolean,
) => {
  const messagesUpdated = useLessonPlanStore((state) => state.messagesUpdated);

  useEffect(() => {
    messagesUpdated(messages, isLoading);
  }, [messages, isLoading, messagesUpdated]);
};

// export function useLessonPlanManager(initialLessonPlan: LooseLessonPlan = {}) {

//   useEffect(() => {
//     const onLessonPlanUpdated = ({
//       lessonPlan: updatedLessonPlan,
//       iteration: updatedIteration,
//     }: {
//       lessonPlan: LooseLessonPlan;
//       iteration: number | undefined;
//     }) => {
//       log.info("Update lesson plan state", updatedLessonPlan, updatedIteration);
//       setLessonPlan(updatedLessonPlan);
//       setIteration(updatedIteration);
//     };

//     lessonPlanManager.on("lessonPlanUpdated", onLessonPlanUpdated);

//     return () => {
//       lessonPlanManager.off("lessonPlanUpdated", onLessonPlanUpdated);
//     };
//   }, [lessonPlanManager]);

//   return {
//     lessonPlanManager,
//     lessonPlan,
//     iteration,
//   };
// }

// // const setMessages = useChatStore((state) => state.setMessages);
// // const setAiSdkActions = useChatStore((state) => state.setAiSdkActions);

// // useEffect(() => {
// //   setMessages(messages, isLoading);
// // }, [messages, isLoading, setMessages]);

// // useEffect(() => {
// //   setAiSdkActions({ stop, append, reload });
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// // }, []);

// // useEffect(() => {
// //   if (chat?.lessonPlan) {
// //     log.info(
// //       "Setting lesson plan from chat",
// //       chat?.iteration,
// //       chat.lessonPlan,
// //     );
// //     lessonPlanManager.setLessonPlanWithDelay(chat.lessonPlan, chat.iteration);
// //   }
// // }, [chat?.lessonPlan, chat?.iteration, lessonPlanManager]);

// // if (!hasFinished || !messages) return;
// // const timeout = setTimeout(() => {
// //   // Delay fetching the lesson plan to ensure the UI has updated
// //   trpcUtils.chat.appSessions.getChat.invalidate({ id });
// // }, 2000);

// // useEffect(() => {
// //   if (messages.length > 0) {
// //     workingMessage.current = messages[messages.length - 1];
// //   }
// // }, [messages]);

// // useEffect(() => {
// //   if (streamingSection !== streamingSectionCompleted) {
// //     if (workingMessage.current) {
// //       lessonPlanManager.onMessageUpdated(workingMessage.current);
// //     }
// //     setStreamingSectionCompleted(streamingSection);
// //   }
// // }, [streamingSection, streamingSectionCompleted, lessonPlanManager]);
