import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { aiLogger } from "@oakai/logger";
import { difference, equals } from "remeda";

type MetadataArgs = {
  isOnboarded: boolean;
  isDemoUser: boolean | null;
  region: "GB" | "US";
};
const ONBOARDING_DATE = new Date("2025-01-01");
const log = aiLogger("testing");

const buildMetadata = (metadata: MetadataArgs) => {
  if (!metadata.isOnboarded) {
    return {
      publicMetadata: {},
      privateMetadata: {},
    };
  }

  return {
    publicMetadata: {
      labs: {
        isOnboarded: true,
        isDemoUser: metadata.isDemoUser,
      },
    },
    privateMetadata: {
      acceptedPrivacyPolicy: ONBOARDING_DATE,
      acceptedTermsOfUse: ONBOARDING_DATE,
      region: metadata.region,
    },
  };
};

const deleteExtraKeys = (
  proposedMetadata: Record<string, unknown>,
  currentMetadata: Record<string, unknown>,
) => {
  const keysToDelete = difference(
    Object.keys(currentMetadata),
    Object.keys(proposedMetadata),
  );
  return {
    ...proposedMetadata,
    ...Object.fromEntries(keysToDelete.map((key) => [key, null])),
  };
};

export const setClerkMetadata = async (
  userId: string,
  user: User,
  metadata: MetadataArgs,
) => {
  const proposedMetadata = buildMetadata(metadata);
  const currentMetadata = {
    publicMetadata: user.publicMetadata,
    privateMetadata: user.privateMetadata,
  };

  if (equals(proposedMetadata, currentMetadata)) {
    log.info("Clerk metadata is already correct");
  } else {
    log.info(
      "Updating clerk metadata",
      deleteExtraKeys(
        proposedMetadata.publicMetadata,
        currentMetadata.publicMetadata,
      ),
    );
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: deleteExtraKeys(
        proposedMetadata.publicMetadata,
        currentMetadata.publicMetadata,
      ),
      privateMetadata: deleteExtraKeys(
        proposedMetadata.privateMetadata,
        currentMetadata.privateMetadata,
      ),
    });
  }
};
