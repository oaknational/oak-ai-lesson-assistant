import type { UserJSON } from "@clerk/backend";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/node";
import { headers } from "next/headers";
import { Webhook } from "svix";
import invariant from "tiny-invariant";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

const log = aiLogger("webhooks");

declare global {
  interface UserPublicMetadata {
    labs?: {
      isDemoUser?: boolean;
      isOnboarded?: boolean;
      featureFlagGroup?: string | null;
    };
  }
}

function getPrimaryEmail(user: UserJSON): string {
  const primaryEmail = user.email_addresses.find(
    (email) => email.id === user.primary_email_address_id,
  );
  invariant(primaryEmail);
  return primaryEmail.email_address;
}

async function syncUserToPosthog(user: UserJSON) {
  const featureFlagGroup = user.public_metadata.labs?.featureFlagGroup ?? "";
  posthogAiBetaServerClient.identify({
    distinctId: getPrimaryEmail(user),
    properties: { featureFlagGroup },
  });
  await posthogAiBetaServerClient.shutdown();
  log.info("featureFlagGroup synced:", user.id, featureFlagGroup);
}

export async function POST(req: Request) {
  try {
    const headerPayload = headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Error occured -- no svix headers", {
        status: 400,
      });
    }

    // Create a new Svix instance with your secret.
    invariant(WEBHOOK_SECRET, "Missing CLERK_WEBHOOK_SECRET");
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await req.json();
      const body = JSON.stringify(payload);
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      log.error("Error verifying webhook:", err);
      return new Response("Error occured", {
        status: 400,
      });
    }

    const eventType = evt.type;
    switch (eventType) {
      case "user.updated": {
        const user = evt.data;
        log.info("user.updated", user.id);
        await syncUserToPosthog(user);
        return new Response("Updated", { status: 200 });
      }
      default:
        log.error("Unknown event type:", eventType);
        return new Response(`Unknown event type: ${eventType}`, {
          status: 400,
        });
    }
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}
