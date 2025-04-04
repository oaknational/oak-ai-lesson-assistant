import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";

import { AilaModerationError, AilaModerator } from ".";

const log = aiLogger("aila:testing");

export class MockModerator extends AilaModerator {
  private _mockedResults: ModerationResult[] = [];

  constructor(results: ModerationResult[]) {
    super({});
    this._mockedResults = results;
  }

  async moderate(input: string): Promise<ModerationResult> {
    const result = this._mockedResults.shift();
    log.info("Mock moderation: ", input, result);

    if (!result) {
      throw new AilaModerationError("No more mocked results");
    }
    return Promise.resolve(result);
  }

  public reset(newResults?: ModerationResult[]) {
    this._mockedResults = newResults ?? [];
  }

  public push(result: ModerationResult) {
    this._mockedResults.push(result);
  }
}
