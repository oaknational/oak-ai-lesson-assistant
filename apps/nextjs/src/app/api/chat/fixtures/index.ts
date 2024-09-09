import { FixtureLoggerLLMService } from "./FixtureLoggerLLMService";
import { FixtureReplayLLMService } from "./FixtureReplayLLMService";

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
    return new FixtureLoggerLLMService(fixtureName, chatId);
  }

  if (fixtureMode === "replay") {
    console.log("Using fixtureMode=replay");
    return new FixtureReplayLLMService(fixtureName);
  }
}
