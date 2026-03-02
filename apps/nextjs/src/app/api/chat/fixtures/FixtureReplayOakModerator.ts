import { AilaModerator } from "@oakai/aila/src/features/moderation/moderators";
import { aiLogger } from "@oakai/logger";

import type { OakModerationFixtureName } from "./oakModerationFixtures";
import { oakModerationFixtures } from "./oakModerationFixtures";

const log = aiLogger("fixtures");

export class FixtureReplayOakModerator extends AilaModerator {
  constructor(private readonly scenarioName: OakModerationFixtureName) {
    super({});
  }

  async moderate() {
    log.info("Using Oak moderation fixture: %s", this.scenarioName);
    return oakModerationFixtures[this.scenarioName];
  }
}
