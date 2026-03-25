// cspell:ignore ARMOR ModelArmor
import type { GoogleAuth } from "google-auth-library";

import type { WorkloadIdentityAccessTokenProviderConfig } from "../ModelArmorClient";
import { createModelArmorAccessTokenProvider } from "../modelArmorAuth";

describe("createModelArmorAccessTokenProvider", () => {
  let mockGoogleAuthGetAccessToken: jest.Mock;
  let mockGoogleAuthGetClient: jest.Mock;
  let mockGoogleAuthCtor: jest.Mock;
  let mockCreateWorkloadIdentityAccessTokenProvider: jest.Mock;
  let mockGetRuntimeSubjectToken: jest.Mock;
  let workloadIdentityConfig:
    | WorkloadIdentityAccessTokenProviderConfig
    | undefined;

  beforeEach(() => {
    mockGoogleAuthGetAccessToken = jest
      .fn()
      .mockResolvedValue("service-account-token");
    mockGoogleAuthGetClient = jest.fn().mockResolvedValue({
      getAccessToken: mockGoogleAuthGetAccessToken,
    });
    mockGoogleAuthCtor = jest.fn().mockImplementation((config) => ({
      config,
      getClient: mockGoogleAuthGetClient,
    }));
    workloadIdentityConfig = undefined;
    mockCreateWorkloadIdentityAccessTokenProvider = jest
      .fn()
      .mockImplementation(
        (config: WorkloadIdentityAccessTokenProviderConfig) => {
          workloadIdentityConfig = config;
          return async () => Promise.resolve("wif-token");
        },
      );
    mockGetRuntimeSubjectToken = jest.fn().mockResolvedValue("runtime-token");
  });

  it("uses service-account auth when configured", async () => {
    const getAccessToken = createModelArmorAccessTokenProvider(
      {
        MODEL_ARMOR_AUTH_MODE: "service_account",
        MODEL_ARMOR_SERVICE_ACCOUNT_CREDENTIALS_JSON: JSON.stringify({
          client_email: "svc@example.iam.gserviceaccount.com",
          private_key:
            "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
          type: "service_account",
        }),
      },
      {
        GoogleAuthCtor: mockGoogleAuthCtor as unknown as typeof GoogleAuth,
        createWorkloadIdentityAccessTokenProviderFn:
          mockCreateWorkloadIdentityAccessTokenProvider,
        getRuntimeSubjectTokenFn: mockGetRuntimeSubjectToken,
      },
    );

    await expect(getAccessToken()).resolves.toBe("service-account-token");
    expect(mockGoogleAuthCtor).toHaveBeenCalledWith({
      credentials: expect.objectContaining({
        client_email: "svc@example.iam.gserviceaccount.com",
      }),
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    expect(
      mockCreateWorkloadIdentityAccessTokenProvider,
    ).not.toHaveBeenCalled();
  });

  it("uses workload identity auth when configured", async () => {
    const getAccessToken = createModelArmorAccessTokenProvider(
      {
        MODEL_ARMOR_AUTH_MODE: "workload_identity",
        MODEL_ARMOR_PROJECT_NUMBER: "123456789",
        MODEL_ARMOR_SERVICE_ACCOUNT_EMAIL:
          "svc@example.iam.gserviceaccount.com",
        MODEL_ARMOR_WORKLOAD_IDENTITY_POOL_ID: "pool-id",
        MODEL_ARMOR_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: "provider-id",
      },
      {
        GoogleAuthCtor: mockGoogleAuthCtor as unknown as typeof GoogleAuth,
        createWorkloadIdentityAccessTokenProviderFn:
          mockCreateWorkloadIdentityAccessTokenProvider,
        getRuntimeSubjectTokenFn: mockGetRuntimeSubjectToken,
      },
    );

    await expect(getAccessToken()).resolves.toBe("wif-token");
    expect(mockCreateWorkloadIdentityAccessTokenProvider).toHaveBeenCalledWith({
      getSubjectToken: expect.any(Function),
      projectNumber: "123456789",
      serviceAccountEmail: "svc@example.iam.gserviceaccount.com",
      workloadIdentityPoolId: "pool-id",
      workloadIdentityPoolProviderId: "provider-id",
    });
    expect(mockGoogleAuthCtor).not.toHaveBeenCalled();
  });

  it("uses an explicit subject token override when present", async () => {
    const getAccessToken = createModelArmorAccessTokenProvider(
      {
        MODEL_ARMOR_AUTH_MODE: "workload_identity",
        MODEL_ARMOR_PROJECT_NUMBER: "123456789",
        MODEL_ARMOR_SERVICE_ACCOUNT_EMAIL:
          "svc@example.iam.gserviceaccount.com",
        MODEL_ARMOR_WORKLOAD_IDENTITY_POOL_ID: "pool-id",
        MODEL_ARMOR_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: "provider-id",
        MODEL_ARMOR_SUBJECT_TOKEN: "subject-token",
      },
      {
        GoogleAuthCtor: mockGoogleAuthCtor as unknown as typeof GoogleAuth,
        createWorkloadIdentityAccessTokenProviderFn:
          mockCreateWorkloadIdentityAccessTokenProvider,
        getRuntimeSubjectTokenFn: mockGetRuntimeSubjectToken,
      },
    );

    await expect(getAccessToken()).resolves.toBe("wif-token");
    expect(workloadIdentityConfig).toBeDefined();
    if (!workloadIdentityConfig) {
      throw new Error("Expected workload identity config to be defined");
    }

    await expect(workloadIdentityConfig.getSubjectToken()).resolves.toBe(
      "subject-token",
    );
    expect(mockGetRuntimeSubjectToken).not.toHaveBeenCalled();
  });

  it("throws when MODEL_ARMOR_AUTH_MODE is missing", () => {
    expect(() => createModelArmorAccessTokenProvider({})).toThrow(
      "MODEL_ARMOR_AUTH_MODE environment variable not set",
    );
  });

  it("throws when service-account credentials are missing", () => {
    expect(() =>
      createModelArmorAccessTokenProvider({
        MODEL_ARMOR_AUTH_MODE: "service_account",
      }),
    ).toThrow(
      "MODEL_ARMOR_SERVICE_ACCOUNT_CREDENTIALS_JSON environment variable not set",
    );
  });

  it("throws when MODEL_ARMOR_AUTH_MODE is invalid", () => {
    expect(() =>
      createModelArmorAccessTokenProvider({
        MODEL_ARMOR_AUTH_MODE: "something_else",
      }),
    ).toThrow(
      "MODEL_ARMOR_AUTH_MODE must be one of: service_account, workload_identity",
    );
  });
});
