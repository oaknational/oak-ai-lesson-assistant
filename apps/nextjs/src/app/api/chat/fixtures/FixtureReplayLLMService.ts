import { MockLLMService } from "@oakai/aila/src/core/llm/MockLLMService";
import { aiLogger } from "@oakai/logger";
import fs from "fs";

const log = aiLogger("fixtures");

export class FixtureReplayLLMService extends MockLLMService {
  name = "FixtureReplayLLM";

  constructor(fixtureName: string) {
    const fileUrl = `${process.cwd()}/tests-e2e/recordings/${fixtureName}.chunks.txt`;
    log.info("Loading chunks from", fileUrl);
    const fixture = fs.readFileSync(fileUrl, "utf8");

    const chunks = fixture
      .split("\n")
      .map((c) => c.replaceAll("__NEWLINE__", "\n"));

    super(chunks);
  }
}
