import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";

const log = aiLogger("teaching-materials");

export interface CurriculumApiConfig {
  authKey: string;
  graphqlEndpoint: string;
}

/**
 * Validates and returns curriculum API environment variables
 * @throws {TRPCError} When required environment variables are missing
 * @returns {CurriculumApiConfig} The validated environment configuration
 */
export function validateCurriculumApiEnv(): CurriculumApiConfig {
  const AUTH_KEY = process.env.CURRIC_DB_HASURA_AUTH_AILA_API_KEY;
  const GRAPHQL_ENDPOINT = process.env.CURRICULUM_API_URL;

  if (!AUTH_KEY || !GRAPHQL_ENDPOINT) {
    log.error("Missing environment variables", {
      AUTH_KEY: !!AUTH_KEY,
      GRAPHQL_ENDPOINT: !!GRAPHQL_ENDPOINT,
    });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Missing required environment variables",
    });
  }

  return {
    authKey: AUTH_KEY,
    graphqlEndpoint: GRAPHQL_ENDPOINT,
  };
}
