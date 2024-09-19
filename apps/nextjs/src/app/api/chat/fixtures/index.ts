import { FixtureRecordLLMService } from "./FixtureRecordLLMService";
import { FixtureRecordOpenAiClient } from "./FixtureRecordOpenAiClient";
import { FixtureReplayLLMService } from "./FixtureReplayLLMService";
import { FixtureReplayOpenAiClient } from "./FixtureReplayOpenAiClient";

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
    console.log("Using fixtureMode=record");
    return new FixtureRecordLLMService(fixtureName, chatId);
  }

  if (fixtureMode === "replay") {
    console.log("Using fixtureMode=replay");
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
    console.log("Using moderation fixtureMode=record");
    return new FixtureRecordOpenAiClient(fixtureName, chatId);
  }

  if (fixtureMode === "replay") {
    console.log("Using moderation fixtureMode=replay");
    return new FixtureReplayOpenAiClient(fixtureName);
  }
}
