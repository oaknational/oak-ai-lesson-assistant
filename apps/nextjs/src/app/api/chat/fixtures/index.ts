import { aiLogger } from "@oakai/logger";

import { FixtureRecordLLMService } from "./FixtureRecordLLMService";
import { FixtureRecordOpenAiClient } from "./FixtureRecordOpenAiClient";
import { FixtureReplayLLMService } from "./FixtureReplayLLMService";
import { FixtureReplayOpenAiClient } from "./FixtureReplayOpenAiClient";

const log = aiLogger("fixtures");

const fixturesEnabled = process.env.AILA_FIXTURES_ENABLED === "true";

export function getFixtureLLMService(headers: Headers, chatId: string) {
  if (!fixturesEnabled) {
    return undefined;
  }

  const fixtureMode = headers.get("x-e2e-fixture-mode");
  const fixtureName = headers.get("x-e2e-fixture-name");

  if (!fixtureName) {
    log.info("Not using fixtures");
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
