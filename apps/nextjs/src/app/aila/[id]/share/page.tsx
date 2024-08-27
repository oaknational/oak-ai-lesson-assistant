import { User, clerkClient } from "@clerk/nextjs/server";
import { getSessionModerations } from "@oakai/aila/src/features/moderation/getSessionModerations";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { getSharedChatById } from "@/app/actions";

import ShareChat from ".";

interface SharePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const chat = await getSharedChatById(params.id);
  return {
    title: chat?.title?.slice(0, 50) ?? "Aila",
  };
}

function userCanShare(user: User) {
  const isDemoUser = Boolean(user.publicMetadata.isDemoUser ?? "true");

  if (!isDemoUser) {
    return true;
  }
  return process.env.NEXT_PUBLIC_DEMO_SHARING_ENABLED === "true";
}

export default async function SharePage({ params }: Readonly<SharePageProps>) {
  const chat = await getSharedChatById(params.id);
  if (!chat?.lessonPlan) {
    return notFound();
  }
  const user = await clerkClient.users.getUser(chat.userId);

  if (!userCanShare(user)) {
    return notFound();
  }

  const { firstName, lastName } = user;
  const creatorsName = firstName && lastName && `${firstName + " " + lastName}`;

  const moderations = await getSessionModerations(params.id);

  if (moderations.some(isToxic)) {
    return notFound();
  }

  const lastModeration = moderations[moderations.length - 1];

  /**
   * We don't want to expose the whole persisted moderation object, as it contains
   * both the justification, which isn't used, and the userComment which is a user
   * input and should not be exposed to the client.
   */
  const moderation: PersistedModerationBase | null = lastModeration
    ? {
        id: lastModeration.id,
        categories: lastModeration.categories,
      }
    : null;

  return (
    <ShareChat
      lessonPlan={chat.lessonPlan}
      creatorsName={creatorsName}
      moderation={moderation}
    />
  );
}
