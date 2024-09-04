"use client";

import { useUser } from "#clerk/nextjs";
import { redirect } from "#next/navigation";

import { trpc } from "@/utils/trpc";

import ChatPageContents from "../page-contents";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: Readonly<ChatPageProps>) {
  const user = useUser();
  const { id } = params;
  const { data: chat } = trpc.chat.appSessions.getChat.useQuery({ id });
  const { data: moderations } = trpc.chat.appSessions.getModerations.useQuery({
    id,
  });

  // For local development so that we can warm up the server
  if (id === "health") {
    return <>OK</>;
  }

  if (user.isLoaded && !user.isSignedIn) {
    redirect(`/sign-in?next=/aila/${params.id}`);
  }

  if (!chat) {
    console.log("No chat found");
    redirect("/aila?reason=no-chat-found");
  }

  return (
    <ChatPageContents
      id={id}
      isShared={chat.isShared}
      initialMessages={chat.messages}
      initialLessonPlan={chat.lessonPlan}
      initialModerations={moderations ?? []}
      startingMessage={chat.startingMessage}
    />
  );
}
