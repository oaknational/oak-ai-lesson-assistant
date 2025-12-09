import { getSessionModerations } from "@oakai/aila/src/features/moderation/getSessionModerations";
import { demoUsers } from "@oakai/core/src/models/demoUsers";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import type { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSharedChatById } from "@/app/actions";

import ShareChat from ".";

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(props: SharePageProps): Promise<Metadata> {
  const params = await props.params;
  const chat = await getSharedChatById(params.id);
  return {
    title: chat?.title?.slice(0, 50) ?? "Aila",
  };
}

function userCanShare(user: User) {
  if (!demoUsers.isDemoStatusSet(user)) {
    return false;
  }
  const isDemoUser = Boolean(user.publicMetadata.labs.isDemoUser ?? "true");
  if (!isDemoUser) {
    return true;
  }
  return process.env.NEXT_PUBLIC_DEMO_SHARING_ENABLED === "true";
}

export default async function SharePage(props: Readonly<SharePageProps>) {
  const params = await props.params;
  const chat = await getSharedChatById(params.id);
  if (!chat?.lessonPlan) {
    return notFound();
  }
  const client = await clerkClient();
  const user = await client.users.getUser(chat.userId);

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
