import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getChatById } from "@/app/actions";

import { DownloadView } from "./DownloadView";

export interface DownloadPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: Readonly<DownloadPageProps>): Promise<Metadata> {
  const { userId }: { userId: string | null } = auth();
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

export default async function DownloadPage({
  params,
}: Readonly<DownloadPageProps>) {
  const { userId }: { userId: string | null } = auth();
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
