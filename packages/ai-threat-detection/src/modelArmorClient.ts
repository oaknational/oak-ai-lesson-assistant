const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const DEFAULT_LOCATION = "europe-west1";

export interface ModelArmorSanitizationResponse {
  sanitizationResult: {
    filterMatchState: string;
    invocationResult: string;
    filterResults?: {
      csam?: {
        csamFilterFilterResult?: {
          executionState?: string;
          matchState?: string;
        };
      };
      pi_and_jailbreak?: {
        piAndJailbreakFilterResult?: {
          executionState?: string;
          matchState?: string;
          confidenceLevel?: string;
        };
      };
      rai?: {
        raiFilterResult?: {
          executionState?: string;
          matchState?: string;
        };
      };
    };
    sanitizationMetadata?: Record<string, unknown>;
  };
}

export interface WorkloadIdentityAccessTokenProviderConfig {
  getSubjectToken: () => Promise<string>;
  projectNumber: string;
  serviceAccountEmail: string;
  workloadIdentityPoolId: string;
  workloadIdentityPoolProviderId: string;
}

export interface ModelArmorClientConfig {
  defaultTemplateId: string;
  getAccessToken: () => Promise<string>;
  location?: string;
  projectId: string;
}

export class ModelArmorClient {
  private readonly defaultTemplateId: string;
  private readonly getAccessToken: () => Promise<string>;
  private readonly location: string;
  private readonly projectId: string;

  constructor(config: ModelArmorClientConfig) {
    this.defaultTemplateId = config.defaultTemplateId;
    this.getAccessToken = config.getAccessToken;
    this.location = config.location ?? DEFAULT_LOCATION;
    this.projectId = config.projectId;
  }

  async sanitizeUserPrompt(
    text: string,
    templateId = this.defaultTemplateId,
  ): Promise<ModelArmorSanitizationResponse> {
    return this.callModelArmor(`${templateId}:sanitizeUserPrompt`, {
      userPromptData: { text },
    });
  }

  async sanitizeModelResponse({
    modelResponseText,
    templateId = this.defaultTemplateId,
    userPromptText,
  }: {
    modelResponseText: string;
    templateId?: string;
    userPromptText: string;
  }): Promise<ModelArmorSanitizationResponse> {
    return this.callModelArmor(`${templateId}:sanitizeModelResponse`, {
      modelResponseData: { text: modelResponseText },
      userPromptData: { text: userPromptText },
    });
  }

  private async callModelArmor(
    pathSuffix: string,
    body: Record<string, unknown>,
  ): Promise<ModelArmorSanitizationResponse> {
    const accessToken = await this.getAccessToken();
    const response = await fetch(this.buildUrl(pathSuffix), {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const responseBody = (await response.json()) as unknown;

    if (!response.ok) {
      throw new Error(
        `Model Armor request failed: ${response.status} ${response.statusText}\n${JSON.stringify(
          responseBody,
          null,
          2,
        )}`,
      );
    }

    return responseBody as ModelArmorSanitizationResponse;
  }

  private buildUrl(pathSuffix: string) {
    const resourcePath = [
      "projects",
      this.projectId,
      "locations",
      this.location,
      "templates",
      pathSuffix,
    ].join("/");

    return `https://modelarmor.${this.location}.rep.googleapis.com/v1/${resourcePath}`;
  }
}

export function createWorkloadIdentityAccessTokenProvider({
  getSubjectToken,
  projectNumber,
  serviceAccountEmail,
  workloadIdentityPoolId,
  workloadIdentityPoolProviderId,
}: WorkloadIdentityAccessTokenProviderConfig) {
  return async () => {
    const subjectToken = await getSubjectToken();
    const audience = `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${workloadIdentityPoolId}/providers/${workloadIdentityPoolProviderId}`;

    const stsResponse = await fetch("https://sts.googleapis.com/v1/token", {
      body: new URLSearchParams({
        audience,
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        requested_token_type:
          "urn:ietf:params:oauth:token-type:access_token",
        scope: CLOUD_PLATFORM_SCOPE,
        subject_token: subjectToken,
        subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const stsBody = (await stsResponse.json()) as
      | {
          access_token?: string;
          error?: string;
          error_description?: string;
        }
      | undefined;

    if (!stsResponse.ok || !stsBody?.access_token) {
      throw new Error(
        `STS token exchange failed: ${stsResponse.status} ${stsResponse.statusText}\n${JSON.stringify(
          stsBody,
          null,
          2,
        )}`,
      );
    }

    const impersonationResponse = await fetch(
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
      {
        body: JSON.stringify({
          scope: [CLOUD_PLATFORM_SCOPE],
        }),
        headers: {
          Authorization: `Bearer ${stsBody.access_token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    const impersonationBody = (await impersonationResponse.json()) as
      | {
          accessToken?: string;
          error?: {
            code?: number;
            message?: string;
            status?: string;
          };
        }
      | undefined;

    if (!impersonationResponse.ok || !impersonationBody?.accessToken) {
      throw new Error(
        `IAM Credentials impersonation failed: ${impersonationResponse.status} ${impersonationResponse.statusText}\n${JSON.stringify(
          impersonationBody,
          null,
          2,
        )}`,
      );
    }

    return impersonationBody.accessToken;
  };
}

export function getPromptInjectionMatchState(
  response: ModelArmorSanitizationResponse,
) {
  return (
    response.sanitizationResult.filterResults?.pi_and_jailbreak
      ?.piAndJailbreakFilterResult?.matchState ?? null
  );
}

export function isThreatDetected(response: ModelArmorSanitizationResponse) {
  return response.sanitizationResult.filterMatchState === "MATCH_FOUND";
}
