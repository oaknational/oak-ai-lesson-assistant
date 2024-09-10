import { auth } from "@clerk/nextjs/server";
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
    throw new Error("User is not authenticated");
  }

  const userIsAuthorised = await isAuthorised({ userId });
  if (!userIsAuthorised) {
    throw new Error("User is not authorised");
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

  return new Response("Moderation invalidated", {
    status: 200,
  });
}

export const GET = handler;

async function isAuthorised({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return user?.isOakUser;
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
