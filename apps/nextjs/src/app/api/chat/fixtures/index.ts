import type { AgenticFixtureConfig } from "@oakai/aila/src/core/types";

import { aiLogger } from "@oakai/logger";

import { FixtureRecordLLMService } from "./FixtureRecordLLMService";
import { FixtureRecordOpenAiClient } from "./FixtureRecordOpenAiClient";
import { FixtureReplayLLMService } from "./FixtureReplayLLMService";
import { FixtureReplayOakModerator } from "./FixtureReplayOakModerator";
import { FixtureReplayOpenAiClient } from "./FixtureReplayOpenAiClient";
import type { OakModerationFixtureName } from "./oakModerationFixtures";
import { oakModerationFixtures } from "./oakModerationFixtures";

const log = aiLogger("fixtures");

const fixturesEnabled = process.env.AILA_FIXTURES_ENABLED === "true";

export function getFixtureLLMService(headers: Headers, chatId: string) {
  if (!fixturesEnabled) {
    return undefined;
  }

  const fixtureMode = headers.get("x-e2e-fixture-mode");
  const fixtureName = headers.get("x-e2e-fixture-name");

  if (!fixtureName) {
    return undefined;
  }

  if (fixtureMode === "record") {
    log.info("Using fixtureMode=record");
    return new FixtureRecordLLMService(fixtureName, chatId);
  }

  if (fixtureMode === "replay") {
    log.info("Using fixtureMode=replay");
    return new FixtureReplayLLMService(fixtureName);
  }
}

export function getFixtureModerationOpenAiClient(
  headers: Headers,
  chatId: string,
) {
  if (!fixturesEnabled) {
    return undefined;
  }

  const fixtureMode = headers.get("x-e2e-fixture-mode");
  const fixtureName = headers.get("x-e2e-fixture-name");

  if (!fixtureName) {
    return undefined;
  }

  if (fixtureMode === "record") {
    log.info("Using moderation fixtureMode=record");
    return new FixtureRecordOpenAiClient(fixtureName, chatId);
  }

  if (fixtureMode === "replay") {
    log.info("Using moderation fixtureMode=replay");
    return new FixtureReplayOpenAiClient(fixtureName);
  }
}

export function getFixtureOakModerator(headers: Headers) {
  if (!fixturesEnabled) {
    return undefined;
  }

  const fixtureMode = headers.get("x-e2e-fixture-mode");
  const scenarioName = headers.get("x-e2e-oak-moderation-fixture");

  if (!fixtureMode || !scenarioName) {
    return undefined;
  }

  if (!(scenarioName in oakModerationFixtures)) {
    throw new Error(
      `Unknown Oak moderation fixture: "${scenarioName}". Valid: ${Object.keys(oakModerationFixtures).join(", ")}`,
    );
  }

  if (fixtureMode === "replay") {
    log.info("Using Oak moderation fixture: %s", scenarioName);
    return new FixtureReplayOakModerator(
      scenarioName as OakModerationFixtureName,
    );
  }
}

export function getAgenticFixtureConfig(
  headers: Headers,
): AgenticFixtureConfig | undefined {
  if (!fixturesEnabled) {
    return undefined;
  }

  if (headers.get("x-e2e-aila-system") !== "agentic") {
    return undefined;
  }

  const fixtureMode = headers.get("x-e2e-fixture-mode");
  const fixtureName = headers.get("x-e2e-fixture-name");

  if (!fixtureName || (fixtureMode !== "record" && fixtureMode !== "replay")) {
    return undefined;
  }

  log.info("Using agentic fixture %s (%s)", fixtureName, fixtureMode);
  return { mode: fixtureMode, fixtureName };
}
