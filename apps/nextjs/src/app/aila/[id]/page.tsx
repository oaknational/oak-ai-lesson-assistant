"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

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

  if (user.isLoaded && !user.isSignedIn) {
    redirect(`/sign-in?next=/aila/${params.id}`);
  }

  return <ChatPageContents id={id} />;
}
