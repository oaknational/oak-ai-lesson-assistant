// cspell:ignore ARMOR ModelArmor
import { GoogleAuth } from "google-auth-library";
import { z } from "zod";

import { createWorkloadIdentityAccessTokenProvider } from "./ModelArmorClient";

const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const MODEL_ARMOR_AUTH_MODES = [
  "service_account", // intended for local dev
  "workload_identity", // OIDC-based auth for staging/production
] as const;

const serviceAccountCredentialsSchema = z.object({
  client_email: z.string(),
  private_key: z.string(),
  project_id: z.string().optional(),
  token_uri: z.string().optional(),
  type: z.string().optional(),
});

export type ModelArmorAuthMode = (typeof MODEL_ARMOR_AUTH_MODES)[number];
type EnvLike = Record<string, string | undefined>;

type ModelArmorAuthDependencies = {
  GoogleAuthCtor?: typeof GoogleAuth;
  createWorkloadIdentityAccessTokenProviderFn?: typeof createWorkloadIdentityAccessTokenProvider;
  getRuntimeSubjectTokenFn?: () => Promise<string>;
};

function getRequiredEnvValue(env: EnvLike, name: string): string {
  const value = env[name];

  if (!value) {
    throw new Error(`${name} environment variable not set`);
  }

  return value;
}

function getModelArmorAuthMode(env: EnvLike): ModelArmorAuthMode {
  const authMode = getRequiredEnvValue(
    env,
    "MODEL_ARMOR_AUTH_MODE",
  ) as ModelArmorAuthMode;

  if (!MODEL_ARMOR_AUTH_MODES.includes(authMode)) {
    throw new Error(
      "MODEL_ARMOR_AUTH_MODE must be one of: service_account, workload_identity",
    );
  }

  return authMode;
}

function createServiceAccountAccessTokenProvider(
  credentialsJson: string,
  GoogleAuthCtor: typeof GoogleAuth = GoogleAuth,
): () => Promise<string> {
  const parsedCredentials = serviceAccountCredentialsSchema.parse(
    JSON.parse(credentialsJson),
  );
  const auth = new GoogleAuthCtor({
    credentials: parsedCredentials,
    scopes: [CLOUD_PLATFORM_SCOPE],
  });

  return async () => {
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken =
      typeof accessTokenResponse === "string"
        ? accessTokenResponse
        : accessTokenResponse?.token;

    if (!accessToken) {
      throw new Error("Failed to acquire Model Armor access token");
    }

    return accessToken;
  };
}

async function getVercelOidcSubjectToken(): Promise<string> {
  const { getVercelOidcToken } = await import("@vercel/oidc");
  return getVercelOidcToken();
}

export function createModelArmorAccessTokenProvider(
  env: EnvLike = process.env,
  dependencies: ModelArmorAuthDependencies = {},
): () => Promise<string> {
  const GoogleAuthCtor = dependencies.GoogleAuthCtor ?? GoogleAuth;
  const createWorkloadIdentityAccessTokenProviderFn =
    dependencies.createWorkloadIdentityAccessTokenProviderFn ??
    createWorkloadIdentityAccessTokenProvider;
  const getRuntimeSubjectTokenFn =
    dependencies.getRuntimeSubjectTokenFn ?? getVercelOidcSubjectToken;
  const authMode = getModelArmorAuthMode(env);

  switch (authMode) {
    case "service_account":
      return createServiceAccountAccessTokenProvider(
        getRequiredEnvValue(
          env,
          "MODEL_ARMOR_SERVICE_ACCOUNT_CREDENTIALS_JSON",
        ),
        GoogleAuthCtor,
      );
    case "workload_identity":
      return createWorkloadIdentityAccessTokenProviderFn({
        getSubjectToken: async () =>
          env.MODEL_ARMOR_SUBJECT_TOKEN ?? (await getRuntimeSubjectTokenFn()),
        projectNumber: getRequiredEnvValue(env, "MODEL_ARMOR_PROJECT_NUMBER"),
        serviceAccountEmail: getRequiredEnvValue(
          env,
          "MODEL_ARMOR_SERVICE_ACCOUNT_EMAIL",
        ),
        workloadIdentityPoolId: getRequiredEnvValue(
          env,
          "MODEL_ARMOR_WORKLOAD_IDENTITY_POOL_ID",
        ),
        workloadIdentityPoolProviderId: getRequiredEnvValue(
          env,
          "MODEL_ARMOR_WORKLOAD_IDENTITY_POOL_PROVIDER_ID",
        ),
      });
  }
}
