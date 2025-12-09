"use client";

import { use } from "react";

import ChatPageContents from "../../page-contents";

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ChatPage({ params }: Readonly<ChatPageProps>) {
  const { id } = use(params);
  // For local development so that we can warm up the server
  if (id === "health") {
    return <>OK</>;
  }

  return <ChatPageContents id={id} />;
}
