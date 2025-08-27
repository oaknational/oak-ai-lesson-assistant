#!/usr/bin/env tsx
import { aiLogger } from "@oakai/logger";

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import { VALID_SURVEY_NAMES } from "@/lib/posthog/surveys/surveysTypes.generated";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const log = aiLogger("posthog-surveys");

// PostHog Survey API types based on the response structure
interface PostHogSurvey {
  id: string;
  name: string;
  description: string;
  type: string;
  created_at: string;
  archived: boolean;
}

// PostHog configuration from environment
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_KEY_FLAGS;
const POSTHOG_PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT;

// Fetch surveys from PostHog API
async function fetchPostHogSurveys(): Promise<string[]> {
  if (!POSTHOG_HOST || !POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
    log.error("Missing required PostHog environment variables.");
    throw new Error(
      "Environment variables NEXT_PUBLIC_POSTHOG_HOST, POSTHOG_API_KEY, and POSTHOG_PROJECT_ID must be set.",
    );
  }

  try {
    log.info(
      ` Fetching surveys from ${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/surveys/`,
    );

    const response = await fetch(
      `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/surveys/`,
      {
        headers: {
          Authorization: `Bearer ${POSTHOG_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch surveys: ${response.status} ${response.statusText}`,
      );
    }

    const data: { results: PostHogSurvey[] } = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      log.error("Unexpected API response format:", data);
      throw new Error("Unexpected API response format");
    }

    const surveyNames = data.results
      .map((survey: { id: string; name: string }) => survey.name)
      .filter(
        (name: string): name is string =>
          typeof name === "string" && name.length > 0,
      );

    log.info(
      `Found ${surveyNames.length} survey(s): ${surveyNames.join(", ")}`,
    );

    if (surveyNames.length === 0) {
      log.error("No surveys found, using fallback names");
      return [...VALID_SURVEY_NAMES];
    }

    const codebaseSurveyNames = [...VALID_SURVEY_NAMES];

    const missingInPostHog = codebaseSurveyNames.filter(
      (name) => !surveyNames.includes(name),
    );

    if (missingInPostHog.length > 0) {
      log.error("Survey names not found in PostHog:");
      missingInPostHog.forEach((name) => log.error(`  - "${name}"`));
      process.exit(1);
    }

    return surveyNames;
  } catch (error) {
    log.error("Error fetching PostHog surveys:", error);
    log.error("Falling back to hardcoded survey names");

    // Fallback to current known survey names
    return [...VALID_SURVEY_NAMES];
  }
}

function generateSurveyTypes(surveyNames: string[]): string {
  const unionType = surveyNames.map((name) => `  | "${name}"`).join("\n");
  const timestamp = new Date().toISOString();

  return `// This file is auto-generated. Do not edit manually.
// Run 'pnpm run generate-survey-types' to regenerate.
// Generated on: ${timestamp}
// Source: PostHog API (${surveyNames.length} surveys found)

/**
 * Valid PostHog survey names.
 * These correspond to surveys configured in PostHog.
 */
export type PostHogSurveyName = 
${unionType};


export const VALID_SURVEY_NAMES: readonly PostHogSurveyName[] = [
${surveyNames.map((name) => `  "${name}",`).join("\n")}
] as const;


`;
}

async function generateTypes() {
  log.info("🔄 Generating PostHog survey types...");

  try {
    const surveyNames = await fetchPostHogSurveys();
    const typeDefinitions = generateSurveyTypes(surveyNames);

    const outputPath = path.join(
      __dirname,
      "../src/lib/posthog/surveys/surveysTypes.generated.ts",
    );
    fs.writeFileSync(outputPath, typeDefinitions);

    log.info(`Generated survey types at ${outputPath}`);
    log.info(`Found ${surveyNames.length} survey(s)`);
  } catch (error) {
    log.error("Failed to generate survey types:", error);
    process.exit(1);
  }
}

generateTypes().catch(log.error);
