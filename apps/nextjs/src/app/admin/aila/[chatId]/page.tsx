"use client";

import { useUser } from "#clerk/nextjs";
import { redirect } from "#next/navigation";
import { aiLogger } from "@oakai/logger";

import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

import { AdminChatView } from "./view";

interface AdminChatProps {
  params: {
    chatId: string;
  };
}

const log = aiLogger("admin");

export default function AdminChat({ params }: Readonly<AdminChatProps>) {
  const user = useUser();
  const { chatId } = params;
  const { data: chat, isLoading: isChatLoading } = trpc.admin.getChat.useQuery({
    id: chatId,
  });
  const { data: moderations, isLoading: isModerationsLoading } =
    trpc.admin.getModerations.useQuery({ id: chatId });

  if (user.isLoaded && !user.isSignedIn) {
    redirect(`/sign-in?next=/admin/aila/${params.chatId}`);
  }

  if (isChatLoading || isModerationsLoading) {
    return <LoadingWheel />;
  }

  log.info("chat", chat);

  if (!chat) {
    return <div>No chat found</div>;
  }

  if (!moderations) {
    return <div>No moderations found</div>;
  }

  return <AdminChatView chat={chat} moderations={moderations} />;
}
