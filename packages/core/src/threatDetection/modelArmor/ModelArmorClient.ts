import { ExternalAccountClient } from "google-auth-library";
import type {
  BaseExternalAccountClient,
  ExternalAccountClientOptions,
} from "google-auth-library";

import { aiLogger } from "@oakai/logger";

import {
  modelArmorCredentialsSchema,
  modelArmorRequestSchema,
  modelArmorSanitizeUserPromptResponseSchema,
  normalizeModelArmorFilterResults,
  type ModelArmorSanitizeUserPromptResponse,
} from "./schema";

const log = aiLogger("core");

const MODEL_ARMOR_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

export interface ModelArmorClientConfig {
  credentialsJson: string;
  projectId: string;
  location: string;
  templateId: string;
  apiBaseUrl?: string;
}

export class ModelArmorClient {
  private readonly authClient: BaseExternalAccountClient;
  private readonly apiBaseUrl: string;
  private readonly templateName: string;

  constructor(config: ModelArmorClientConfig) {
    const credentials = modelArmorCredentialsSchema.parse(
      JSON.parse(config.credentialsJson),
    ) as unknown as ExternalAccountClientOptions;
    const authClient = ExternalAccountClient.fromJSON(credentials);

    if (!authClient) {
      throw new Error("Failed to create Model Armor auth client");
    }

    (
      authClient as BaseExternalAccountClient & {
        scopes?: string | string[];
      }
    ).scopes = [MODEL_ARMOR_SCOPE];

    this.authClient = authClient;
    this.apiBaseUrl =
      config.apiBaseUrl?.replace(/\/$/u, "") ?? "https://modelarmor.googleapis.com";
    this.templateName = `projects/${config.projectId}/locations/${config.location}/templates/${config.templateId}`;

    log.info("ModelArmorClient initialized", {
      apiBaseUrl: this.apiBaseUrl,
      templateName: this.templateName,
    });
  }

  async sanitizeUserPrompt(
    prompt: string,
  ): Promise<ModelArmorSanitizeUserPromptResponse> {
    const accessTokenResponse = await this.authClient.getAccessToken();
    const accessToken = accessTokenResponse.token;

    if (!accessToken) {
      throw new Error("Failed to acquire Model Armor access token");
    }

    const requestBody = modelArmorRequestSchema.parse({
      userPromptData: {
        text: prompt,
      },
    });

    const url = `${this.apiBaseUrl}/v1/${this.templateName}:sanitizeUserPrompt`;

    log.info("Model Armor API request", {
      url,
      promptLength: prompt.length,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    if (!response.ok) {
      log.error("Model Armor API error", {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseData,
      });
      throw new Error(
        `Model Armor API error: ${response.status} ${response.statusText}`,
      );
    }

    const parsed =
      modelArmorSanitizeUserPromptResponseSchema.parse(responseData);
    const requestId =
      response.headers.get("x-request-id") ??
      response.headers.get("x-goog-request-id") ??
      undefined;

    return {
      requestId,
      rawResponse: parsed,
      sanitizationResult: {
        ...parsed.sanitizationResult,
        filterResults: normalizeModelArmorFilterResults(
          parsed.sanitizationResult.filterResults,
        ),
      },
    };
  }
}
