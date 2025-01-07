import { MockLLMService } from "@oakai/aila/src/core/llm/MockLLMService";
import { aiLogger } from "@oakai/logger";
import fs from "fs";

const log = aiLogger("fixtures");

export class FixtureReplayLLMService extends MockLLMService {
  name = "FixtureReplayLLM";

  constructor(fixtureName: string) {
    log.info("Setting up fixture", fixtureName);
    const fileUrl = `${process.cwd()}/tests-e2e/recordings/${fixtureName}.chunks.txt`;
    log.info("Loading chunks from", fileUrl);
    const fixture = fs.readFileSync(fileUrl, "utf8");

    const chunks = fixture
      .split("\n")
      .map((c) => c.replaceAll("__NEWLINE__", "\n"));

    let objectFixture: object;

    try {
      const fileUrlForObjectStream = `${process.cwd()}/tests-e2e/recordings/${fixtureName}.generateObject.formatted.json`;
      const fileContent = fs.readFileSync(fileUrlForObjectStream, "utf8");
      objectFixture = JSON.parse(fileContent);
    } catch (error) {
      log.error("Failed to parse object fixture from file", { error });
      objectFixture = {}; // Fallback to an empty object or any default value
    }
    super(chunks, objectFixture);
  }
}
