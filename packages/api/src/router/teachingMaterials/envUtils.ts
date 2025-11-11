import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";

const log = aiLogger("teaching-materials");

export interface CurriculumApiConfig {
  authKey: string;
  authType: string;
  graphqlEndpoint: string;
}

/**
 * Validates and returns curriculum API environment variables
 * @throws {TRPCError} When required environment variables are missing
 * @returns {CurriculumApiConfig} The validated environment configuration
 */
export function validateCurriculumApiEnv(): CurriculumApiConfig {
  const AUTH_KEY = process.env.CURRICULUM_API_AUTH_KEY;
  const AUTH_TYPE = process.env.CURRICULUM_API_AUTH_TYPE;
  const GRAPHQL_ENDPOINT = process.env.CURRICULUM_API_URL;

  if (!AUTH_KEY || !AUTH_TYPE || !GRAPHQL_ENDPOINT) {
    log.error("Missing environment variables", {
      AUTH_KEY: !!AUTH_KEY,
      AUTH_TYPE: !!AUTH_TYPE,
      GRAPHQL_ENDPOINT: !!GRAPHQL_ENDPOINT,
    });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Missing required environment variables",
    });
  }

  return {
    authKey: AUTH_KEY,
    authType: AUTH_TYPE,
    graphqlEndpoint: GRAPHQL_ENDPOINT,
  };
}
