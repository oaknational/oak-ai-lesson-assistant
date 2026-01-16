import { auth, drive } from "@googleapis/drive";
import { z } from "zod";

/**
 * Environment variables schema for Google Service Account
 */
const googleServiceAccountEnvSchema = z.object({
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().min(1),
  GOOGLE_DRIVE_OUTPUT_FOLDER_ID: z.string().min(1),
});

export type GoogleServiceAccountEnv = z.infer<
  typeof googleServiceAccountEnvSchema
>;

/**
 * Validates that all required Google Service Account environment variables are present
 * @throws {Error} if validation fails
 */
export function validateGoogleServiceAccountEnv(): GoogleServiceAccountEnv {
  const env = {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    GOOGLE_DRIVE_OUTPUT_FOLDER_ID: process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID,
  };

  const result = googleServiceAccountEnvSchema.safeParse(env);

  if (!result.success) {
    throw new Error(
      `Missing or invalid Google Service Account environment variables: ${result.error.message}`,
    );
  }

  return result.data;
}

/**
 * Creates a Google Auth client using service account credentials
 * @param scopes - Array of OAuth2 scopes required for the API calls
 * @returns Configured GoogleAuth instance
 */
export function createGoogleAuthClient(scopes: string[]) {
  const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY } =
    validateGoogleServiceAccountEnv();

  // The private key from env might have escaped newlines, so we need to replace them
  const privateKey = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n");

  return new auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes,
  });
}

/**
 * Scopes required for Drive and Slides operations
 */
export const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
];

export const SLIDES_SCOPES = [
  "https://www.googleapis.com/auth/presentations",
  "https://www.googleapis.com/auth/presentations.readonly",
];

/**
 * Combined scopes for Drive and Slides operations
 */
export const DRIVE_AND_SLIDES_SCOPES = [...DRIVE_SCOPES, ...SLIDES_SCOPES];
