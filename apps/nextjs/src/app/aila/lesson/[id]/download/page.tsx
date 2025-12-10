import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getChatById } from "@/app/actions";

import { DownloadView } from "./DownloadView";

export interface DownloadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(props: Readonly<DownloadPageProps>): Promise<Metadata> {
  const params = await props.params;
  const { userId }: { userId: string | null } = await auth();
  if (!userId) {
    return {
      title: "Aila",
    };
  }
  const chat = await getChatById(params.id);

  return {
    title: chat?.title.slice(0, 50) ?? "Aila",
  };
}

export default async function DownloadPage(props: Readonly<DownloadPageProps>) {
  const params = await props.params;
  const { userId }: { userId: string | null } = await auth();
  const { id } = params;

  if (!userId) {
    redirect(`/sign-in?next=/aila/${id}`);
  }

  const chat = await getChatById(id);

  if (chat?.userId !== userId) {
    return notFound();
  }

  if (!chat) {
    return notFound();
  }

  return <DownloadView chat={chat} />;
}
