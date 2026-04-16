"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { StoreApi } from "zustand";
import { useStore } from "zustand";

import { trpc } from "@/utils/trpc";

import { createLessonAdaptStore } from "./index";
import type { LessonAdaptState } from "./types";

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface LessonAdaptStoreContextValue {
  store: StoreApi<LessonAdaptState>;
  messages: ChatMessage[];
  isGenerating: boolean;
  sendMessage: (content: string) => Promise<void>;
}

const LessonAdaptStoreContext = createContext<
  LessonAdaptStoreContextValue | undefined
>(undefined);

export interface LessonAdaptStoreProviderProps {
  children: React.ReactNode;
}

export const LessonAdaptStoreProvider: React.FC<
  LessonAdaptStoreProviderProps
> = ({ children }) => {
  const trpcUtils = trpc.useUtils();

  // Create store once
  const [store] = useState(() => createLessonAdaptStore({ trpcUtils }));

  // Messages state managed in provider for simplicity
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      content:
        "Hello! I'm ready to help you adapt this lesson. How would you like to change it?",
      timestamp: new Date(),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Use the tRPC mutation for generating plans
  const generatePlanMutation = trpc.lessonAdapt.generatePlan.useMutation({
    onSuccess: (data) => {
      // Store the plan in the Zustand store
      store.getState().actions.setPlanFromResponse(data.plan);
      store.getState().actions.setStatus("ready");
      // Open the review modal
      store.getState().actions.setShowReviewModal(true);
      setIsGenerating(false);
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
          timestamp: new Date(),
        },
      ]);
      store
        .getState()
        .actions.setError(new Error(error.message, { cause: error }));
      store.getState().actions.setStatus("error");
      setIsGenerating(false);
    },
  });

  // Send message handler
  const sendMessage = useCallback(
    async (content: string) => {
      const sessionId = store.getState().sessionId;
      if (!content.trim() || !sessionId) return;

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content,
          timestamp: new Date(),
        },
      ]);

      // Update status and clear previous plan
      store.getState().actions.setStatus("generating-plan");
      store.getState().actions.clearPlan();
      setIsGenerating(true);

      // Call the mutation
      await generatePlanMutation.mutateAsync({
        sessionId,
        userMessage: content,
      });
    },
    [store, generatePlanMutation],
  );

  const contextValue = useMemo(
    () => ({
      store,
      messages,
      isGenerating,
      sendMessage,
    }),
    [store, messages, isGenerating, sendMessage],
  );

  return (
    <LessonAdaptStoreContext.Provider value={contextValue}>
      {children}
    </LessonAdaptStoreContext.Provider>
  );
};

/**
 * Hook to access the lesson adapt store with a selector
 */
export const useLessonAdaptStore = <T,>(
  selector: (state: LessonAdaptState) => T,
): T => {
  const context = useContext(LessonAdaptStoreContext);
  if (!context) {
    throw new Error(
      "useLessonAdaptStore must be used within LessonAdaptStoreProvider",
    );
  }
  return useStore(context.store, selector);
};

/**
 * Hook to access lesson adapt store actions
 */
export const useLessonAdaptActions = () => {
  const context = useContext(LessonAdaptStoreContext);
  if (!context) {
    throw new Error(
      "useLessonAdaptActions must be used within LessonAdaptStoreProvider",
    );
  }
  return useStore(context.store, (state) => state.actions);
};

/**
 * Hook to access chat messages and send function
 */
export const useLessonAdaptChat = () => {
  const context = useContext(LessonAdaptStoreContext);
  if (!context) {
    throw new Error(
      "useLessonAdaptChat must be used within LessonAdaptStoreProvider",
    );
  }
  return {
    messages: context.messages,
    isGenerating: context.isGenerating,
    sendMessage: context.sendMessage,
  };
};

/**
 * Hook to check if the lesson is ready (has session and lesson data)
 */
export const useLessonAdaptReady = () => {
  return useLessonAdaptStore(
    (state) => state.status === "ready" && !!state.sessionId,
  );
};
