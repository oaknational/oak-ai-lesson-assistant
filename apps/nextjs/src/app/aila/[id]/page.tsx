"use client";

import ChatPageContents from "../page-contents";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: Readonly<ChatPageProps>) {
  const { id } = params;
  // For local development so that we can warm up the server
  if (id === "health") {
    return <>OK</>;
  }

  return <ChatPageContents id={id} />;
}
