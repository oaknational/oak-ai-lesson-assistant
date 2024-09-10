import { auth, clerkClient } from "@clerk/nextjs/server";
import { Moderations, SafetyViolations } from "@oakai/core";
import { prisma } from "@oakai/db";
import { NextRequest } from "next/server";

// import { withSentry } from "@/lib/sentry/withSentry";

async function handler(
  req: NextRequest,
  { params }: { params: { moderationId: string } },
): Promise<Response> {
  const moderationId = params.moderationId;

  if (!moderationId) {
    return new Response("Invalid moderationId", {
      status: 400,
    });
  }

  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const userIsAuthorised = await isAuthorised({ userId });
  if (!userIsAuthorised) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    await invalidateToxicModerationAndRemoveSafetyViolation({
      moderationId,
      invalidatedBy: userId,
    });
  } catch (error) {
    return new Response(
      `Failed to invalidate moderation: ${error?.["message"]}`,
      {
        status: 500,
      },
    );
  }

  return new Response("Moderation invalidated and safety violation removed", {
    status: 200,
  });
}

export const GET = handler;

async function isAuthorised({ userId }: { userId: string }) {
  const user = await clerkClient.users.getUser(userId);
  return user?.emailAddresses.some((email) =>
    email.emailAddress.endsWith("@thenational.academy"),
  );
}

async function invalidateToxicModerationAndRemoveSafetyViolation({
  moderationId,
  invalidatedBy,
}: {
  // moderationId to invalidate
  moderationId: string;
  // userId of the user who is invalidating the moderation
  invalidatedBy: string;
}) {
  // invalidate toxic moderation
  console.log("Invalidating moderation", { moderationId, invalidatedBy });
  const moderations = new Moderations(prisma);
  await moderations.invalidateModeration({
    moderationId,
    invalidatedBy,
  });
  console.log("Moderation invalidated");

  // remove associated safety violation (and potentially unban user)
  console.log("Removing safety violation", { moderationId });
  const safetyViolations = new SafetyViolations(prisma);
  await safetyViolations.removeViolationsByRecordId(moderationId);
  console.log("Safety violation removed");
}
