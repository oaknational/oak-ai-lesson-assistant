import createClient from "openapi-fetch";

import { aiLogger } from "@oakai/logger";

import type { operations, paths } from "../../generated/moderation-api";

const log = aiLogger("core");

export interface OakModerationServiceClientConfig {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
}

/**
 * Response type from the moderation service
 */
export type ModerationServiceResponse =
  operations["moderateContent"]["responses"]["200"]["content"]["application/json"];

/**
 * Union type of all valid moderation category strings
 */
export type ModerationCategory = ModerationServiceResponse["categories"][number];

/**
 * Type-safe client for the Oak AI Moderation Service.
 * Uses openapi-fetch with generated types from the OpenAPI spec.
 */
export class OakModerationServiceClient {
  private readonly client: ReturnType<typeof createClient<paths>>;
  private readonly timeoutMs: number;

  constructor(config: OakModerationServiceClientConfig) {
    this.client = createClient<paths>({
      baseUrl: config.baseUrl,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });
    this.timeoutMs = config.timeoutMs ?? 30000;
  }

  async moderate(content: string): Promise<ModerationServiceResponse> {
    log.info("Calling Oak Moderation Service", {
      contentLength: content.length,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const { data, error, response } = await this.client.POST("/v0/moderate", {
        body: { content },
        signal: controller.signal,
      });

      if (error) {
        log.error("Oak Moderation Service error", {
          status: response.status,
          error,
        });
        throw new OakModerationServiceError(
          `Moderation service returned ${response.status}: ${error.error}`,
          response.status,
        );
      }

      log.info("Oak Moderation Service response received", {
        categoriesCount: data.categories.length,
        scores: data.scores,
      });

      return data;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export class OakModerationServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "OakModerationServiceError";
  }
}
