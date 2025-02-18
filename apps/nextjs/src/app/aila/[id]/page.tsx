"use client";

import { useUser } from "@clerk/nextjs";

import ChatPageContents from "../page-contents";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: Readonly<ChatPageProps>) {
  const user = useUser();
  const { id } = params;
  // For local development so that we can warm up the server
  if (id === "health") {
    return <>OK</>;
  }

  return <ChatPageContents id={id} />;
}
