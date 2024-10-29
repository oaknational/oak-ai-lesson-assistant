import type { FC } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getLastAssistantMessage } from "@oakai/aila/src/helpers/chat/getLastAssistantMessage";
import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import type { Message } from "ai";

import type { UserAction } from "./helpers";
import { trackLessonPlanRefined } from "./trackLessonPlanRefined";
import useAnalytics from "./useAnalytics";

type OnStreamFinishedProps = {
  prevLesson: LooseLessonPlan;
  nextLesson: LooseLessonPlan;
  messages: Message[];
};
type LessonPlanTrackingContext = {
  onStreamFinished: (props: OnStreamFinishedProps) => void;
  onSubmitText: (text: string) => void;
  onClickContinue: () => void;
  onClickRetry: (text: string) => void;
  onClickStartFromExample: (text: string) => void;
  onClickStartFromFreeText: (text: string) => void;
};

const lessonPlanTrackingContext =
  createContext<LessonPlanTrackingContext | null>(null);

const LessonPlanTrackingProvider: FC<{
  children?: React.ReactNode;
  chatId: string;
}> = ({ children, chatId }) => {
  const { track } = useAnalytics();
  const [action, setAction] = useState<UserAction | null>(null);
  const [userMessageContent, setUserMessageContent] = useState<string>("");
  useEffect(() => {
    setAction(null);
  }, [chatId]);
  const onStreamFinished = useCallback(
    ({ prevLesson, nextLesson, messages }: OnStreamFinishedProps) => {
      const ailaMessageContent = getLastAssistantMessage(messages)?.content;
      if (!ailaMessageContent) {
        return;
      }
      const isFirstMessage = messages.length === 2;
      trackLessonPlanRefined({
        chatId,
        prevLesson,
        nextLesson,
        ailaMessageContent,
        userMessageContent,
        isFirstMessage,
        track,
        action,
      });

      setAction(null);
      setUserMessageContent("");
    },
    [track, action, userMessageContent],
  );
  const onSubmitText = useCallback((text: string) => {
    setAction("submit_text");
    setUserMessageContent(text);
  }, []);
  const onClickContinue = useCallback(() => {
    setAction("button_continue");
    setUserMessageContent("");
  }, []);
  const onClickRetry = useCallback((text: string) => {
    setAction("button_retry");
    setUserMessageContent(text);
  }, []);
  const onClickStartFromExample = useCallback((text: string) => {
    setAction("start_from_example");
    setUserMessageContent(text);
  }, []);
  const onClickStartFromFreeText = useCallback((text: string) => {
    setAction("start_from_free_text");
    setUserMessageContent(text);
  }, []);

  const value: LessonPlanTrackingContext = useMemo(
    () => ({
      onStreamFinished,
      onSubmitText,
      onClickContinue,
      onClickRetry,
      onClickStartFromExample,
      onClickStartFromFreeText,
    }),
    [
      onStreamFinished,
      onSubmitText,
      onClickContinue,
      onClickRetry,
      onClickStartFromExample,
      onClickStartFromFreeText,
    ],
  );

  return (
    <lessonPlanTrackingContext.Provider value={value}>
      {children}
    </lessonPlanTrackingContext.Provider>
  );
};

export const useLessonPlanTracking = () => {
  const context = useContext(lessonPlanTrackingContext);
  if (!context) {
    throw new Error(
      "useLessonPlanTracking must be used within a LessonPlanTrackingProvider",
    );
  }
  return context;
};

export default LessonPlanTrackingProvider;
