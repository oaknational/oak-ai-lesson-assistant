import { drive } from "@googleapis/drive";

import { DRIVE_SCOPES, createGoogleAuthClient } from "../shared/auth";
import type { DriveClient } from "./types";

/**
 * Creates an authenticated Google Drive API client
 * @returns Configured Drive API client
 */
export async function createDriveClient(): Promise<DriveClient> {
  const auth = createGoogleAuthClient(DRIVE_SCOPES);
  const client = await auth.getClient();

  return drive({
    version: "v3",
    auth,
  });
}
