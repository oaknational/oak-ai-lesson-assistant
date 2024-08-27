import { notFound, redirect } from "#next/navigation";
import { auth } from "@clerk/nextjs/server";
import { type Metadata } from "next";

import { getChatById } from "@/app/actions";
import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import DownloadView from ".";

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

  if (!chat) {
    return notFound();
  }

  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");

  return <DownloadView chat={chat} featureFlag={featureFlag} />;
}
